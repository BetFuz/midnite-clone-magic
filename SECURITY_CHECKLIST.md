# Betfuz Security Checklist - Production Readiness

## ✅ IMMEDIATE (Day 0-7) - COMPLETED

### Database Security
- [x] ✅ **user_roles table created** - Role management separate from profiles
- [x] ✅ **app_role enum** - (user/admin/superadmin)
- [x] ✅ **has_role() function** - Security definer prevents recursive RLS
- [x] ✅ **RLS enabled** - All admin tables protected
- [x] ✅ **Immutable audit log** - admin_audit_log with no UPDATE/DELETE policies
- [x] ✅ **admin_webhook_settings table** - Secure webhook configuration storage

### Edge Functions Security
- [x] ✅ **admin-api-gateway** - Comprehensive validation gateway
- [x] ✅ **JWT validation** - All admin endpoints protected
- [x] ✅ **Server-side role checking** - Never client-side
- [x] ✅ **Rate limiting** - 100 requests/minute per admin
- [x] ✅ **IP allowlisting** - Configurable via environment variables
- [x] ✅ **Token age validation** - <15 minutes required
- [x] ✅ **MFA verification headers** - x-admin-mfa support
- [x] ✅ **Audit logging** - All admin actions logged

### Frontend Security
- [x] ✅ **AdminGuard component** - Server-side validation wrapper
- [x] ✅ **useAdminAuth hook** - Role checking from database
- [x] ✅ **Admin pages separated** - Distinct from public pages
- [x] ✅ **Admin Dashboard** - Real-time monitoring and audit logs
- [x] ✅ **Webhook Settings** - Secure configuration page

### Security Headers
- [x] ✅ **Strict-Transport-Security** - HSTS enabled
- [x] ✅ **X-Content-Type-Options** - nosniff
- [x] ✅ **X-Frame-Options** - DENY
- [x] ✅ **X-XSS-Protection** - Enabled
- [x] ✅ **Content-Security-Policy** - Configured

---

## 🔄 SHORT TERM (Week 1-4) - ACTION REQUIRED

### Deployment Separation
- [ ] **CRITICAL:** Deploy admin app to admin.betfuz.com subdomain
- [ ] **CRITICAL:** Configure separate CI/CD pipeline for admin
- [ ] **CRITICAL:** Use different deploy keys for admin vs public
- [ ] Set up Cloudflare Pages for admin.betfuz.com
- [ ] Configure environment variables separately

### Access Control
- [ ] **CRITICAL:** Put admin app behind Cloudflare Access or Google IAP
- [ ] Require SSO login (Google/Microsoft OAuth)
- [ ] Enforce MFA for all admin users
- [ ] Configure email domain restrictions
- [ ] Set up admin user group in identity provider

### Database Hardening
- [ ] Create separate DB user for admin operations
- [ ] Grant minimal required permissions to admin DB user
- [ ] Set up read-replica for admin reporting queries
- [ ] Implement connection pooling for admin operations
- [ ] Configure DB query timeout limits

### Session Management
- [ ] **CRITICAL:** Implement MFA requirement for admin login
- [ ] Add TOTP authenticator support (Google Authenticator/Authy)
- [ ] Force password rotation every 90 days
- [ ] Implement session invalidation on role changes
- [ ] Set httpOnly cookies with SameSite=Strict
- [ ] Use separate cookie domains (admin vs public)

### WAF Configuration
- [ ] Configure Cloudflare WAF rules for admin endpoints
- [ ] Set up IP reputation checks
- [ ] Enable bot protection on admin routes
- [ ] Configure geographic restrictions if needed
- [ ] Set up DDoS protection layer

### Secrets Management
- [ ] **CRITICAL:** Migrate secrets to HashiCorp Vault or AWS Secrets Manager
- [ ] Rotate all existing API keys and tokens
- [ ] Set up automatic key rotation (30-90 day schedule)
- [ ] Remove any hardcoded secrets from codebase
- [ ] Use separate secrets vaults for admin vs public

### Monitoring & Alerting
- [ ] **CRITICAL:** Set up centralized logging (ELK/Splunk/CloudWatch)
- [ ] Configure critical alert: Failed admin login (>5 in 10 min)
- [ ] Configure alert: Unauthorized role escalation attempts
- [ ] Configure alert: Suspicious IP access patterns
- [ ] Configure alert: Rate limit threshold breaches
- [ ] Configure alert: Database permission errors
- [ ] Set up PagerDuty or OpsGenie integration
- [ ] Create on-call rotation for security incidents

### Audit Trail Enhancement
- [ ] **CRITICAL:** Export audit logs to append-only S3 bucket
- [ ] Configure lifecycle policies for log retention (7 years)
- [ ] Set up log analysis and anomaly detection
- [ ] Create audit log review dashboard with filters
- [ ] Implement automated suspicious activity detection
- [ ] Set up weekly audit log review process

---

## 🚀 MEDIUM TERM (Month 2-3) - RECOMMENDED

### Advanced Security
- [ ] Implement mTLS between admin app and API gateway
- [ ] Add client certificate validation
- [ ] Set up certificate rotation automation
- [ ] Configure mutual authentication
- [ ] Implement certificate revocation checking

### Penetration Testing
- [ ] Schedule quarterly penetration testing
- [ ] Set up bug bounty program
- [ ] Conduct internal security audits
- [ ] Perform code security reviews
- [ ] Test for OWASP Top 10 vulnerabilities

### Compliance & Documentation
- [ ] Document security procedures
- [ ] Create incident response playbook
- [ ] Set up security training for admins
- [ ] Implement change management process
- [ ] Create security review checklist

### Admin Role Management
- [ ] Build admin role management UI
- [ ] Implement approval workflow for role grants
- [ ] Add email notifications for role changes
- [ ] Create role assignment audit trail
- [ ] Set up automated role review (quarterly)

### Advanced Monitoring
- [ ] Set up security information and event management (SIEM)
- [ ] Implement user behavior analytics (UBA)
- [ ] Configure threat intelligence feeds
- [ ] Set up security dashboard with metrics
- [ ] Create security KPI tracking

---

## 📊 TESTING VERIFICATION

### Security Tests to Run

#### 1. IP Allowlisting Test
```bash
# From non-whitelisted IP (should fail)
curl -X POST https://your-project.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json"

# Expected: {"error": "IP not authorized"}
```

#### 2. Rate Limiting Test
```bash
# Send 101 requests rapidly
for i in {1..101}; do
  curl -X POST https://your-project.supabase.co/functions/v1/admin-webhook-settings \
    -H "Authorization: Bearer YOUR_JWT"
done

# Request 101 should fail: {"error": "Rate limit exceeded"}
```

#### 3. Token Age Test
```bash
# Use JWT token older than 15 minutes
curl -X POST https://your-project.supabase.co/functions/v1/admin-api-gateway \
  -H "Authorization: Bearer OLD_JWT"

# Expected: {"error": "Token too old, please re-authenticate"}
```

#### 4. Role Validation Test
```bash
# Try admin endpoint as regular user
curl -X GET https://your-project.supabase.co/functions/v1/admin-audit-logs \
  -H "Authorization: Bearer USER_JWT"

# Expected: {"error": "Admin role required"}
```

#### 5. Audit Log Test
```bash
# Check that all admin actions are logged
# Query admin_audit_log table after any admin operation
SELECT * FROM admin_audit_log 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

# Verify: action, admin_id, ip_address, user_agent, status populated
```

---

## 🎯 PRIORITY MATRIX

### P0 - Critical (Complete immediately)
1. Deploy admin to separate subdomain
2. Enable Cloudflare Access/IAP
3. Implement MFA requirement
4. Set up centralized logging
5. Export audit logs to S3

### P1 - High (Complete within 2 weeks)
1. Configure WAF rules
2. Migrate to Vault/Secrets Manager
3. Create separate DB user for admin
4. Set up critical alerts
5. Implement session management

### P2 - Medium (Complete within 1 month)
1. Add mTLS support
2. Set up penetration testing
3. Create admin role management UI
4. Implement advanced monitoring
5. Document security procedures

### P3 - Low (Complete within 3 months)
1. Set up SIEM
2. Create bug bounty program
3. Implement UBA
4. Advanced threat detection
5. Security KPI dashboard

---

## 🚨 INCIDENT RESPONSE

If you detect suspicious admin activity:

1. **Immediate Actions:**
   - Check Admin Dashboard for failed access attempts
   - Review audit logs for the admin user
   - Verify IP address of suspicious activity
   - Check if MFA was verified
   - Look for pattern of unauthorized attempts

2. **Investigation:**
   - Query audit logs: `SELECT * FROM admin_audit_log WHERE admin_id = 'SUSPICIOUS_USER_ID'`
   - Check for role escalation attempts
   - Review webhook configuration changes
   - Verify database permission errors

3. **Containment:**
   - Revoke admin role if compromised: `DELETE FROM user_roles WHERE user_id = 'USER_ID' AND role = 'admin'`
   - Invalidate user sessions
   - Add IP to blocklist if needed
   - Review all recent actions by the user

4. **Recovery:**
   - Reset user credentials
   - Force password change
   - Re-verify MFA setup
   - Audit all changes made by compromised account
   - Restore from backup if needed

5. **Post-Incident:**
   - Document incident details
   - Update security procedures
   - Notify affected parties if required
   - Improve monitoring/detection
   - Conduct lessons learned review

---

## 📞 CONTACTS

**Security Team:**
- On-Call: [Configure PagerDuty rotation]
- Email: security@betfuz.com
- Slack: #security-alerts

**Escalation Path:**
1. On-call engineer
2. Security lead
3. CTO
4. CEO (critical incidents only)

---

## ✅ SIGN-OFF

Once all P0 and P1 items are complete:

- [ ] Security team sign-off
- [ ] Engineering lead sign-off
- [ ] CTO sign-off
- [ ] Legal/compliance review (if required)
- [ ] Documentation complete
- [ ] Training completed for all admins

**Production Go-Live Date:** _______________
**Security Review Date:** _______________
**Next Review Date:** _______________
