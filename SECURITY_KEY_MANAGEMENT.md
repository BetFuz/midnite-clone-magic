# Key Management Strategy

## Overview
Betfuz implements a tiered key management strategy for cryptocurrency operations, separating hot wallets (operational) from cold wallets (reserve storage) with institutional-grade security controls.

---

## Hot Wallet Management (AWS KMS)

### Strategy
- **Purpose**: Operational wallet for instant withdrawals and USDT bonus disbursements
- **Float**: Maximum 10% of total cryptocurrency reserves
- **Storage**: Private keys stored in AWS Key Management Service (KMS)
- **Rotation**: Keys rotated every 90 days

### AWS KMS Configuration

```typescript
// AWS KMS Key Policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM User Permissions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/BetfuzBackendRole"
      },
      "Action": [
        "kms:Decrypt",
        "kms:Sign"
      ],
      "Resource": "*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["YOUR_SERVER_IP_1", "YOUR_SERVER_IP_2"]
        }
      }
    }
  ]
}
```

### Hot Wallet Service Integration

```typescript
// backend/apps/treasury-service/src/kms/hot-wallet.service.ts
import { KMSClient, SignCommand, DecryptCommand } from '@aws-sdk/client-kms';

export class HotWalletService {
  private kmsClient: KMSClient;
  private keyId: string = process.env.AWS_KMS_HOT_WALLET_KEY_ID!;

  constructor() {
    this.kmsClient = new KMSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async signTransaction(txHash: Buffer): Promise<string> {
    const command = new SignCommand({
      KeyId: this.keyId,
      Message: txHash,
      MessageType: 'RAW',
      SigningAlgorithm: 'ECDSA_SHA_256',
    });

    const response = await this.kmsClient.send(command);
    return Buffer.from(response.Signature!).toString('hex');
  }

  async getPublicAddress(): Promise<string> {
    // Derive Tron address from KMS public key
    // Implementation specific to TronWeb integration
    return process.env.HOT_WALLET_ADDRESS!;
  }

  async checkBalance(): Promise<number> {
    // Check USDT balance on hot wallet
    // Implementation with TronWeb
    return 0;
  }
}
```

### Hot Wallet Limits
- Maximum single transaction: ₦500,000 (≈ $600 USDT)
- Daily transaction limit: ₦10,000,000 (≈ $12,000 USDT)
- Auto-replenishment from cold wallet when balance < 5% of float

---

## Cold Wallet Management (Multi-Sig)

### Strategy
- **Purpose**: Reserve storage for 90%+ of cryptocurrency holdings
- **Storage**: Hardware wallets (Ledger/Trezor) with multi-signature requirement
- **Signatories**: 3-of-5 multi-sig (CEO, CTO, CFO, COO, Head of Compliance)
- **Access**: Air-gapped, offline signing only

### Multi-Sig Configuration

```
Cold Wallet Address: [TBD - Generated during production setup]
Multi-Sig Type: 3-of-5 Threshold Signature
Blockchain: Tron Network (TRC-20 USDT)
Signatories:
  1. CEO - Ledger Nano X (Primary)
  2. CTO - Trezor Model T (Primary)
  3. CFO - Ledger Nano X (Backup)
  4. COO - Trezor Model T (Backup)
  5. Head of Compliance - Ledger Nano X (Audit)
```

### Cold Wallet Transfer Process

1. **Request Initiation**: Treasury service detects hot wallet balance < 5%
2. **Approval Workflow**: 
   - CFO approves transfer amount via internal dashboard
   - CTO verifies blockchain parameters
   - CEO provides final authorization
3. **Multi-Sig Signing**:
   - Transaction prepared offline on air-gapped machine
   - 3 signatories sign transaction using hardware wallets
   - Signed transaction broadcast to Tron network
4. **Confirmation**: 
   - Wait for 19 block confirmations (≈ 60 seconds on Tron)
   - Hot wallet service verifies receipt
   - Audit log entry created

### Cold Wallet Security Controls
- Hardware wallets stored in separate physical locations
- Recovery seed phrases split using Shamir's Secret Sharing (SSS)
- Quarterly audit of cold wallet holdings by external auditor
- Insurance coverage for cold wallet assets (Lloyds of London or equivalent)

---

## Key Rotation Policy

### Hot Wallet Keys (AWS KMS)
- **Frequency**: Every 90 days
- **Process**:
  1. Generate new KMS key
  2. Transfer remaining hot wallet balance to new address
  3. Update backend configuration with new key ID
  4. Disable old KMS key after 30-day grace period
  5. Schedule old key deletion after 7 days

### Cold Wallet Keys
- **Frequency**: Annually or after security incident
- **Process**:
  1. Schedule multi-sig ceremony with all signatories
  2. Generate new hardware wallet addresses
  3. Transfer 100% of cold wallet holdings to new addresses
  4. Wipe old hardware wallets
  5. Destroy old recovery seed phrases

---

## Backup & Disaster Recovery

### Hot Wallet Backup
- AWS KMS keys replicated across 3 AWS regions (us-east-1, eu-west-1, ap-southeast-1)
- Automated failover if primary region unavailable
- Recovery time objective (RTO): < 5 minutes

### Cold Wallet Backup
- Recovery seed phrases split into 5 shares (3 required for recovery)
- Shares stored in:
  1. Bank safety deposit box (Primary)
  2. Law firm vault (Secondary)
  3. CEO personal safe (Emergency)
  4. CTO personal safe (Emergency)
  5. Compliance officer secure storage (Audit)

---

## Monitoring & Alerts

### Hot Wallet Monitoring
- Balance checks every 60 seconds
- Alert if balance < 5% of target float
- Alert if unauthorized transaction detected
- Alert if KMS API call fails

### Cold Wallet Monitoring
- Daily balance verification
- Alert if any transaction detected (cold wallet should be dormant)
- Monthly reconciliation with accounting records

---

## Compliance & Audit

### Internal Audit
- Weekly reconciliation of hot wallet transactions
- Monthly review of cold wallet holdings
- Quarterly key rotation verification

### External Audit
- Annual penetration test of key management infrastructure
- Annual audit of cryptocurrency holdings by certified auditor
- Proof-of-reserves published quarterly (public blockchain verification)

---

## Production Deployment Checklist

- [ ] Create AWS KMS keys in 3 regions with IP restriction policies
- [ ] Purchase 5 hardware wallets (3x Ledger Nano X, 2x Trezor Model T)
- [ ] Generate multi-sig cold wallet address and fund with initial reserves
- [ ] Configure hot wallet service with KMS integration
- [ ] Implement automated hot wallet replenishment logic
- [ ] Set up CloudWatch alarms for wallet balances
- [ ] Document recovery procedures and train key holders
- [ ] Obtain insurance coverage for cryptocurrency reserves
- [ ] Schedule quarterly external audits

---

## Security Contacts

- **Hot Wallet Security**: security@betfuz.com
- **Cold Wallet Custody**: custody@betfuz.com
- **24/7 Incident Hotline**: +234-XXX-XXX-XXXX
