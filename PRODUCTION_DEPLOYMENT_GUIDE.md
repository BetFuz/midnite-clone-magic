# Betfuz Production Deployment Guide

## 🔴 CRITICAL: This System is NOT Production-Ready

**Current Status**: Development-Grade (A-) Security  
**Production Status**: C Rating - MAJOR GAPS EXIST

This guide outlines the complete production deployment roadmap for Betfuz, focusing on achieving enterprise-grade security for a sports betting platform.

---

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [Critical Production Gaps](#critical-production-gaps)
3. [Phase 1: Code-Level Security Hardening](#phase-1-code-level-security-hardening)
4. [Phase 2: Infrastructure Setup](#phase-2-infrastructure-setup)
5. [Phase 3: Production Deployment](#phase-3-production-deployment)
6. [Phase 4: Monitoring & Compliance](#phase-4-monitoring--compliance)

---

## Current Implementation Status

### ✅ Implemented (Development-Grade)

- **Database Security**
  - `user_roles` table with `app_role` enum (user, admin, superadmin)
  - Row Level Security (RLS) on all admin tables
  - `has_role()` security definer function
  - `admin_audit_log` immutable table

- **Edge Function Security**
  - JWT validation in `admin-api-gateway`
  - Role-based access control (RBAC)
  - Rate limiting (100 req/min per admin)
  - Token age validation (configurable, default 15min)
  - IP allowlisting capability (disabled by default)
  - MFA header checking (optional by default)
  - Audit logging for all admin actions

- **Frontend Security**
  - `AdminGuard` component protecting routes
  - `useAdminAuth` hook for role verification
  - No hardcoded credentials
  - Server-side role validation

---

## Critical Production Gaps

### 🔴 High Priority (Blocking Production Launch)

1. **No Physical Domain Separation**
   - Admin and public app on same domain
   - **Required**: `admin.betfuz.com` separate deployment

2. **No Mandatory SSO/MFA**
   - MFA checking exists but not enforced
   - **Required**: Corporate SSO + mandatory MFA

3. **No Network Access Controls**
   - IP allowlisting disabled by default
   - **Required**: Cloudflare Access or Google IAP

4. **Secrets in Code/Environment Files**
   - `.env` files with sensitive keys
   - **Required**: HashiCorp Vault or AWS Secrets Manager

5. **No Monitoring Infrastructure**
   - No alerting on admin actions
   - **Required**: Real-time security monitoring

### 🟡 Medium Priority (Required for Compliance)

6. **No Separate CI/CD**
   - Same deployment pipeline for admin and public
   - **Required**: Separate GitHub Actions workflows

7. **No WAF/DDoS Protection**
   - Direct internet exposure
   - **Required**: Cloudflare WAF rules

8. **No mTLS Between Services**
   - Unencrypted service-to-service communication
   - **Required**: Certificate-based mutual TLS

---

## Phase 1: Code-Level Security Hardening

### Step 1.1: Enable Production Security Settings

Update your Supabase secrets (Edge Function environment variables):

```bash
# In Supabase Dashboard → Project Settings → Edge Functions → Secrets

# IP Allowlisting (REQUIRED for production)
ENABLE_ADMIN_IP_WHITELIST=true
ADMIN_ALLOWED_IPS=203.0.113.10,203.0.113.11,203.0.113.12

# MFA Enforcement (REQUIRED for production)
ADMIN_REQUIRE_MFA=true

# Token Age (Tighten for production)
ADMIN_MAX_TOKEN_AGE=900  # 15 minutes

# Rate Limiting (Adjust based on admin team size)
ADMIN_RATE_LIMIT_MAX=100
ADMIN_RATE_LIMIT_WINDOW=60000

# Webhook Security
N8N_BEARER_TOKEN=<your-secure-token>
N8N_WEBHOOK_SECRET=<your-hmac-secret>
```

### Step 1.2: Configure Database Permissions

Run this SQL to create a dedicated admin service account:

```sql
-- Create admin service role with limited permissions
CREATE ROLE admin_service WITH LOGIN PASSWORD '<secure-password>';

-- Grant minimal necessary permissions
GRANT USAGE ON SCHEMA public TO admin_service;
GRANT SELECT, INSERT, UPDATE ON public.admin_audit_log TO admin_service;
GRANT SELECT ON public.user_roles TO admin_service;
GRANT SELECT, UPDATE ON public.admin_webhook_settings TO admin_service;

-- Revoke unnecessary permissions
REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM admin_service;
```

### Step 1.3: Enable Audit Log Immutability

```sql
-- Prevent updates/deletes on audit logs (append-only)
CREATE POLICY "audit_log_append_only"
ON public.admin_audit_log
FOR ALL
TO authenticated
USING (false)
WITH CHECK (auth.uid() IS NOT NULL);

-- Only allow inserts
CREATE POLICY "audit_log_insert_only"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);
```

---

## Phase 2: Infrastructure Setup

### Step 2.1: Domain Separation

1. **Create Separate Subdomain**
   ```
   admin.betfuz.com → Admin App (Separate Deployment)
   betfuz.com → Public App
   ```

2. **Deploy Admin App**
   - Use Cloudflare Pages or Vercel
   - Configure environment variables for admin-specific URLs
   - Use separate GitHub repository or branch

3. **DNS Configuration**
   ```
   admin.betfuz.com → A record → Admin hosting IP
   betfuz.com → A record → Public hosting IP
   ```

### Step 2.2: Cloudflare Access Setup

1. **Enable Cloudflare Access**
   - Go to Cloudflare Dashboard → Zero Trust → Access
   - Create Application for `admin.betfuz.com`

2. **Configure SSO Provider**
   - Google Workspace / Microsoft Entra ID / Okta
   - Require corporate email domain (@yourcompany.com)

3. **Add Access Policy**
   ```
   Rule: Require SAML/OIDC authentication
   Include: Emails ending in @yourcompany.com
   Require: MFA verification
   Session Duration: 4 hours
   ```

### Step 2.3: IP Allowlisting

Update your Edge Function secrets with allowed IPs:

```bash
# Office IPs (VPN endpoints)
ADMIN_ALLOWED_IPS=203.0.113.10,203.0.113.11,203.0.113.12

# Enable allowlist
ENABLE_ADMIN_IP_WHITELIST=true
```

**Alternative**: Use Cloudflare Access instead of IP allowlisting for remote teams.

### Step 2.4: Secrets Management

**Option A: HashiCorp Vault**

```bash
# Store secrets in Vault
vault kv put secret/betfuz/admin \
  stripe_key="sk_live_..." \
  flutterwave_key="FLWSECK_..." \
  n8n_token="secure-token"

# Retrieve in Edge Functions
const stripeKey = await vault.read('secret/betfuz/admin', 'stripe_key');
```

**Option B: AWS Secrets Manager**

```typescript
// In Edge Functions
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: "betfuz/admin/stripe" })
);
const secret = JSON.parse(response.SecretString);
```

**Option C: Supabase Secrets (Current - Not Ideal for Production)**

Continue using Supabase Edge Function secrets, but:
- Rotate keys monthly
- Use separate secrets for admin vs public functions
- Enable audit logging for secret access

---

## Phase 3: Production Deployment

### Step 3.1: Separate CI/CD Pipelines

Create `.github/workflows/deploy-admin.yml`:

```yaml
name: Deploy Admin App

on:
  push:
    branches: [main]
    paths:
      - 'src/pages/admin/**'
      - 'src/components/admin/**'
      - 'supabase/functions/admin-*/**'

jobs:
  deploy-admin:
    runs-on: ubuntu-latest
    environment: admin-production
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Admin Frontend
        run: |
          # Deploy to admin.betfuz.com
          
      - name: Deploy Admin Edge Functions
        run: |
          supabase functions deploy admin-api-gateway
          supabase functions deploy admin-webhook-settings
          supabase functions deploy admin-audit-logs
```

### Step 3.2: WAF Configuration

**Cloudflare WAF Rules**:

```
Rule 1: Block Non-Admin Traffic
  Field: Hostname
  Operator: equals
  Value: admin.betfuz.com
  Action: Challenge (Managed Challenge)

Rule 2: Rate Limiting
  Field: URI Path
  Operator: starts with
  Value: /admin
  Rate: 100 requests / 10 minutes
  Action: Block

Rule 3: Geographic Restrictions (Optional)
  Field: Country
  Operator: not in
  Value: [Your Operating Countries]
  Action: Block
```

### Step 3.3: mTLS Configuration

Generate client certificates for service-to-service communication:

```bash
# Generate CA certificate
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt

# Generate client certificate for admin app
openssl genrsa -out admin-client.key 2048
openssl req -new -key admin-client.key -out admin-client.csr
openssl x509 -req -in admin-client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out admin-client.crt -days 365

# Configure Cloudflare mTLS
# Cloudflare → SSL/TLS → Client Certificates → Upload ca.crt
```

---

## Phase 4: Monitoring & Compliance

### Step 4.1: Real-Time Monitoring

**Option A: Supabase + External Monitoring**

Create `supabase/functions/admin-security-monitor/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Query audit logs for suspicious activity
  const { data: suspiciousLogs } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  // Alert on repeated failures (potential attack)
  const failedAttempts = suspiciousLogs?.length || 0;
  if (failedAttempts > 10) {
    // Send alert to Slack/PagerDuty/Email
    await fetch(Deno.env.get('ALERT_WEBHOOK_URL'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert: 'HIGH',
        message: `${failedAttempts} failed admin login attempts in last hour`,
        logs: suspiciousLogs
      })
    });
  }

  return new Response(JSON.stringify({ status: 'ok', suspiciousLogs }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

Run as cron job (every 5 minutes):

```bash
# Supabase CLI or use Supabase Dashboard → Database → Cron
supabase functions schedule admin-security-monitor --cron "*/5 * * * *"
```

**Option B: ELK Stack / Splunk**

Forward audit logs to centralized logging:

```typescript
// In admin-api-gateway after logging
await fetch('https://logs.yourcompany.com/ingest', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${LOGGING_TOKEN}` },
  body: JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'admin-api-gateway',
    level: validation.valid ? 'INFO' : 'WARN',
    admin_id: validation.user?.id,
    action: url.pathname,
    ip: req.headers.get('x-forwarded-for'),
    status: validation.valid ? 'success' : 'denied'
  })
});
```

### Step 4.2: Compliance Requirements

For sports betting platforms, ensure:

1. **Data Retention**
   - Keep audit logs for minimum 7 years
   - Export to S3 or long-term storage monthly

2. **User Data Protection (GDPR/DPA)**
   - Encrypt PII in database
   - Implement data deletion workflows

3. **Financial Compliance**
   - AML (Anti-Money Laundering) checks
   - Transaction monitoring

4. **Licensing Requirements**
   - Vary by jurisdiction
   - Consult legal team before launch

---

## Testing Production Security

### Test 1: IP Allowlisting

```bash
# Should fail from non-whitelisted IP
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer <valid-jwt>" \
  -H "Content-Type: application/json"

# Expected: 403 Forbidden
```

### Test 2: MFA Enforcement

```bash
# Should fail without MFA header
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer <valid-jwt>"

# Expected: 403 - MFA verification required
```

### Test 3: Token Age

```bash
# Use token older than MAX_TOKEN_AGE
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer <old-jwt>"

# Expected: 403 - Token too old
```

### Test 4: Rate Limiting

```bash
# Send 101 requests rapidly
for i in {1..101}; do
  curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-api-gateway \
    -H "Authorization: Bearer <valid-jwt>" &
done

# Expected: Last requests return 429 - Rate limit exceeded
```

---

## Production Readiness Checklist

### Before Launch

- [ ] Admin app deployed to separate domain (`admin.betfuz.com`)
- [ ] Cloudflare Access configured with corporate SSO
- [ ] IP allowlisting enabled with production IPs
- [ ] MFA enforcement enabled (`ADMIN_REQUIRE_MFA=true`)
- [ ] Secrets migrated to Vault/Secrets Manager
- [ ] WAF rules active on admin domain
- [ ] mTLS configured between services
- [ ] Monitoring and alerting deployed
- [ ] Separate CI/CD pipelines configured
- [ ] Audit log retention policy implemented
- [ ] Penetration testing completed
- [ ] Legal/compliance review completed
- [ ] Incident response playbook documented

### Post-Launch

- [ ] Monitor admin access patterns daily
- [ ] Review audit logs weekly
- [ ] Rotate secrets monthly
- [ ] Update IP allowlist as needed
- [ ] Review WAF rules quarterly
- [ ] Conduct security audits annually

---

## Support & Escalation

### Security Incidents

**Immediate Actions**:
1. Block affected IPs in Cloudflare
2. Rotate all admin credentials
3. Review audit logs for compromise
4. Notify security team

**Escalation Path**:
- L1: Development team
- L2: Security team
- L3: CTO/CISO
- L4: Legal/compliance

### Contact

- Security Team: security@betfuz.com
- On-Call: [PagerDuty/Slack]
- Compliance: compliance@betfuz.com

---

## Conclusion

This system requires **significant infrastructure work** before production launch. The code-level security is strong (A-), but infrastructure gaps drop the rating to **C (NOT PRODUCTION-READY)**.

**Estimated Timeline**:
- Phase 1 (Code Hardening): 1 week
- Phase 2 (Infrastructure): 2-3 weeks
- Phase 3 (Deployment): 1 week
- Phase 4 (Monitoring): 1 week

**Total**: 5-6 weeks to production-ready state.

**Do NOT launch without completing Phases 1-3.**
