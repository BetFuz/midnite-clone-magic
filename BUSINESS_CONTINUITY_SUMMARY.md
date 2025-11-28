# Betfuz Business Continuity Implementation Summary

## Overview

This document summarizes the business continuity infrastructure implemented for the Betfuz platform, covering deployment safety, incident response, and insurance coverage.

---

## 1. Blue-Green Deployment with Hot-Wallet Smoke Test

### Implementation
**File**: `.github/workflows/ecs-deploy.yml`

### Key Features

**Automated Smoke Test Flow:**
1. **Postman API Tests**: Validates all critical API endpoints
2. **Hot-Wallet Financial Test** (₦100 real money):
   - Create test user account
   - Deposit ₦100 to hot-wallet
   - Verify balance in ledger
   - Place ₦50 test bet
   - Initiate ₦50 withdrawal
   - Confirm all transactions recorded in immutable ledger

**Safety Mechanisms:**
- ✅ Automatic rollback if any smoke test fails
- ✅ Real money validation (₦100) ensures payment processing works
- ✅ PagerDuty alert triggers on failure
- ✅ Slack notification on successful deployment
- ✅ GitHub issue created for failed deployments

**Why ₦100?**
- Large enough to trigger all financial workflows
- Small enough to be acceptable test cost
- Validates entire payment stack (deposit → ledger → betting → withdrawal)

### Configuration Required

```yaml
# GitHub Secrets to Configure:
secrets:
  AWS_ACCESS_KEY_ID: [AWS IAM key]
  AWS_SECRET_ACCESS_KEY: [AWS IAM secret]
  POSTMAN_API_KEY: [Postman API key]
  POSTMAN_COLLECTION_ID: [Collection ID]
  PAGERDUTY_WEBHOOK: [PagerDuty integration URL]
  PAGERDUTY_ROUTING_KEY: [PagerDuty routing key]
  SLACK_WEBHOOK: [Slack incoming webhook URL]
```

---

## 2. Incident Response Run-Book

### Implementation
**File**: `INCIDENT_RUNBOOK.md`

### Critical Incident Procedures

**Six Major Incident Types:**

1. **Hot-Wallet Compromise**
   - Freeze all hot-wallet transactions
   - Switch to cold-wallet only mode
   - Rotate keys immediately
   - Contact insurance provider
   - Response time: < 2 minutes

2. **Bonus Engine Exploit**
   - Kill-switch to disable all bonus campaigns
   - Freeze bonus withdrawals
   - Review recent bonus claims
   - Revert fraudulent bonuses
   - Re-enable after fix deployed

3. **Emergency Wallet Drainage**
   - Transfer all hot-wallet funds to cold-wallet multi-sig
   - Document in audit log
   - Switch to manual withdrawal approval
   - Enable emergency mode banner

4. **Database Corruption**
   - Switch to read-replica
   - Stop all write operations
   - Restore from latest backup
   - Reconcile transactions during downtime

5. **Payment Processor Outage**
   - Failover to backup processor
   - Display maintenance banner
   - Queue withdrawals for processing
   - Manual bank transfer instructions if both down

6. **NLRC License Suspension**
   - Freeze all bet placements
   - Display compliance banner
   - Process pending withdrawals
   - Contact NLRC compliance officer

### Escalation Contact Tree

```
Tier 1: On-Call Engineer (< 5 min response)
   ↓ (15 min if unresolved)
Tier 2: Platform Lead
   ↓ (30 min if critical)
Tier 3: CTO
   ↓ (Major breach or > ₦10M exposure)
Tier 4: CEO & Legal
```

### Communication Templates

Four pre-written templates provided:
- Internal security incident alert
- User communication (planned maintenance)
- User communication (security incident)
- Regulatory communication (NLRC)

### Regular Drills

**Monthly Fire Drills** (First Monday, 10:00 WAT):
- Hot-wallet drainage simulation
- Bonus engine kill switch test
- Communication template review
- Contact verification

**Quarterly Full Simulation**:
- Complete blue-green deployment with rollback
- Database restore from backup
- Multi-team coordination exercise
- External communication simulation

---

## 3. Digital Asset Theft Insurance

### Implementation
**File**: `INSURANCE_DIGITAL_ASSETS.md`

### Coverage Requirements

| Coverage Type | Limit | Premium Rate | Annual Cost |
|---------------|-------|--------------|-------------|
| Hot-Wallet Theft | ₦50M | 2.0% | ₦1,000,000 |
| Cold-Wallet Breach | ₦500M | 1.5% | ₦7,500,000 |
| Payment Processor Breach | ₦100M | 1.8% | ₦1,800,000 |
| Business Interruption | ₦25M | 3.0% | ₦750,000 |
| Legal Defense | ₦15M | 2.5% | ₦375,000 |
| Crisis Management | ₦5M | 4.0% | ₦200,000 |
| **TOTAL** | **₦695M** | **1.66% avg** | **₦11,625,000** |

**Monthly Cost**: ₦968,750/month  
**As % of GGR**: ~0.5% - 1.5%

### Recommended Insurers

**Tier 1 (Global Specialists):**
- Lloyd's of London Syndicates
- Chubb Insurance
- AIG CyberEdge

**Tier 2 (Nigerian Insurers):**
- Leadway Assurance
- Custodian Investment PLC
- AIICO Insurance

**Tier 3 (Crypto-Native):**
- Nexus Mutual (DeFi protocol)
- Evertas (Cryptocurrency specialist)

### Pre-Approval Security Audit Checklist

Infrastructure Security:
- ✅ AWS KMS for hot-wallet keys
- ✅ Cold-wallet multi-sig (2-of-3 or 3-of-5)
- ✅ HSM for key storage
- ✅ VPN-only admin access
- ✅ Cloudflare WAF with DDoS protection

Access Controls:
- ✅ MFA for all admin accounts
- ✅ RBAC with least privilege
- ✅ 2-person approval for large transactions (> ₦1M)
- ✅ IP allowlisting
- ✅ Immutable audit logging

Monitoring & Response:
- ✅ 24/7 SOC monitoring
- ✅ Real-time anomaly detection
- ✅ Automated alerts
- ✅ Incident response run-book
- ✅ Quarterly pen-tests

Compliance:
- ✅ NLRC license (active)
- ✅ KYC/AML procedures
- ✅ Responsible gaming limits
- ✅ 7-year document retention
- ✅ Quarterly reporting

### Procurement Timeline

**8-Week Process:**
1. **Week 1-2**: Send RFP to 5-7 insurers
2. **Week 3-4**: Security audit by external firm
3. **Week 5-6**: Underwriting review by insurers
4. **Week 7**: Quote comparison and legal review
5. **Week 8**: Policy binding and payment

### White Paper for Card-Acquiring Banks

**Required for Paystack/Flutterwave Integration:**
- Certificate of Insurance (single-page PDF)
- Coverage limits clearly stated
- Policy period and premium payment proof
- Security audit summary
- Insurer signature with QR code verification

**Distribution:**
- Paystack: compliance@paystack.com
- Flutterwave: risk@flutterwave.com

---

## 4. Disaster Recovery Enhancements

### Implementation
**File**: `src/pages/admin/DisasterRecovery.tsx`

### Current Features
- View all encrypted backups in Supabase Storage
- Run manual backup (invokes `backup-database` edge function)
- Test restore from backup (dry-run validation)
- Download backups locally
- Setup instructions for nightly cron job

### Recommended Enhancements
- Real-time backup status monitoring
- Automatic monthly restore testing
- Backup retention policy management (auto-delete old backups)
- Offsite backup replication (AWS S3 Glacier)
- Backup integrity verification (checksum validation)

---

## 5. Next Steps & Recommendations

### Immediate Actions (Week 1)

1. **Configure GitHub Secrets**
   - Add AWS credentials for ECS deployment
   - Add Postman API key and collection ID
   - Configure PagerDuty webhook
   - Configure Slack webhook

2. **Test Blue-Green Deployment**
   - Create test tag (`git tag v1.0.0-test`)
   - Push to trigger workflow
   - Verify hot-wallet smoke test runs
   - Confirm rollback works on failure

3. **Distribute Incident Run-Book**
   - Share with all engineering team
   - Print laminated copy for ops desk
   - Add to Confluence/Wiki
   - Schedule first monthly fire drill

### Short-Term (Month 1-2)

4. **Engage Insurance Broker**
   - Contact Marsh or AON Nigeria
   - Request RFP assistance
   - Begin security audit preparation

5. **Implement Monitoring Alerts**
   - Set up PagerDuty integration
   - Configure alert thresholds per run-book
   - Test on-call escalation

6. **Backup Automation**
   - Configure nightly cron job (02:00 WAT)
   - Set up monthly restore testing
   - Implement retention policy (90 days)

### Medium-Term (Month 3-6)

7. **Insurance Policy Execution**
   - Complete RFP process
   - Obtain quotes from 5+ insurers
   - Bind policy and pay premium
   - Provide certificate to Paystack/Flutterwave

8. **Disaster Recovery Testing**
   - Conduct first full DR drill
   - Test database restore end-to-end
   - Validate backup integrity
   - Document lessons learned

9. **Regulatory Compliance**
   - Submit pen-test report to NLRC
   - Provide insurance certificate
   - Document incident response capabilities

### Long-Term (Ongoing)

10. **Continuous Improvement**
    - Review incident run-book quarterly
    - Update insurance coverage as platform grows
    - Conduct annual penetration tests
    - Train new team members on procedures

---

## 6. Success Metrics

### Deployment Safety
- **Target**: 0 production incidents from bad deployments
- **Metric**: Smoke test pass rate > 99%
- **Current**: Smoke tests include ₦100 real-money validation

### Incident Response
- **Target**: < 5 minute detection-to-action time
- **Metric**: Average time from incident detection to kill-switch activation
- **Current**: Run-book provides < 2 minute procedures

### Insurance Coverage
- **Target**: 100% of float covered by insurance
- **Metric**: (Insurance coverage) / (Total platform float)
- **Current**: ₦695M coverage planned (adjust based on float size)

### Business Continuity
- **Target**: < 4 hours downtime per year
- **Metric**: Total unplanned downtime
- **Current**: Blue-green deployment minimizes downtime, automatic rollback prevents extended outages

---

## 7. Cost Summary

| Category | One-Time Cost | Annual Cost | Notes |
|----------|---------------|-------------|-------|
| Security Audit | ₦2,000,000 | ₦2,000,000 | Required by insurers |
| Insurance Premiums | — | ₦11,625,000 | All coverage types |
| Monitoring Tools | ₦500,000 | ₦1,200,000 | PagerDuty, Datadog |
| DR Infrastructure | ₦1,000,000 | ₦600,000 | S3 Glacier, backup storage |
| Training & Drills | — | ₦500,000 | Quarterly simulations |
| **TOTAL** | **₦3,500,000** | **₦15,925,000** | ₦1,327,083/month |

**As % of Revenue**: ~1-2% of Gross Gaming Revenue (typical for betting platforms)

**ROI Justification**:
- Prevents catastrophic losses (> ₦50M hot-wallet compromise)
- Required for payment processor integration (Paystack, Flutterwave)
- Required for NLRC compliance and license renewal
- Reduces insurance premiums over time (good security posture)

---

## 8. Appendix: Quick Reference

### Emergency Contact Numbers
- **On-Call Engineer**: +234-XXX-XXXX-XXX
- **Platform Lead**: +234-XXX-XXXX-XXX
- **CTO**: +234-XXX-XXXX-XXX

### Emergency Procedures
```bash
# Freeze all betting
curl -X POST https://api.betfuz.com/admin/emergency/shutdown \
  -H "Authorization: Bearer $ADMIN_JWT"

# Drain hot-wallet
node scripts/drain-hot-wallet.js --destination=COLD_WALLET_ADDRESS

# Check platform health
curl https://api.betfuz.com/health/all
```

### Important URLs
- **Status Page**: https://status.betfuz.com
- **Admin Dashboard**: https://admin.betfuz.com
- **Incident Run-Book**: [GitHub/Confluence Link]
- **Insurance Policy**: [Document Management System Link]

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date + 90 days]  
**Owner**: Platform Engineering & Risk Management Team
