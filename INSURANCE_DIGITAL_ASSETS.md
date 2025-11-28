# Digital Asset Theft Insurance - Betfuz Platform

## Insurance Coverage Requirements

### Policy Type: Cyber & Digital Asset Theft Insurance

**Coverage Needed:**
- Hot-wallet cryptocurrency theft
- Cold-wallet security breach (multi-sig compromise)
- Internal fraud (employee theft)
- Third-party payment processor breach
- Smart contract exploits
- Social engineering attacks targeting wallet access

---

## Recommended Coverage Limits

### Primary Coverage
- **Hot-Wallet Theft**: ₦50,000,000 ($100,000 USD equivalent)
  - Rationale: 10% of float maintained in hot-wallet for operational liquidity
  - Daily transaction volume coverage for 72-hour recovery period

- **Cold-Wallet Breach**: ₦500,000,000 ($1,000,000 USD equivalent)
  - Rationale: 90% of float maintained in cold-wallet multi-sig
  - Covers catastrophic multi-sig compromise scenario

- **Third-Party Processor Breach**: ₦100,000,000 ($200,000 USD equivalent)
  - Rationale: Paystack/Flutterwave payment gateway vulnerabilities
  - Covers user funds in transit during deposit/withdrawal processing

### Supplementary Coverage
- **Business Interruption**: ₦25,000,000 ($50,000 USD)
  - Covers revenue loss during platform downtime following security incident
  - Up to 30 days of lost gross gaming revenue (GGR)

- **Legal & Regulatory Defense**: ₦15,000,000 ($30,000 USD)
  - NLRC compliance violation defense
  - User lawsuit defense costs
  - Regulatory investigation costs

- **Crisis Management & PR**: ₦5,000,000 ($10,000 USD)
  - Professional PR firm engagement following security breach
  - User communication campaigns
  - Brand reputation management

---

## Underwriter Requirements

### Pre-Approval Security Audit Checklist

**Infrastructure Security:**
- ✅ AWS KMS for hot-wallet key management
- ✅ Cold-wallet multi-signature (2-of-3 or 3-of-5) configuration
- ✅ Hardware security modules (HSM) for key storage
- ✅ Network segmentation (admin VPN-only access)
- ✅ Cloudflare WAF with DDoS protection

**Access Controls:**
- ✅ Multi-factor authentication (MFA) for all admin accounts
- ✅ Role-based access control (RBAC) with principle of least privilege
- ✅ Mandatory 2-person approval for wallet transactions > ₦1,000,000
- ✅ IP allowlisting for admin console access
- ✅ Audit logging (immutable, append-only logs)

**Monitoring & Response:**
- ✅ 24/7 security operations center (SOC) monitoring
- ✅ Real-time transaction anomaly detection
- ✅ Automated alert system for suspicious wallet activity
- ✅ Incident response run-book (documented procedures)
- ✅ Quarterly security penetration testing

**Development & Deployment:**
- ✅ Container security scanning (Trivy, Snyk)
- ✅ Blue-green deployment with automated rollback
- ✅ Code review requirements (min. 2 approvals)
- ✅ Dependency vulnerability scanning in CI/CD
- ✅ Secret management (no hardcoded keys)

**Compliance & Governance:**
- ✅ NLRC betting license (active and valid)
- ✅ KYC/AML procedures (NIN verification via YouVerify/NIBSS)
- ✅ Responsible gaming limits enforcement
- ✅ 7-year document retention policy
- ✅ Quarterly regulatory reporting (NLRC)

---

## Recommended Insurance Providers

### Tier 1 - Specialist Cyber Insurers (Global)

**1. Lloyd's of London Syndicates**
- **Coverage**: Comprehensive crypto & digital asset theft
- **Market Leader**: Specializes in emerging tech risks
- **Typical Premium**: 1.5% - 3% of coverage limit annually
- **Contact**: Lloyd's brokers in Lagos (e.g., Marsh, AON)
- **Pros**: Gold-standard coverage, global reputation
- **Cons**: Higher premiums, extensive audit requirements

**2. Chubb Insurance**
- **Coverage**: Cyber liability + digital asset theft rider
- **Market Position**: Fortune 500 companies, financial institutions
- **Typical Premium**: 1.2% - 2.5% of coverage limit annually
- **Contact**: Chubb Nigeria office in Lagos
- **Pros**: Strong claims-paying ability, fintech experience
- **Cons**: May require higher security standards

**3. AIG (American International Group)**
- **Coverage**: CyberEdge policy with crypto asset extension
- **Market Position**: Major player in cyber insurance
- **Typical Premium**: 1.0% - 2.2% of coverage limit annually
- **Contact**: AIG Nigeria brokers
- **Pros**: Flexible coverage terms, competitive pricing
- **Cons**: Claims process can be lengthy

---

### Tier 2 - Nigerian Insurers with Cyber Offerings

**4. Leadway Assurance**
- **Coverage**: Cyber liability insurance (may add digital asset rider)
- **Market Position**: Leading Nigerian insurer
- **Typical Premium**: 0.8% - 1.5% of coverage limit annually
- **Contact**: Leadway Head Office, Ikoyi, Lagos
- **Pros**: Local presence, understands Nigerian market, naira-denominated policies
- **Cons**: Less experience with cryptocurrency theft coverage

**5. Custodian Investment PLC**
- **Coverage**: Technology errors & omissions + cyber risk
- **Market Position**: Strong in financial services
- **Typical Premium**: 0.9% - 1.8% of coverage limit annually
- **Contact**: Custodian offices in Lagos/Abuja
- **Pros**: Financial sector expertise, responsive claims
- **Cons**: May require co-insurance with international provider

**6. AIICO Insurance**
- **Coverage**: Cyber insurance package
- **Market Position**: Established Nigerian insurer
- **Typical Premium**: 1.0% - 2.0% of coverage limit annually
- **Contact**: AIICO Head Office, Victoria Island, Lagos
- **Pros**: Comprehensive cyber coverage, local claims handling
- **Cons**: Coverage limits may be lower than international providers

---

### Tier 3 - Emerging Crypto-Native Insurers

**7. Nexus Mutual (DeFi Insurance Protocol)**
- **Coverage**: Smart contract exploit coverage, protocol-level insurance
- **Market Position**: Decentralized insurance for crypto protocols
- **Typical Premium**: 2.5% - 5% of coverage limit annually (paid in crypto)
- **Contact**: https://nexusmutual.io
- **Pros**: Crypto-native, on-chain settlement, no KYC overhead
- **Cons**: Experimental, regulatory uncertainty in Nigeria, no fiat coverage

**8. Evertas (Cryptocurrency Insurance Specialist)**
- **Coverage**: Custody, hot-wallet, cold-wallet, crime insurance
- **Market Position**: Specialist in digital asset custody insurance
- **Typical Premium**: 1.5% - 3.5% of coverage limit annually
- **Contact**: https://evertas.com
- **Pros**: Deep crypto expertise, fast underwriting
- **Cons**: May not cover Nigerian-specific regulatory risks

---

## Sample Policy Structure

### Hot-Wallet Theft Coverage (₦50M Limit)

**What's Covered:**
- Unauthorized transfer of USDT from hot-wallet address
- Private key theft via malware/hacking
- Social engineering attack on authorized signers
- Third-party API compromise (e.g., Tron node provider breach)

**What's NOT Covered:**
- Employee theft (covered under separate fidelity bond)
- Loss due to smart contract bug (requires separate DeFi coverage)
- Regulatory seizure or freeze orders
- Loss of private keys (no theft, just negligence)

**Policy Conditions:**
- **Deductible**: ₦2,000,000 (first ₦2M of loss not covered)
- **Claim Response Time**: Insurer investigates within 48 hours
- **Settlement Period**: 30 days after approval
- **Security Audit Requirement**: Annual penetration test report
- **Incident Reporting Requirement**: Within 24 hours of discovery

**Premium Estimate:**
- Coverage: ₦50,000,000
- Premium Rate: 2% annually
- **Annual Premium: ₦1,000,000**

---

### Cold-Wallet Breach Coverage (₦500M Limit)

**What's Covered:**
- Compromise of multi-signature cold-wallet (e.g., 2-of-3 Gnosis Safe)
- Insider collusion (2+ authorized signers acting maliciously)
- Hardware wallet theft with PIN/seed phrase extraction
- Quantum computing attack on wallet encryption (future-proofing)

**What's NOT Covered:**
- Loss of all private keys with no backup (negligence)
- Voluntary transfer authorized by legitimate signers
- Fork-related token loss

**Policy Conditions:**
- **Deductible**: ₦10,000,000
- **Co-Insurance**: Insured bears 10% of loss above deductible
- **Security Requirements**: 
  - Multi-sig wallets only (min. 2-of-3)
  - Hardware security modules (HSM) for key storage
  - Geographically distributed signers
  - Annual security audit

**Premium Estimate:**
- Coverage: ₦500,000,000
- Premium Rate: 1.5% annually
- **Annual Premium: ₦7,500,000**

---

## Cost-Benefit Analysis

### Total Annual Insurance Cost Estimate

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
**As % of Gross Gaming Revenue**: ~0.5% - 1.5% (depending on scale)

---

### ROI Justification

**Scenario 1: Hot-Wallet Compromise (₦30M Loss)**
- Insurance Payout: ₦28M (₦30M - ₦2M deductible)
- Premium Paid (YTD): ₦1M
- **Net Benefit**: ₦27M saved

**Scenario 2: No Incident (Typical Year)**
- Insurance Cost: ₦11.625M
- Incidents: 0
- **Cost**: ₦11.625M (peace of mind, regulatory compliance, card-acquiring bank requirement)

**Break-Even Analysis:**
- If probability of ₦50M+ incident > 23% annually, insurance is ROI-positive
- Industry average for crypto platforms: ~15-20% chance of material security incident annually
- **Recommendation**: Insurance is PRUDENT given regulatory requirements and card-acquiring bank mandates

---

## Procurement Process

### Step 1: Request for Proposal (RFP)
**Timeline: Week 1-2**
- Send RFP to 5-7 insurers (mix of Tier 1, Tier 2, Tier 3)
- Include: coverage requirements, security audit report, pen-test results
- Request: premium quotes, coverage exclusions, claim examples

### Step 2: Security Audit
**Timeline: Week 3-4**
- Engage external security firm (e.g., Trail of Bits, Hacken)
- Comprehensive audit of infrastructure, wallets, access controls
- Deliver audit report to insurers

### Step 3: Underwriting Review
**Timeline: Week 5-6**
- Insurers review security posture
- May request additional controls (e.g., higher multi-sig threshold)
- Negotiate coverage terms and premium rates

### Step 4: Quote Comparison
**Timeline: Week 7**
- Compare quotes on: premium, deductibles, exclusions, claim process
- Legal review of policy language
- Check insurer financial strength rating (AM Best, S&P)

### Step 5: Policy Binding
**Timeline: Week 8**
- Execute policy documents
- Pay initial premium
- Receive certificate of insurance
- **Provide to card-acquiring banks (Paystack, Flutterwave)**

---

## Ongoing Compliance

### Annual Requirements
- ✅ Security penetration test (Q4 annually)
- ✅ Update insurer on infrastructure changes
- ✅ Report any security incidents within 24 hours
- ✅ Maintain security controls per policy schedule

### Claims Process
1. **Immediate Notification** (within 24 hours of incident)
2. **Incident Report Submission** (within 48 hours)
   - Timeline of events
   - Estimated loss amount
   - Forensic investigation initiation
3. **Insurer Investigation** (7-14 days)
   - Third-party forensics firm engaged
   - Verification of security controls
4. **Claim Approval** (14-30 days)
5. **Payment** (30-60 days from approval)

---

## White Paper for Card-Acquiring Banks

### Purpose
Paystack and Flutterwave require evidence of insurance coverage as part of their merchant onboarding due diligence for betting/gaming businesses.

### Document to Provide
**"Certificate of Insurance - Cyber & Digital Asset Theft"**

**Should Include:**
- Insurer name and policy number
- Coverage limits (hot-wallet, cold-wallet, payment processor breach)
- Policy period (effective and expiration dates)
- Proof of premium payment
- Security audit summary (demonstrating robust controls)
- Named insured: Betfuz Limited

**Format:**
- Single-page PDF certificate
- Insurer letterhead with signature
- QR code linking to verification portal

**Distribution:**
- Send to Paystack compliance team: compliance@paystack.com
- Send to Flutterwave risk team: risk@flutterwave.com
- Upload to merchant portal during onboarding

---

## Recommendations

### Immediate Actions (Month 1)
1. **Engage Insurance Broker**: Contact Marsh or AON Nigeria for RFP assistance
2. **Security Audit**: Schedule pen-test with reputable firm
3. **Documentation**: Compile security controls documentation for underwriters

### Short-Term (Month 2-3)
4. **RFP Process**: Obtain 5+ quotes from Tier 1 and Tier 2 insurers
5. **Policy Selection**: Choose based on coverage breadth, claims reputation, cost
6. **Bind Policy**: Execute and pay initial premium

### Long-Term (Ongoing)
7. **Annual Review**: Re-evaluate coverage limits as platform grows
8. **Claims Preparedness**: Conduct tabletop exercises simulating claim scenarios
9. **Market Monitoring**: Stay updated on emerging crypto insurance products

---

**Last Updated:** [Date]  
**Next Review:** Annual policy renewal  
**Owner:** CFO & Risk Management Team
