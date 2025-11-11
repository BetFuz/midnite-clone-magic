# Betfuz Admin Separation - Production Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Public App: betfuz.com                                      │
│  ├─ Frontend: React + Vite                                   │
│  ├─ Auth: Supabase Auth (JWT)                               │
│  └─ API: Edge Functions (public endpoints)                  │
│                                                               │
│  Admin App: admin.betfuz.com (or internal VPN)              │
│  ├─ Frontend: Separate deployment                           │
│  ├─ Auth: Supabase Auth + MFA Required                      │
│  ├─ Network: Cloudflare Access / IAP                        │
│  └─ API Gateway: admin-api-gateway edge function            │
│                                                               │
│  API Gateway: Edge Functions                                 │
│  ├─ JWT Validation                                           │
│  ├─ Role-based access control (admin/superadmin)            │
│  ├─ IP Allowlisting                                          │
│  ├─ Rate Limiting (100 req/min per admin)                   │
│  ├─ Token age validation (<15 min)                          │
│  ├─ MFA verification check                                   │
│  └─ Immutable audit logging                                  │
│                                                               │
│  Database: Supabase PostgreSQL                               │
│  ├─ user_roles table (admin role management)                │
│  ├─ admin_audit_log (immutable audit trail)                 │
│  ├─ admin_webhook_settings (secure config)                  │
│  └─ RLS policies enforced at DB level                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Security Checklist (Immediate - Day 0-7)

### Database Security
- [x] Create separate `user_roles` table (never store roles in profiles)
- [x] Implement `app_role` enum (user/admin/superadmin)
- [x] Create `has_role()` security definer function (prevents recursive RLS)
- [x] Enable RLS on all admin tables
- [x] Create immutable `admin_audit_log` table (no UPDATE/DELETE policies)
- [ ] **TODO:** Configure separate DB user for admin operations with limited permissions
- [ ] **TODO:** Set up read-replica for admin reporting queries

### Edge Functions Security
- [x] Create `admin-api-gateway` with comprehensive validation
- [x] JWT validation on all admin endpoints
- [x] Server-side role checking (never client-side)
- [x] Rate limiting (100 req/min per admin)
- [x] IP allowlisting capability
- [x] Token age validation (<15 minutes)
- [x] MFA verification headers
- [x] Audit logging for all admin actions
- [ ] **TODO:** Implement mTLS between admin app and API
- [ ] **TODO:** Add client certificate validation

### Frontend Security
- [x] Create `AdminGuard` component with server-side validation
- [x] Create `useAdminAuth` hook with role checking
- [x] Separate admin pages from public pages
- [ ] **TODO:** Deploy admin app to separate subdomain (admin.betfuz.com)
- [ ] **TODO:** Configure different CI/CD pipeline for admin deployment
- [ ] **TODO:** Use separate deploy keys for admin app
- [ ] **TODO:** Put admin app behind Cloudflare Access or Google IAP

### Session & Auth Security
- [x] Short JWT token TTLs (validated as <15 min in gateway)
- [ ] **TODO:** Implement MFA requirement for all admin users
- [ ] **TODO:** Add TOTP authenticator support
- [ ] **TODO:** Force password rotation every 90 days
- [ ] **TODO:** Implement session invalidation on role changes
- [ ] **TODO:** Add httpOnly cookies with SameSite=Strict
- [ ] **TODO:** Separate cookie domains for admin vs public

### Headers & CSP
- [x] Strict-Transport-Security (HSTS)
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] X-XSS-Protection
- [x] Content-Security-Policy
- [ ] **TODO:** Configure CSP reporting endpoint
- [ ] **TODO:** Add Subresource Integrity (SRI) for external scripts

## 🔧 Short Term Setup (Week 1-4)

### WAF Configuration
- [ ] Configure Cloudflare WAF rules for admin endpoints
- [ ] Set up IP reputation checks
- [ ] Enable bot protection on admin routes
- [ ] Configure geographic restrictions if needed
- [ ] Set up DDoS protection

### Secrets Management
- [ ] Migrate to HashiCorp Vault or AWS Secrets Manager
- [ ] Rotate all API keys and tokens
- [ ] Implement automatic key rotation (30-90 days)
- [ ] Remove hardcoded secrets from codebase
- [ ] Set up separate secrets for admin vs public

### Monitoring & Alerting
- [ ] Set up centralized logging (ELK/Splunk/CloudWatch)
- [ ] Configure critical alerts:
  - [ ] Failed admin login attempts (>5 in 10 min)
  - [ ] Unauthorized role escalation attempts
  - [ ] Suspicious IP access patterns
  - [ ] Rate limit threshold breaches
  - [ ] Database permission errors
- [ ] Set up admin dashboard with real-time metrics
- [ ] Configure PagerDuty/OpsGenie for critical alerts

### Audit Trail Enhancement
- [x] Immutable audit log in database
- [ ] Export audit logs to separate append-only S3 bucket
- [ ] Configure lifecycle policies for log retention
- [ ] Set up log analysis and anomaly detection
- [ ] Create audit log review dashboard

## 🚀 Deployment Steps

### Step 1: Enable Admin IP Allowlisting (Optional but Recommended)

Set Supabase secrets for IP allowlisting:

```bash
# In Supabase Dashboard > Settings > Secrets
ENABLE_ADMIN_IP_WHITELIST=true
ADMIN_ALLOWED_IPS=203.0.113.0,203.0.113.1,203.0.113.2
```

### Step 2: Deploy Edge Functions

Edge functions are automatically deployed. Verify in Supabase Dashboard:
- `admin-api-gateway` - API gateway with security checks
- `admin-webhook-settings` - Webhook configuration management
- `admin-audit-logs` - Audit trail retrieval

### Step 3: Grant Admin Roles

Super admins must be granted manually via database:

```sql
-- Grant superadmin role to first admin
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  'YOUR_USER_UUID',
  'superadmin',
  'YOUR_USER_UUID'
);
```

### Step 4: Deploy Admin App to Separate Subdomain

#### Option A: Cloudflare Pages (Recommended)

```bash
# 1. Create separate Cloudflare Pages project
# 2. Configure custom domain: admin.betfuz.com
# 3. Deploy admin pages only:
npm run build -- --mode admin
```

#### Option B: Vercel/Netlify

```bash
# Create separate project for admin
# Configure environment variables
# Deploy with custom domain
```

### Step 5: Configure Cloudflare Access

```yaml
# Cloudflare Access Policy for admin.betfuz.com
policies:
  - name: Admin Portal Access
    decision: allow
    include:
      - email_domain: yourcompany.com
    require:
      - auth_method: "Google OAuth"
      - group: "Admins"
    mfa: required
```

### Step 6: Set Up Monitoring

```bash
# Configure monitoring endpoints
# Set up alerts for:
# - Failed admin access (>5 in 10 min)
# - Suspicious IP patterns
# - Rate limit breaches
# - Database errors on admin tables
```

## 🔐 Security Best Practices

### Admin Access Pattern

```typescript
// CORRECT: Always use API gateway for admin operations
const response = await supabase.functions.invoke('admin-webhook-settings', {
  body: { /* data */ },
  headers: {
    'x-admin-mfa': 'verified', // After MFA check
  }
});

// WRONG: Never query admin tables directly from client
// const { data } = await supabase.from('admin_webhook_settings').select();
```

### Role Assignment Pattern

```typescript
// CORRECT: Only superadmins can grant admin roles
// This is enforced by RLS policies
INSERT INTO user_roles (user_id, role, granted_by)
VALUES ($1, 'admin', auth.uid())
WHERE has_role(auth.uid(), 'superadmin');

// WRONG: Never allow self-assignment of admin roles
```

### Audit Logging Pattern

```typescript
// All admin actions are automatically logged via RPC
await supabase.rpc('log_admin_action', {
  _admin_id: userId,
  _action: 'WEBHOOK_UPDATE',
  _resource_type: 'webhook_settings',
  _resource_id: '1',
  _payload_hash: sha256Hash,
  _ip_address: clientIp,
  _user_agent: userAgent,
  _mfa_verified: true,
  _status: 'success'
});
```

## 📊 Admin Pages

### Created Admin Pages
1. **Admin Dashboard** (`/admin/dashboard`)
   - Real-time audit logs
   - Security alerts
   - Admin user count
   - Failed access tracking
   - Critical event monitoring

2. **Webhook Settings** (`/admin/webhook-settings`)
   - Secure webhook URL configuration
   - HTTPS-only enforcement
   - Test webhook functionality
   - Audit-logged changes
   - Super admin only access

### Access Control
- All admin pages wrapped in `<AdminGuard>`
- Requires authenticated session
- Validates admin/superadmin role server-side
- Redirects unauthorized users to auth page

## 🧪 Testing Security

### Test IP Allowlisting
```bash
# Should fail from non-whitelisted IP
curl -X POST https://your-project.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer YOUR_JWT"

# Response: {"error": "IP not authorized"}
```

### Test Rate Limiting
```bash
# Send 101 requests rapidly
for i in {1..101}; do
  curl -X POST https://your-project.supabase.co/functions/v1/admin-webhook-settings
done

# Request 101 should fail with: {"error": "Rate limit exceeded"}
```

### Test Token Age
```bash
# Use token older than 15 minutes
# Should fail with: {"error": "Token too old, please re-authenticate"}
```

### Test Role Validation
```bash
# Try accessing admin endpoint as regular user
# Should fail with: {"error": "Admin role required"}
```

## 🔄 Migration Path from Option 1 to Option 2

If you previously implemented Option 1 (logical separation):

1. ✅ Database migrations already complete
2. ✅ Edge functions with role checks deployed
3. ✅ Admin guards on frontend pages implemented
4. 🔄 **Next Steps:**
   - Deploy admin app to separate subdomain
   - Configure Cloudflare Access/IAP
   - Enable IP allowlisting
   - Set up monitoring and alerts
   - Implement MFA requirement
   - Configure separate CI/CD pipeline

## 📞 Support & Security Incidents

For security incidents or questions:
1. Check audit logs in Admin Dashboard
2. Review failed access attempts
3. Verify IP allowlist configuration
4. Check rate limit logs
5. Contact security team if suspicious activity detected

## 🎯 Next Steps

Priority order for completing Option 2:

1. **High Priority:**
   - [ ] Deploy admin app to admin.betfuz.com
   - [ ] Configure Cloudflare Access with SSO + MFA
   - [ ] Enable IP allowlisting for admin endpoints
   - [ ] Set up monitoring alerts

2. **Medium Priority:**
   - [ ] Implement MFA requirement for all admins
   - [ ] Configure WAF rules
   - [ ] Set up secrets rotation
   - [ ] Create admin role management UI

3. **Low Priority:**
   - [ ] Add mTLS between admin and API
   - [ ] Set up read-replica for reporting
   - [ ] Configure penetration testing schedule
   - [ ] Add biometric authentication option
