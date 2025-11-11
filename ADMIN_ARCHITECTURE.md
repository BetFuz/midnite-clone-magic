# Betfuz Admin Architecture - Option 2 Complete Implementation

## 🏗️ Production Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          INTERNET                                         │
└──────────────────┬──────────────────────────┬────────────────────────────┘
                   │                          │
                   │                          │
       ┌───────────▼───────────┐  ┌──────────▼──────────┐
       │  PUBLIC APP           │  │  ADMIN APP           │
       │  betfuz.com           │  │  admin.betfuz.com    │
       │                       │  │  (Behind IAP/Access) │
       │  - React Frontend     │  │  - React Frontend    │
       │  - Public Routes      │  │  - Admin Routes Only │
       │  - Guest Access       │  │  - SSO + MFA Login   │
       │  - Basic Auth         │  │  - IP Allowlisting   │
       └───────────┬───────────┘  └──────────┬───────────┘
                   │                         │
                   │                         │
       ┌───────────▼─────────────────────────▼───────────┐
       │         SUPABASE EDGE FUNCTIONS                  │
       │         (Serverless API Layer)                   │
       ├──────────────────────────────────────────────────┤
       │                                                   │
       │  PUBLIC ENDPOINTS        ADMIN ENDPOINTS         │
       │  ├─ bet-recommendations  ├─ admin-api-gateway    │
       │  ├─ ai-predictions       │   └─ JWT Validation   │
       │  └─ ai-betting-chat      │   └─ Role Check       │
       │                          │   └─ IP Allowlist     │
       │                          │   └─ Rate Limiting    │
       │                          │   └─ Token Age Check  │
       │                          │   └─ MFA Verification │
       │                          │   └─ Audit Logging    │
       │                          │                        │
       │                          ├─ admin-webhook-settings│
       │                          │   └─ Super Admin Only  │
       │                          │   └─ HTTPS Required    │
       │                          │   └─ Audit Logged      │
       │                          │                        │
       │                          └─ admin-audit-logs      │
       │                              └─ Admin/Super Read  │
       │                              └─ Immutable         │
       └───────────────────┬──────────────────────────────┘
                           │
                           │
       ┌───────────────────▼──────────────────────────────┐
       │         SUPABASE POSTGRESQL DATABASE              │
       ├──────────────────────────────────────────────────┤
       │                                                   │
       │  PUBLIC TABLES           ADMIN TABLES            │
       │  ├─ profiles             ├─ user_roles           │
       │  ├─ bet_slips            │   └─ RLS: View Own    │
       │  ├─ bet_selections       │   └─ RLS: Admin View  │
       │  ├─ leaderboard_entries  │   └─ RLS: Super Mod   │
       │  └─ ...                  │                        │
       │                          ├─ admin_audit_log       │
       │                          │   └─ RLS: Admin View   │
       │                          │   └─ NO UPDATE/DELETE  │
       │                          │   └─ Immutable Trail   │
       │                          │                        │
       │                          └─ admin_webhook_settings│
       │                              └─ RLS: Admin View   │
       │                              └─ RLS: Super Modify │
       │                              └─ Single Row Config │
       │                                                   │
       │  SECURITY FUNCTIONS                              │
       │  └─ has_role(uuid, app_role) → boolean          │
       │      └─ Security Definer                         │
       │      └─ Prevents Recursive RLS                   │
       │                                                   │
       │  AUDIT FUNCTIONS                                 │
       │  └─ log_admin_action(...) → uuid                │
       │      └─ Immutable Insert Only                    │
       │      └─ Captures: IP, User-Agent, Payload Hash   │
       │                                                   │
       └──────────────────────────────────────────────────┘
```

## 🔐 Security Layers Explained

### Layer 1: Network Security (Infrastructure)
```
Cloudflare Access / Google IAP
├─ SSO Authentication (Google/Microsoft OAuth)
├─ MFA Required (TOTP Authenticator)
├─ IP Allowlisting (Corporate IPs only)
├─ Geographic Restrictions (Optional)
└─ DDoS Protection
```

### Layer 2: Application Security (Edge Functions)
```
admin-api-gateway Edge Function
├─ JWT Token Validation
│   └─ Verify signature with Supabase public key
│   └─ Check expiration
│   └─ Validate issuer
│
├─ Token Age Check
│   └─ Token must be <15 minutes old
│   └─ Forces frequent re-authentication
│
├─ Role Verification
│   └─ Query user_roles table
│   └─ Check for admin or superadmin role
│   └─ Reject if no admin role found
│
├─ IP Allowlisting (if enabled)
│   └─ Check x-forwarded-for header
│   └─ Compare against ADMIN_ALLOWED_IPS env var
│   └─ Block non-whitelisted IPs
│
├─ Rate Limiting
│   └─ Track requests per admin user
│   └─ 100 requests per minute limit
│   └─ Block if exceeded
│
├─ MFA Verification
│   └─ Check x-admin-mfa header
│   └─ Log MFA status in audit trail
│
└─ Audit Logging
    └─ Log every admin API access
    └─ Capture: admin_id, action, IP, user-agent, status
```

### Layer 3: Database Security (RLS Policies)
```
Row Level Security (RLS) Policies
├─ user_roles table
│   ├─ Users can view own roles
│   ├─ Admins can view all roles
│   └─ Superadmins can manage all roles
│
├─ admin_audit_log table
│   ├─ Admins can SELECT (read logs)
│   ├─ System can INSERT (via service role)
│   └─ NO UPDATE or DELETE policies (immutable)
│
└─ admin_webhook_settings table
    ├─ Admins can SELECT (view settings)
    ├─ Superadmins can INSERT (create config)
    ├─ Superadmins can UPDATE (modify config)
    └─ NO DELETE policy (config is permanent)
```

## 📊 Data Flow Examples

### Example 1: Admin Views Audit Logs

```
1. Admin navigates to /admin/dashboard

2. AdminGuard component runs:
   ├─ Checks if user is authenticated
   ├─ Calls useAdminAuth hook
   ├─ useAdminAuth queries user_roles table
   └─ Validates admin/superadmin role

3. If authorized, Dashboard loads:
   ├─ Calls supabase.functions.invoke('admin-audit-logs')
   └─ Passes JWT token in Authorization header

4. admin-audit-logs edge function:
   ├─ Validates JWT with Supabase
   ├─ Checks admin role in user_roles table
   ├─ Queries admin_audit_log table
   └─ Returns paginated logs

5. Dashboard displays logs with:
   ├─ Action type badges
   ├─ Success/failure indicators
   ├─ Admin email
   ├─ Timestamp
   ├─ IP address
   └─ MFA verification status
```

### Example 2: Superadmin Updates Webhook Settings

```
1. Superadmin navigates to /admin/webhooks

2. AdminGuard validates superadmin role

3. Webhook Settings page loads existing URLs:
   ├─ Calls supabase.functions.invoke('admin-webhook-settings')
   └─ GET request to fetch current config

4. admin-webhook-settings edge function:
   ├─ Validates JWT
   ├─ Checks superadmin role
   ├─ Queries admin_webhook_settings table
   └─ Returns webhook URLs

5. Superadmin updates webhook URL and clicks Save

6. admin-webhook-settings edge function:
   ├─ Validates JWT (age <15 min)
   ├─ Checks superadmin role
   ├─ Validates HTTPS URL format
   ├─ Creates SHA-256 hash of payload
   ├─ Updates admin_webhook_settings table
   └─ Logs action to admin_audit_log
       ├─ action: "WEBHOOK_SETTINGS_UPDATE"
       ├─ admin_id: [superadmin UUID]
       ├─ payload_hash: [SHA-256]
       ├─ ip_address: [client IP]
       ├─ user_agent: [browser info]
       ├─ mfa_verified: true/false
       └─ status: "success"

7. Success message displayed to superadmin
```

### Example 3: Unauthorized Access Attempt

```
1. Regular user tries to access /admin/dashboard

2. AdminGuard component:
   ├─ Checks authentication ✓
   ├─ Queries user_roles table
   └─ Finds no admin role ✗

3. AdminGuard displays error:
   "Admin access required. You do not have privileges."

4. User is NOT redirected to auth (already logged in)

5. Audit log entry created:
   ├─ action: "ADMIN_ACCESS_DENIED"
   ├─ status: "failed"
   ├─ error_message: "User does not have admin privileges"
   ├─ ip_address: [captured]
   └─ user_agent: [captured]
```

### Example 4: Rate Limit Protection

```
1. Admin sends 101 requests in 1 minute

2. admin-api-gateway tracks requests:
   ├─ Key: "admin:[user_id]"
   ├─ Count: increments per request
   └─ Reset: after 60 seconds

3. Request 1-100: Allowed
   ├─ Passed through to service
   └─ Normal operation

4. Request 101: Blocked
   ├─ Returns: {"error": "Rate limit exceeded"}
   ├─ Status: 429 Too Many Requests
   └─ Audit log: "RATE_LIMIT_EXCEEDED"

5. Admin must wait for window to reset
```

## 🛠️ Admin Features Built

### 1. Admin Dashboard (`/admin/dashboard`)
```typescript
Features:
├─ Real-time Statistics
│   ├─ Total audit log count
│   ├─ Active admin user count
│   ├─ Failed access attempts (24h)
│   └─ Critical security alerts
│
├─ Security Alerts
│   └─ Warning if >5 failed attempts in 24h
│
├─ Audit Log Viewer (3 tabs)
│   ├─ All Actions: Complete audit trail
│   ├─ Failed: Only failed operations
│   └─ Critical: Security-sensitive events
│
├─ Log Details per Entry
│   ├─ Action type badge (color-coded)
│   ├─ Success/failure indicator
│   ├─ Admin email
│   ├─ Timestamp
│   ├─ IP address
│   ├─ MFA verification badge
│   └─ Error message (if failed)
│
└─ Refresh Button
    └─ Reload all dashboard data
```

### 2. Webhook Settings (`/admin/webhooks`)
```typescript
Features:
├─ Secure Configuration
│   ├─ 6 webhook event types
│   ├─ HTTPS-only enforcement
│   ├─ URL validation
│   └─ Server-side storage
│
├─ Test Functionality
│   └─ Send test payload to webhook
│
├─ Example Payloads
│   └─ JSON examples for each event type
│
├─ Audit Logging
│   ├─ All changes logged
│   ├─ Payload hash stored
│   └─ IP and user-agent captured
│
└─ Access Control
    └─ Superadmin only access
```

### 3. Admin Guard System
```typescript
Components:
├─ AdminGuard.tsx
│   ├─ Wrapper component for admin pages
│   ├─ Validates authentication
│   ├─ Checks admin role server-side
│   ├─ Shows loading state
│   ├─ Displays error messages
│   └─ Redirects unauthorized users
│
├─ useAdminAuth.tsx
│   ├─ Custom React hook
│   ├─ Fetches user session
│   ├─ Queries user_roles table
│   ├─ Returns: user, role, isAdmin, isSuperAdmin
│   └─ Handles loading and error states
│
└─ Usage:
    <AdminGuard requireSuperAdmin={true}>
      <WebhookSettings />
    </AdminGuard>
```

## 🔑 Admin Role Management

### Role Types
```typescript
type app_role = 'user' | 'admin' | 'superadmin';

Permissions:
├─ user
│   └─ No admin access
│
├─ admin
│   ├─ View audit logs
│   ├─ View webhook settings
│   └─ Read-only admin dashboard
│
└─ superadmin
    ├─ All admin permissions
    ├─ Modify webhook settings
    ├─ Grant/revoke admin roles
    └─ Access all admin features
```

### Granting Admin Role
```sql
-- Super admin grants admin role to user
INSERT INTO user_roles (user_id, role, granted_by)
VALUES (
  'target-user-uuid',
  'admin',  -- or 'superadmin'
  auth.uid()  -- Must be superadmin to execute
);
```

### Revoking Admin Role
```sql
-- Super admin revokes admin role
DELETE FROM user_roles
WHERE user_id = 'target-user-uuid'
  AND role = 'admin';
```

### Checking User Role
```sql
-- Check if user has admin role
SELECT has_role('user-uuid', 'admin');  -- Returns boolean

-- Get all user's roles
SELECT role FROM user_roles
WHERE user_id = 'user-uuid';
```

## 📁 File Structure

```
betfuz/
├── src/
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminDashboard.tsx       ← Admin monitoring page
│   │       └── WebhookSettings.tsx      ← Webhook configuration
│   │
│   ├── components/
│   │   └── admin/
│   │       └── AdminGuard.tsx           ← Authorization wrapper
│   │
│   └── hooks/
│       └── useAdminAuth.tsx             ← Admin auth hook
│
├── supabase/
│   ├── functions/
│   │   ├── admin-api-gateway/
│   │   │   └── index.ts                 ← API gateway with validation
│   │   ├── admin-webhook-settings/
│   │   │   └── index.ts                 ← Webhook CRUD operations
│   │   └── admin-audit-logs/
│   │       └── index.ts                 ← Audit log retrieval
│   │
│   └── config.toml                      ← Edge function configuration
│
├── ADMIN_DEPLOYMENT_GUIDE.md            ← Complete deployment instructions
├── ADMIN_ARCHITECTURE.md                ← This file
└── SECURITY_CHECKLIST.md                ← Security verification checklist
```

## 🎯 Next Steps to Complete Option 2

1. **Deploy Admin Subdomain** (P0 - Critical)
   ```bash
   # Create Cloudflare Pages project for admin
   # Configure custom domain: admin.betfuz.com
   # Deploy admin pages separately
   ```

2. **Enable Cloudflare Access** (P0 - Critical)
   ```yaml
   # Configure access policy
   - Require SSO (Google/Microsoft OAuth)
   - Enforce MFA
   - Restrict to company email domain
   ```

3. **Configure IP Allowlisting** (P1 - High)
   ```bash
   # In Supabase Dashboard → Settings → Secrets
   ENABLE_ADMIN_IP_WHITELIST=true
   ADMIN_ALLOWED_IPS=203.0.113.0,203.0.113.1,203.0.113.2
   ```

4. **Set Up Monitoring** (P0 - Critical)
   ```bash
   # Configure alerts for:
   # - Failed admin access (>5 in 10 min)
   # - Rate limit breaches
   # - Suspicious IP patterns
   # - Database permission errors
   ```

5. **Implement MFA** (P0 - Critical)
   ```typescript
   // Add TOTP authenticator requirement
   // Integrate with Google Authenticator/Authy
   // Enforce MFA for all admin users
   ```

## ✅ What's Already Complete

- ✅ Database role system with security definer function
- ✅ Immutable audit logging infrastructure
- ✅ Admin API gateway with comprehensive validation
- ✅ Admin webhook settings with secure storage
- ✅ Admin dashboard with real-time monitoring
- ✅ Frontend admin guards with role checking
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Rate limiting (100 req/min per admin)
- ✅ IP allowlisting capability
- ✅ Token age validation
- ✅ MFA header support
- ✅ Complete audit trail

## 🔒 Security Guarantees

1. **Database Level**
   - Roles stored in separate table (not profiles)
   - Security definer prevents recursive RLS
   - Audit logs are immutable (no UPDATE/DELETE)
   - RLS enforces permissions at DB level

2. **API Level**
   - All admin endpoints require JWT
   - Server-side role validation (never client-side)
   - Rate limiting per admin user
   - IP allowlisting (when enabled)
   - Token age validation
   - Comprehensive audit logging

3. **Frontend Level**
   - Admin pages protected by AdminGuard
   - Role checks performed server-side
   - No client-side role storage
   - Automatic redirect for unauthorized users

4. **Network Level** (When deployed)
   - Separate subdomain (admin.betfuz.com)
   - Cloudflare Access/IAP protection
   - SSO + MFA required
   - DDoS protection
   - WAF rules

## 📞 Support

For questions or security concerns:
- Review: `ADMIN_DEPLOYMENT_GUIDE.md`
- Checklist: `SECURITY_CHECKLIST.md`
- Architecture: `ADMIN_ARCHITECTURE.md` (this file)
