# Betfuz Security Setup Commands

Quick reference for configuring production security.

---

## 1. Configure Edge Function Secrets

Run these commands in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Enable production security
ENABLE_ADMIN_IP_WHITELIST=true
ADMIN_REQUIRE_MFA=true
ADMIN_MAX_TOKEN_AGE=900

# Add your office/VPN IPs (comma-separated)
ADMIN_ALLOWED_IPS=203.0.113.10,203.0.113.11,203.0.113.12

# N8N Security
N8N_BEARER_TOKEN=<generate-secure-random-token>
N8N_WEBHOOK_SECRET=<generate-hmac-secret>

# Payment Providers (move to Vault in production)
STRIPE_SECRET_KEY=sk_live_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_...

# Monitoring Alerts
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 2. Database Security Hardening

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Create admin service account with minimal permissions
CREATE ROLE admin_service WITH LOGIN PASSWORD '<secure-password>';

GRANT USAGE ON SCHEMA public TO admin_service;
GRANT SELECT, INSERT ON public.admin_audit_log TO admin_service;
GRANT SELECT ON public.user_roles TO admin_service;
GRANT SELECT, UPDATE ON public.admin_webhook_settings TO admin_service;

-- Make audit log append-only (immutable)
DROP POLICY IF EXISTS "audit_log_insert_only" ON public.admin_audit_log;
DROP POLICY IF EXISTS "audit_log_no_updates" ON public.admin_audit_log;

CREATE POLICY "audit_log_insert_only"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "audit_log_no_updates"
ON public.admin_audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "audit_log_no_deletes"
ON public.admin_audit_log
FOR DELETE
TO authenticated
USING (false);

-- Create audit log retention policy (export to S3 after 90 days)
-- TODO: Implement archival to S3 for 7-year retention
```

---

## 3. Assign Admin Roles

Run this SQL to grant admin access to users:

```sql
-- Grant admin role to user (replace with actual user_id)
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  '<user-id-from-auth-users>',
  'admin',  -- or 'superadmin'
  auth.uid()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify role assignment
SELECT u.email, ur.role, ur.granted_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role IN ('admin', 'superadmin');
```

---

## 4. Deploy Security Monitoring

Deploy the security monitor Edge Function:

```bash
# Deploy via Supabase CLI
supabase functions deploy admin-security-monitor

# Schedule to run every 5 minutes (via Supabase Dashboard or pg_cron)
# Navigate to: Database → Cron Jobs → New Cron Job
```

Or run manually for testing:

```bash
curl https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-security-monitor \
  -H "Authorization: Bearer <service-role-key>"
```

---

## 5. Test Security Configuration

### Test IP Allowlisting

```bash
# Should FAIL from non-whitelisted IP
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer <valid-jwt>" \
  -H "Content-Type: application/json"

# Expected response:
# {"error":"IP not authorized"}
```

### Test MFA Requirement

```bash
# Should FAIL without x-admin-mfa header
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-webhook-settings \
  -H "Authorization: Bearer <valid-jwt>"

# Expected response:
# {"error":"MFA verification required for admin access"}

# Should SUCCEED with MFA header
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-webhook-settings \
  -H "Authorization: Bearer <valid-jwt>" \
  -H "x-admin-mfa: verified"

# Expected: 200 OK
```

### Test Token Age Limit

```bash
# Generate token, wait 16 minutes, then attempt access
# Should FAIL with "Token too old" error
```

### Test Rate Limiting

```bash
# Send 101 requests rapidly (exceeds 100/min limit)
for i in {1..101}; do
  curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/admin-api-gateway \
    -H "Authorization: Bearer <valid-jwt>" \
    -H "x-admin-mfa: verified" &
done

# Expected: Last few requests return 429 Rate limit exceeded
```

---

## 6. Cloudflare Access Setup (Infrastructure)

These steps require Cloudflare account and DNS configuration:

1. **Add Admin Subdomain**
   ```
   DNS Record:
   Type: A
   Name: admin
   IPv4: <your-admin-app-server-ip>
   Proxy: Yes (orange cloud)
   ```

2. **Create Access Application**
   - Cloudflare Dashboard → Zero Trust → Access → Applications
   - Click "Add an application"
   - Select "Self-hosted"
   - Application name: "Betfuz Admin Panel"
   - Session duration: 4 hours
   - Application domain: admin.betfuz.com

3. **Configure SSO Provider**
   - Add identity provider (Google Workspace / Microsoft 365 / Okta)
   - Restrict to corporate email domain: `@yourcompany.com`
   - Require MFA: Yes

4. **Create Access Policy**
   ```
   Policy name: Admin Team Only
   Action: Allow
   Rule: Include
   Selector: Emails ending in @yourcompany.com
   Additional requirement: Require MFA
   ```

---

## 7. WAF Rules (Cloudflare)

Navigate to: Security → WAF → Custom Rules

**Rule 1: Admin Domain Protection**
```
Field: Hostname
Operator: equals
Value: admin.betfuz.com
Action: Managed Challenge

Then:
Field: URI Path
Operator: starts with
Value: /admin
Action: JS Challenge
```

**Rule 2: Rate Limiting**
```
Field: URI Path
Operator: starts with
Value: /admin
Rate: 100 requests / 10 minutes per IP
Action: Block
Duration: 1 hour
```

**Rule 3: Geographic Restrictions (Optional)**
```
Field: Country
Operator: not in
Value: [Your Operating Countries - e.g., NG, ZA, KE, GH]
Action: Block
```

---

## 8. Secrets Migration to Vault (Production)

### Option A: HashiCorp Vault

```bash
# Install Vault CLI
brew install hashicorp/tap/vault  # macOS
# or: apt-get install vault        # Linux

# Initialize Vault
vault operator init

# Store secrets
vault kv put secret/betfuz/admin \
  stripe_key="sk_live_..." \
  flutterwave_key="FLWSECK_..." \
  n8n_token="secure-token" \
  n8n_secret="hmac-secret"

# Retrieve in Edge Functions
vault kv get -field=stripe_key secret/betfuz/admin
```

### Option B: AWS Secrets Manager

```bash
# Install AWS CLI
aws configure

# Store secrets
aws secretsmanager create-secret \
  --name betfuz/admin/stripe \
  --secret-string "sk_live_..."

aws secretsmanager create-secret \
  --name betfuz/admin/flutterwave \
  --secret-string "FLWSECK_..."

# Retrieve in Edge Functions (Deno)
import { SecretsManagerClient, GetSecretValueCommand } 
  from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: "betfuz/admin/stripe" })
);
const stripeKey = JSON.parse(response.SecretString!).value;
```

---

## 9. Monitoring Integration

### Slack Webhook

```bash
# Create incoming webhook in Slack
# Slack → Apps → Incoming Webhooks → Add to Channel

# Add to Edge Function secrets
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### PagerDuty

```bash
# Create integration in PagerDuty
# Services → [Your Service] → Integrations → Add Integration

# Add to Edge Function secrets
PAGERDUTY_INTEGRATION_KEY=<your-integration-key>
```

---

## 10. CI/CD Separation (GitHub Actions)

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
    environment: admin-production  # Separate environment with secrets
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Deploy Admin Edge Functions
        run: |
          supabase functions deploy admin-api-gateway --project-ref aacjfdrctnmnenebzdxg
          supabase functions deploy admin-webhook-settings --project-ref aacjfdrctnmnenebzdxg
          supabase functions deploy admin-audit-logs --project-ref aacjfdrctnmnenebzdxg
          supabase functions deploy admin-security-monitor --project-ref aacjfdrctnmnenebzdxg
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Quick Checklist

Before production launch, verify:

- [ ] `ENABLE_ADMIN_IP_WHITELIST=true` configured
- [ ] `ADMIN_REQUIRE_MFA=true` configured
- [ ] `ADMIN_ALLOWED_IPS` set with office/VPN IPs
- [ ] Admin service account created with minimal permissions
- [ ] Audit log immutability enforced (no UPDATE/DELETE policies)
- [ ] Security monitor deployed and scheduled
- [ ] Admin subdomain configured (admin.betfuz.com)
- [ ] Cloudflare Access enabled with corporate SSO
- [ ] WAF rules active on admin domain
- [ ] Secrets migrated to Vault/Secrets Manager
- [ ] Monitoring webhooks configured (Slack/PagerDuty)
- [ ] Separate CI/CD pipeline for admin deployment
- [ ] All security tests passing

---

## Support

Questions? Check:
- Full guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Architecture: `ADMIN_ARCHITECTURE.md`
- Security checklist: `SECURITY_CHECKLIST.md`
