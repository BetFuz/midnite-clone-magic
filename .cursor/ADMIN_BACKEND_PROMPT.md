# Betfuz Admin Backend - Complete Implementation Guide for Cursor

## Project Overview

Betfuz is a Nigerian sports betting platform requiring a **sophisticated admin backend** capable of controlling all platform operations. This prompt provides complete specifications for building production-grade admin infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │ Admin UI    │───▶│ API Gateway │───▶│ Supabase Edge Functions │ │
│  │ (React)     │    │ (Security)  │    │ (Business Logic)        │ │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘ │
│         │                 │                       │                 │
│         │                 ▼                       ▼                 │
│         │          ┌─────────────┐    ┌─────────────────────────┐ │
│         │          │ Rate Limit  │    │ Supabase PostgreSQL     │ │
│         │          │ IP Allowlist│    │ (RLS + Audit Logs)      │ │
│         │          │ MFA Check   │    └─────────────────────────┘ │
│         │          └─────────────┘                                 │
│         │                                                          │
│         └──────────────────────────────────────────────────────────│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. DATABASE SCHEMA

### Core Admin Tables

```sql
-- User Roles (CRITICAL: Separate from profiles to prevent privilege escalation)
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'superadmin', 'trader', 'support', 'finance', 'compliance');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE (user_id, role)
);

-- Admin Audit Log (Immutable append-only)
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  payload_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  mfa_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform Settings
CREATE TABLE public.platform_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Sessions (Track active admin sessions)
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  mfa_verified BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT
);

-- Rate Limiting
CREATE TABLE public.admin_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  window_end TIMESTAMPTZ NOT NULL
);

-- IP Allowlist
CREATE TABLE public.admin_ip_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  description TEXT,
  added_by UUID,
  added_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Security Alerts
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  affected_user_id UUID,
  metadata JSONB,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Settings
CREATE TABLE public.admin_webhook_settings (
  id SERIAL PRIMARY KEY,
  bet_placed TEXT,
  bet_won TEXT,
  bet_lost TEXT,
  deposit TEXT,
  withdrawal TEXT,
  user_registered TEXT,
  kyc_completed TEXT,
  suspicious_activity TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Security Functions

```sql
-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Check if user is admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'superadmin')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Log admin action (immutable)
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _admin_id UUID,
  _action TEXT,
  _resource_type TEXT,
  _resource_id TEXT DEFAULT NULL,
  _payload_hash TEXT DEFAULT NULL,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL,
  _mfa_verified BOOLEAN DEFAULT false,
  _status TEXT DEFAULT 'success',
  _error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id, action, resource_type, resource_id,
    payload_hash, ip_address, user_agent,
    mfa_verified, status, error_message
  ) VALUES (
    _admin_id, _action, _resource_type, _resource_id,
    _payload_hash, _ip_address, _user_agent,
    _mfa_verified, _status, _error_message
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
```

### RLS Policies

```sql
-- Admin Audit Log: Read-only for admins, insert via function
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Platform Settings: Admins can read, superadmins can modify
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view settings"
ON public.platform_settings FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Superadmins can modify settings"
ON public.platform_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

-- User Roles: Only superadmins can modify
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Superadmins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));
```

---

## 2. EDGE FUNCTIONS SPECIFICATIONS

### 2.1 Admin API Gateway (`admin-api-gateway`)

**Purpose**: Central entry point for all admin requests with security validation.

```typescript
// supabase/functions/admin-api-gateway/index.ts

interface AdminValidationResult {
  valid: boolean;
  error?: string;
  adminId?: string;
  role?: string;
  mfaVerified?: boolean;
}

// Security Configuration
const SECURITY_CONFIG = {
  ENABLE_IP_WHITELIST: Deno.env.get('ADMIN_ENABLE_IP_WHITELIST') === 'true',
  REQUIRE_MFA: Deno.env.get('ADMIN_REQUIRE_MFA') === 'true',
  MAX_TOKEN_AGE: parseInt(Deno.env.get('ADMIN_MAX_TOKEN_AGE') || '3600'),
  RATE_LIMIT_WINDOW: 60, // seconds
  RATE_LIMIT_MAX: 100, // requests per window
};

// Validation Steps:
// 1. Check IP allowlist (if enabled)
// 2. Validate JWT token
// 3. Check token age
// 4. Verify admin role
// 5. Check MFA status (if required)
// 6. Rate limiting
// 7. Log access attempt
// 8. Route to appropriate service
```

### 2.2 User Management (`admin-user-management`)

**Purpose**: Complete user lifecycle management.

```typescript
// Actions supported:
interface UserManagementActions {
  // User Details
  'get_user_details': { userId: string };
  'search_users': { query: string; filters: UserFilters };
  
  // Role Management
  'update_role': { userId: string; role: string; expiresAt?: string };
  'revoke_role': { userId: string; role: string };
  
  // Account Actions
  'suspend_user': { userId: string; reason: string; duration?: number };
  'unsuspend_user': { userId: string };
  'force_logout': { userId: string };
  'reset_password': { userId: string };
  
  // Balance Management
  'update_balance': { userId: string; amount: number; reason: string };
  'freeze_balance': { userId: string; reason: string };
  'unfreeze_balance': { userId: string };
  
  // KYC Management
  'approve_kyc': { userId: string; verifiedBy: string };
  'reject_kyc': { userId: string; reason: string };
  'request_kyc_resubmission': { userId: string; reason: string };
}

// Response includes full user profile with:
// - Profile data
// - Roles and permissions
// - Recent bets (last 50)
// - Statistics (total bets, total staked, win rate)
// - KYC status
// - Responsible gaming limits
// - Suspension history
// - Login history
```

### 2.3 Bet Management (`admin-bet-management`)

**Purpose**: Complete bet lifecycle control.

```typescript
interface BetManagementActions {
  // Bet Operations
  'get_bet_details': { betSlipId: string };
  'search_bets': { filters: BetFilters; pagination: Pagination };
  
  // Settlement
  'settle_bet': { betSlipId: string; outcome: 'won' | 'lost' | 'void'; reason?: string };
  'settle_match_bets': { matchId: string; results: MatchResults };
  'auto_settle': { matchIds?: string[] };
  
  // Bet Modifications
  'void_bet': { betSlipId: string; reason: string };
  'refund_bet': { betSlipId: string; reason: string };
  'partial_refund': { betSlipId: string; amount: number; reason: string };
  
  // Cash Out
  'approve_cashout': { cashoutId: string };
  'reject_cashout': { cashoutId: string; reason: string };
  'manual_cashout': { betSlipId: string; amount: number };
  
  // Risk Management
  'flag_bet': { betSlipId: string; flagType: string; notes: string };
  'review_flagged_bet': { betSlipId: string; decision: string };
}
```

### 2.4 Platform Control (`admin-platform-control`)

**Purpose**: Platform-wide operations and settings.

```typescript
interface PlatformControlActions {
  // Platform Status
  'get_platform_overview': {};
  'get_system_health': {};
  
  // Platform Controls
  'suspend_platform': { reason: string; expectedDuration?: number };
  'resume_platform': {};
  'enable_maintenance_mode': { message: string };
  'disable_maintenance_mode': {};
  
  // Feature Toggles
  'toggle_feature': { feature: string; enabled: boolean };
  'get_feature_flags': {};
  
  // Odds Management
  'suspend_market': { matchId: string; market: string; reason: string };
  'resume_market': { matchId: string; market: string };
  'update_odds': { matchId: string; market: string; odds: OddsUpdate };
  'apply_odds_margin': { sportId: string; margin: number };
  
  // Match Management
  'cancel_match': { matchId: string; reason: string };
  'postpone_match': { matchId: string; newTime: string };
  'update_match_result': { matchId: string; result: MatchResult };
  
  // Bulk Operations
  'bulk_update': { table: string; filters: any; updates: any };
  'bulk_settle': { betIds: string[]; outcome: string };
}
```

### 2.5 Financial Management (`admin-financial`)

**Purpose**: Complete financial oversight and control.

```typescript
interface FinancialActions {
  // Reports
  'get_financial_summary': { startDate: string; endDate: string };
  'get_daily_report': { date: string };
  'get_revenue_breakdown': { period: string };
  'get_liability_report': {};
  
  // Deposits
  'search_deposits': { filters: DepositFilters };
  'approve_deposit': { depositId: string };
  'reject_deposit': { depositId: string; reason: string };
  'manual_credit': { userId: string; amount: number; reason: string; transactionType: string };
  
  // Withdrawals
  'search_withdrawals': { filters: WithdrawalFilters };
  'approve_withdrawal': { withdrawalId: string };
  'reject_withdrawal': { withdrawalId: string; reason: string };
  'manual_payout': { userId: string; amount: number; reason: string };
  
  // Reconciliation
  'get_reconciliation_report': { date: string };
  'reconcile_deposits': { provider: string; settlementFile: string };
  'flag_discrepancy': { type: string; amount: number; details: string };
  
  // Ledger
  'export_ledger': { startDate: string; endDate: string; userId?: string; format: 'csv' | 'json' };
  'audit_ledger': { userId: string };
  
  // Tax & Compliance
  'generate_tax_report': { period: string; state?: string };
  'calculate_ggr': { startDate: string; endDate: string };
}
```

### 2.6 Bonus & Promotions (`admin-bonus-management`)

**Purpose**: Complete bonus and promotion control.

```typescript
interface BonusActions {
  // Bonus Management
  'create_bonus': { bonus: BonusConfig };
  'update_bonus': { bonusId: string; updates: Partial<BonusConfig> };
  'deactivate_bonus': { bonusId: string };
  
  // User Bonuses
  'grant_bonus': { userId: string; bonusId: string; customAmount?: number };
  'revoke_bonus': { userId: string; bonusId: string; reason: string };
  'clear_rollover': { userId: string; bonusId: string };
  
  // Free Bets
  'issue_free_bet': { userId: string; amount: number; expiresIn: number; minOdds?: number };
  'revoke_free_bet': { freeBetId: string; reason: string };
  
  // Bonus Reports
  'get_bonus_report': { startDate: string; endDate: string };
  'get_abuse_report': { period: string };
  
  // Abuse Detection
  'flag_bonus_abuse': { userId: string; abuseType: string; details: string };
  'review_abuse_flag': { flagId: string; decision: 'valid' | 'invalid' };
}

interface BonusConfig {
  name: string;
  type: 'deposit' | 'signup' | 'reload' | 'free_bet' | 'cashback';
  percentage?: number;
  fixedAmount?: number;
  maxBonus: number;
  minDeposit?: number;
  rolloverMultiplier: number;
  minOdds: number;
  validDays: number;
  maxUsages?: number;
  targetUsers?: 'all' | 'new' | 'vip' | 'inactive';
}
```

### 2.7 Risk & Trading (`admin-risk-trading`)

**Purpose**: Risk management and trading operations.

```typescript
interface RiskTradingActions {
  // Exposure Management
  'get_exposure_dashboard': {};
  'get_market_exposure': { matchId: string; market: string };
  'get_liability_by_match': { matchId: string };
  
  // Risk Limits
  'set_user_limits': { userId: string; limits: UserLimits };
  'set_market_limits': { matchId: string; market: string; maxLiability: number };
  'set_global_limits': { limits: GlobalLimits };
  
  // Odds Compilation
  'override_odds': { matchId: string; market: string; odds: any; reason: string };
  'suspend_odds_feed': { feedId: string; reason: string };
  'switch_odds_provider': { primary: string; reason: string };
  
  // Bet Delays
  'configure_bet_delay': { league: string; delaySeconds: number };
  'get_pending_approvals': {};
  'approve_delayed_bet': { delayId: string };
  'reject_delayed_bet': { delayId: string; reason: string };
  
  // Early Payout
  'configure_early_payout': { config: EarlyPayoutConfig };
  'calculate_early_payout': { betSlipId: string };
  'offer_early_payout': { betSlipId: string; amount: number };
  
  // Suspicious Activity
  'get_suspicious_patterns': {};
  'investigate_pattern': { patternId: string };
  'block_correlated_accounts': { accountIds: string[]; reason: string };
}

interface UserLimits {
  maxStake: number;
  maxDailyLoss: number;
  maxPayout: number;
  betDelaySeconds?: number;
  requiresApproval: boolean;
}
```

### 2.8 Affiliate Management (`admin-affiliate`)

**Purpose**: Complete affiliate program control.

```typescript
interface AffiliateActions {
  // Affiliate Management
  'search_affiliates': { query: string; filters: AffiliateFilters };
  'get_affiliate_details': { affiliateId: string };
  
  // Tier Management
  'update_affiliate_tier': { affiliateId: string; tier: string };
  'set_custom_commission': { affiliateId: string; rate: number };
  
  // Commission Management
  'get_commission_report': { affiliateId?: string; period: string };
  'approve_commission_payout': { payoutId: string };
  'adjust_commission': { affiliateId: string; amount: number; reason: string };
  
  // Boost Periods
  'create_boost_period': { eventName: string; multiplier: number; startTime: string; endTime: string };
  'deactivate_boost': { boostId: string };
  
  // Fraud Detection
  'get_affiliate_fraud_report': {};
  'flag_affiliate_fraud': { affiliateId: string; fraudType: string; evidence: string };
  'suspend_affiliate': { affiliateId: string; reason: string };
  
  // Sub-affiliates
  'get_affiliate_tree': { affiliateId: string };
  'detach_sub_affiliate': { affiliateId: string; subAffiliateId: string; reason: string };
}
```

### 2.9 Compliance & KYC (`admin-compliance`)

**Purpose**: Regulatory compliance and KYC management.

```typescript
interface ComplianceActions {
  // KYC Management
  'get_pending_kyc': {};
  'review_kyc': { kycId: string; decision: 'approve' | 'reject'; notes: string };
  'request_additional_docs': { userId: string; requiredDocs: string[] };
  
  // AML
  'get_aml_alerts': { status?: string; severity?: string };
  'review_aml_alert': { alertId: string; decision: string; notes: string };
  'file_sar': { userId: string; details: SARDetails };
  
  // Self-Exclusion
  'get_self_exclusion_requests': {};
  'process_self_exclusion': { requestId: string };
  'reinstate_user': { userId: string; verificationComplete: boolean };
  
  // License Compliance
  'get_license_status': {};
  'get_nlrc_report': { period: string };
  'generate_quarterly_return': { quarter: string; year: number };
  
  // Document Retention
  'get_expiring_documents': {};
  'archive_documents': { documentIds: string[] };
  'retrieve_archived_document': { archiveId: string };
  
  // Advertising Compliance
  'get_advertising_logs': { period: string };
  'flag_non_compliant_ad': { adId: string; issue: string };
}
```

### 2.10 Real-time Analytics (`admin-realtime-analytics`)

**Purpose**: Live platform monitoring and analytics.

```typescript
interface AnalyticsActions {
  // Real-time Metrics
  'get_live_dashboard': {};
  'get_active_users': {};
  'get_live_bets': {};
  'get_pending_settlements': {};
  
  // Trends
  'get_betting_trends': { period: string };
  'get_market_trends': { matchId: string };
  'get_user_activity_heatmap': { period: string };
  
  // Performance
  'get_system_performance': {};
  'get_edge_function_metrics': {};
  'get_database_metrics': {};
  
  // Alerts
  'get_active_alerts': {};
  'acknowledge_alert': { alertId: string };
  'configure_alert_threshold': { metric: string; threshold: number; action: string };
  
  // Reports
  'generate_custom_report': { config: ReportConfig };
  'schedule_report': { reportId: string; schedule: string; recipients: string[] };
  'export_dashboard': { dashboardId: string; format: 'pdf' | 'excel' };
}
```

### 2.11 Security Monitor (`admin-security-monitor`)

**Purpose**: Security monitoring and incident response.

```typescript
interface SecurityActions {
  // Monitoring
  'get_security_dashboard': {};
  'get_failed_logins': { period: string };
  'get_suspicious_activities': {};
  
  // Session Management
  'get_active_admin_sessions': {};
  'revoke_session': { sessionId: string; reason: string };
  'revoke_all_user_sessions': { userId: string; reason: string };
  
  // IP Management
  'get_ip_allowlist': {};
  'add_ip_to_allowlist': { ip: string; description: string; expiresAt?: string };
  'remove_ip_from_allowlist': { ipId: string; reason: string };
  
  // Incident Response
  'create_incident': { type: string; severity: string; description: string };
  'update_incident': { incidentId: string; status: string; notes: string };
  'get_incident_history': { period: string };
  
  // Audit
  'get_audit_logs': { filters: AuditFilters; pagination: Pagination };
  'export_audit_logs': { startDate: string; endDate: string; format: 'csv' | 'json' };
  'search_audit_logs': { query: string; filters: AuditFilters };
}
```

---

## 3. SECURITY REQUIREMENTS

### Authentication Flow

```
1. Admin Login
   ├── Email/Password validation
   ├── Check admin role exists
   ├── Check account not suspended
   ├── MFA verification (if enabled)
   ├── Create admin session
   ├── Log login attempt
   └── Return JWT with admin claims

2. Request Validation
   ├── Validate JWT signature
   ├── Check token not expired
   ├── Check token age < MAX_TOKEN_AGE
   ├── Verify admin role still valid
   ├── Check IP in allowlist (if enabled)
   ├── Check MFA verified (if required)
   ├── Rate limit check
   └── Log API access
```

### Security Headers

```typescript
const securityHeaders = {
  'Access-Control-Allow-Origin': 'https://admin.betfuz.com', // Restrict to admin domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

### Rate Limiting

```typescript
const rateLimits = {
  'admin-api-gateway': { window: 60, max: 100 },
  'admin-user-management': { window: 60, max: 50 },
  'admin-financial': { window: 60, max: 30 },
  'admin-bet-management': { window: 60, max: 100 },
  'admin-platform-control': { window: 60, max: 20 },
};
```

---

## 4. ENVIRONMENT VARIABLES

```bash
# Supabase
SUPABASE_URL=https://aacjfdrctnmnenebzdxg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Admin Security
ADMIN_ENABLE_IP_WHITELIST=false  # Set to true in production
ADMIN_REQUIRE_MFA=false          # Set to true in production
ADMIN_MAX_TOKEN_AGE=3600         # 1 hour
ADMIN_RATE_LIMIT_WINDOW=60
ADMIN_RATE_LIMIT_MAX=100

# AI (for fraud detection, analytics)
LOVABLE_API_KEY=<auto_provided>

# External Services
SPORTRADAR_API_KEY=<key>
ODDS_API_KEY=<key>
NEWS_API_KEY=<key>

# Webhooks
SLACK_WEBHOOK_URL=<url>
ALERT_WEBHOOK_URL=<url>
```

---

## 5. IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure
- [ ] Database schema migration
- [ ] User roles and permissions
- [ ] Admin API gateway with security
- [ ] Audit logging system
- [ ] Basic authentication flow

### Phase 2: User Management
- [ ] User search and details
- [ ] Role management
- [ ] Account suspension/unsuspension
- [ ] Balance management
- [ ] KYC management

### Phase 3: Betting Operations
- [ ] Bet search and details
- [ ] Manual settlement
- [ ] Bet voiding
- [ ] Cash out management
- [ ] Risk flagging

### Phase 4: Financial
- [ ] Financial reports
- [ ] Deposit management
- [ ] Withdrawal processing
- [ ] Ledger export
- [ ] Reconciliation

### Phase 5: Platform Control
- [ ] Platform status management
- [ ] Feature toggles
- [ ] Odds management
- [ ] Match management
- [ ] Bulk operations

### Phase 6: Risk & Trading
- [ ] Exposure dashboard
- [ ] Liability monitoring
- [ ] Bet delays
- [ ] Early payout configuration
- [ ] Suspicious activity detection

### Phase 7: Compliance
- [ ] KYC workflow
- [ ] AML alerts
- [ ] Self-exclusion
- [ ] Regulatory reports
- [ ] Document retention

### Phase 8: Analytics & Monitoring
- [ ] Real-time dashboard
- [ ] Security monitoring
- [ ] Alert management
- [ ] Custom reports
- [ ] Performance metrics

---

## 6. API RESPONSE FORMAT

```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Standard HTTP Status Codes
// 200 - Success
// 201 - Created
// 400 - Bad Request
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 429 - Rate Limited
// 500 - Internal Server Error
```

---

## 7. TESTING REQUIREMENTS

### Security Tests
- [ ] JWT validation (expired, invalid, missing)
- [ ] Role authorization (admin vs superadmin)
- [ ] IP allowlist enforcement
- [ ] MFA requirement enforcement
- [ ] Rate limiting
- [ ] Token age validation

### Functional Tests
- [ ] All CRUD operations
- [ ] Bulk operations
- [ ] Financial calculations
- [ ] Audit log integrity
- [ ] Webhook delivery

### Load Tests
- [ ] 100 concurrent admin users
- [ ] 1000 requests/minute
- [ ] Large data exports

---

## 8. EXISTING EDGE FUNCTIONS

The following edge functions already exist and need to be integrated/enhanced:

1. `admin-api-gateway` - Central security gateway
2. `admin-user-management` - User operations
3. `admin-user-search` - User search
4. `admin-bet-settlement` - Bet settlement
5. `admin-void-bet` - Bet voiding
6. `admin-manual-payout` - Manual payouts
7. `admin-export-ledger` - Ledger export
8. `admin-audit-logs` - Audit log retrieval
9. `admin-platform-control` - Platform operations
10. `admin-financial-reports` - Financial reports
11. `admin-webhook-settings` - Webhook configuration
12. `admin-realtime-analytics` - Live analytics
13. `admin-security-monitor` - Security monitoring

---

## 9. CRITICAL SECURITY RULES

1. **NEVER** store roles in profiles table
2. **NEVER** trust client-side role checks
3. **ALWAYS** validate JWT on every request
4. **ALWAYS** log admin actions to audit trail
5. **NEVER** allow raw SQL execution
6. **ALWAYS** use parameterized queries
7. **NEVER** expose service role key to client
8. **ALWAYS** hash sensitive payloads in audit logs
9. **NEVER** delete audit log entries
10. **ALWAYS** require MFA for destructive actions in production

---

## 10. DEPLOYMENT NOTES

### Development
- IP whitelist disabled
- MFA not required
- Longer token age (3600s)

### Production
- IP whitelist enabled
- MFA required
- Short token age (900s)
- Separate admin domain
- WAF rules active
- VPN access only

---

This prompt provides complete specifications for building a sophisticated admin backend for Betfuz. Implement each edge function following the security patterns and action interfaces defined above.
