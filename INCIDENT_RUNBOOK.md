# Betfuz Incident Response Run-Book

## Emergency Contacts & Escalation

### Tier 1 - On-Call Engineer (24/7)
- **Primary**: +234-XXX-XXXX-XXX
- **Secondary**: +234-XXX-XXXX-XXX
- **Response Time**: < 5 minutes

### Tier 2 - Platform Lead
- **Contact**: +234-XXX-XXXX-XXX
- **Email**: platform-lead@betfuz.com
- **Escalate After**: 15 minutes if unresolved

### Tier 3 - CTO
- **Contact**: +234-XXX-XXXX-XXX
- **Email**: cto@betfuz.com
- **Escalate After**: 30 minutes if critical financial impact

### Tier 4 - CEO & Legal
- **Contact**: +234-XXX-XXXX-XXX
- **Email**: ceo@betfuz.com
- **Escalate For**: Regulatory breach, major security incident, > ₦10M exposure

---

## Critical Incident Procedures

### 1. Hot-Wallet Compromise Detected

**Indicators:**
- Unauthorized transactions in hot-wallet
- Unexpected balance drops > ₦100,000
- Security alert from monitoring

**Immediate Actions (< 2 minutes):**
```bash
# 1. Freeze all hot-wallet transactions
curl -X POST https://api.betfuz.com/admin/wallets/freeze \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"wallet_type": "hot", "reason": "security_incident"}'

# 2. Switch to cold-wallet only mode
curl -X POST https://api.betfuz.com/admin/wallets/cold-only \
  -H "Authorization: Bearer $ADMIN_JWT"

# 3. Alert security team
node scripts/alert-security-team.js --incident-type=wallet-compromise
```

**Follow-Up Actions (< 10 minutes):**
1. Rotate all hot-wallet keys immediately
2. Review transaction logs for unauthorized activity
3. Calculate total funds at risk
4. Contact law enforcement if theft confirmed
5. Notify insurance provider (digital asset theft policy)

**Communications:**
- Internal: Slack #incident-response channel
- External: Only after consultation with legal team
- Users: If user funds affected, use template below

---

### 2. Kill Switch - Bonus Engine Shutdown

**When to Use:**
- Bonus exploit detected
- Abnormal bonus claims (> 100 in 5 minutes)
- Fraudulent account creation surge

**Shutdown Procedure:**
```bash
# 1. Disable all bonus campaigns immediately
curl -X POST https://api.betfuz.com/admin/bonus/kill-switch \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"reason": "fraud_detected", "initiated_by": "$ADMIN_ID"}'

# 2. Freeze bonus withdrawals
curl -X POST https://api.betfuz.com/admin/bonus/freeze-withdrawals \
  -H "Authorization: Bearer $ADMIN_JWT"

# 3. Review recent bonus claims
psql -U admin -d betfuz -c "
  SELECT user_id, bonus_amount, created_at 
  FROM ledger_entries 
  WHERE transaction_type = 'bonus_credit' 
    AND created_at > NOW() - INTERVAL '1 hour'
  ORDER BY created_at DESC;
"
```

**Rollback Procedure:**
```bash
# 1. Revert fraudulent bonuses
curl -X POST https://api.betfuz.com/admin/bonus/revert \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"user_ids": ["uuid1", "uuid2"], "reason": "fraud"}'

# 2. Re-enable bonus engine after fix deployed
curl -X POST https://api.betfuz.com/admin/bonus/enable \
  -H "Authorization: Bearer $ADMIN_JWT"
```

---

### 3. Emergency Wallet Drainage

**When to Use:**
- Security breach imminent
- Hot-wallet keys compromised
- Regulatory order to freeze funds

**Drainage Procedure:**
```bash
# 1. Transfer all hot-wallet funds to cold-wallet multi-sig
node scripts/drain-hot-wallet.js \
  --destination=COLD_WALLET_ADDRESS \
  --confirm-multisig

# 2. Verify transfer completion
node scripts/verify-wallet-balance.js --wallet=hot

# 3. Document transfer in audit log
psql -U admin -d betfuz -c "
  INSERT INTO admin_audit_log 
    (admin_id, action, resource_type, resource_id, status, mfa_verified)
  VALUES 
    ('$ADMIN_ID', 'emergency_drain', 'hot_wallet', '$TRANSFER_TX_HASH', 'success', true);
"
```

**Post-Drainage:**
- All withdrawals automatically switch to manual approval
- Payment processing continues via cold-wallet multi-sig (slower)
- Enable emergency mode banner for users

---

### 4. Database Corruption / Data Loss

**Immediate Actions:**
```bash
# 1. Switch to read-replica immediately
kubectl set image deployment/api-gateway \
  postgres-url=REPLICA_DB_URL

# 2. Stop all write operations
curl -X POST https://api.betfuz.com/admin/database/read-only \
  -H "Authorization: Bearer $ADMIN_JWT"

# 3. Trigger disaster recovery from latest backup
node scripts/trigger-restore.js \
  --backup-timestamp=$(date -u +%Y%m%d_%H%M%S) \
  --confirm
```

**Recovery Steps:**
1. Identify last known good backup
2. Restore to separate database instance
3. Verify data integrity
4. Switch traffic to restored instance
5. Reconcile any transactions during downtime

---

### 5. Payment Processor Outage

**Paystack/Flutterwave Down:**
```bash
# 1. Enable backup payment processor
curl -X POST https://api.betfuz.com/admin/payments/failover \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"primary": "paystack", "backup": "flutterwave"}'

# 2. Display maintenance banner
curl -X POST https://api.betfuz.com/admin/banners/create \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{
    "message": "Payment processing experiencing delays. Deposits and withdrawals will be processed shortly.",
    "severity": "warning"
  }'
```

**If Both Processors Down:**
- Switch to manual bank transfer instructions
- Queue all withdrawal requests for processing when service restored
- Notify users via SMS/email of delays

---

### 6. NLRC License Suspension

**Immediate Actions:**
```bash
# 1. Freeze all bet placements immediately
curl -X POST https://api.betfuz.com/admin/betting/freeze \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"reason": "license_suspended"}'

# 2. Display legal compliance banner
curl -X POST https://api.betfuz.com/admin/banners/create \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{
    "message": "Betting temporarily suspended due to regulatory compliance review. Withdrawals remain available.",
    "severity": "critical"
  }'

# 3. Process all pending withdrawals
node scripts/process-pending-withdrawals.js --force
```

**Follow-Up:**
1. Contact NLRC compliance officer immediately
2. Engage legal counsel
3. Prepare compliance documentation
4. Schedule emergency board meeting

---

## Communication Templates

### Template 1: Security Incident (Internal)

**Subject:** 🚨 CRITICAL: Security Incident Detected - Action Required

**Body:**
```
INCIDENT TYPE: [Wallet Compromise / Data Breach / DDoS Attack]
SEVERITY: [Critical / High / Medium]
DETECTED AT: [Timestamp UTC]
FINANCIAL EXPOSURE: ₦[Amount]

ACTIONS TAKEN:
- [Action 1]
- [Action 2]

NEXT STEPS:
- [Step 1]
- [Step 2]

INCIDENT COMMANDER: [Name]
STATUS PAGE: https://status.betfuz.com/incident/[ID]
```

---

### Template 2: User Communication (Planned Maintenance)

**Subject:** Scheduled Maintenance - Betfuz Platform Upgrade

**Body:**
```
Dear Betfuz User,

We will be performing scheduled maintenance on [Date] from [Start Time] to [End Time] WAT.

During this period:
✅ Viewing odds and matches - Available
✅ Withdrawals - Available
❌ Bet placement - Temporarily unavailable
❌ Deposits - Temporarily unavailable

All bets placed before maintenance will be honored and settled normally.

Thank you for your patience.

- Betfuz Team
```

---

### Template 3: User Communication (Security Incident)

**Subject:** Important Security Update - Your Account is Safe

**Body:**
```
Dear Betfuz User,

We detected and resolved a security incident affecting our platform on [Date].

YOUR ACCOUNT STATUS:
✅ Your funds are safe and secure
✅ No unauthorized access to your account
✅ All withdrawals are being processed normally

WHAT WE DID:
- Immediately isolated the issue
- Enhanced security protocols
- Verified all user funds

WHAT YOU SHOULD DO:
- Update your password as a precaution
- Enable 2-factor authentication (recommended)
- Review recent account activity

If you notice any suspicious activity, contact support immediately at support@betfuz.com or WhatsApp +234-XXX-XXXX-XXX.

Thank you for your trust.

- Betfuz Security Team
```

---

### Template 4: Regulatory Communication (NLRC)

**Subject:** Incident Report - Betfuz Platform [Incident ID]

**Body:**
```
TO: National Lottery Regulatory Commission (NLRC)
FROM: Betfuz Limited
DATE: [Date]
INCIDENT ID: [ID]

INCIDENT SUMMARY:
Type: [Security / Financial / Compliance]
Occurred: [Timestamp]
Detected: [Timestamp]
Resolved: [Timestamp]

FINANCIAL IMPACT:
User Funds Affected: ₦[Amount]
Platform Loss: ₦[Amount]
Insurance Claim Filed: [Yes/No]

ACTIONS TAKEN:
1. [Action 1]
2. [Action 2]

ROOT CAUSE:
[Description]

PREVENTIVE MEASURES:
1. [Measure 1]
2. [Measure 2]

ATTACHMENTS:
- Technical incident report
- Audit logs
- Pen-test validation report

Contact: compliance@betfuz.com | +234-XXX-XXXX-XXX
```

---

## Post-Incident Review (PIR)

**Within 48 Hours of Resolution:**

1. **Incident Timeline**
   - First detection
   - Escalation points
   - Resolution time
   - Total downtime

2. **Impact Assessment**
   - Users affected
   - Financial loss
   - Reputational damage
   - Regulatory implications

3. **Root Cause Analysis**
   - What happened?
   - Why did it happen?
   - Why wasn't it prevented?

4. **Action Items**
   - Technical improvements
   - Process improvements
   - Training needs
   - Monitoring enhancements

5. **Documentation**
   - Update run-book
   - Update monitoring alerts
   - Update training materials
   - Share learnings with team

---

## Regular Drills & Testing

### Monthly Fire Drills (First Monday, 10:00 WAT)
- Hot-wallet drainage simulation
- Bonus engine kill switch test
- Communication template review
- Escalation contact verification

### Quarterly Full Simulation
- Complete blue-green deployment with rollback
- Database restore from backup
- Multi-team coordination exercise
- External communication simulation

---

## Monitoring & Alerting Thresholds

### Automatic Alerts (PagerDuty)

**Financial:**
- Hot-wallet balance drop > ₦100,000 in 5 minutes
- Withdrawal queue > 50 pending for > 30 minutes
- Failed transactions > 10% in 5 minutes

**Security:**
- Failed login attempts > 100/minute from single IP
- New admin user created
- RLS policy modification
- Hot-wallet key rotation

**Performance:**
- API response time > 2 seconds (p95)
- Database CPU > 80% for 5 minutes
- Edge function cold starts > 100/minute

**Business:**
- Bonus claims > 100 in 5 minutes
- Bet placement drop > 50% vs baseline
- NLRC license check failure

---

## Appendix: Quick Reference Commands

```bash
# Check platform health
curl https://api.betfuz.com/health/all

# View recent audit logs
psql -U admin -d betfuz -c "SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 50;"

# Check hot-wallet balance
node scripts/check-wallet-balance.js --wallet=hot

# View active incidents
curl https://status.betfuz.com/api/incidents/active

# Emergency shutdown (all betting)
curl -X POST https://api.betfuz.com/admin/emergency/shutdown \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{"reason": "emergency", "mfa_code": "$MFA_CODE"}'
```

---

**Last Updated:** [Date]  
**Next Review:** [Date + 90 days]  
**Owner:** Platform Engineering Team
