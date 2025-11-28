# Affiliate Lifecycle System

## Overview

Complete affiliate system with tiered commissions, revenue sharing, daily salaries, and sub-tree visualization.

## Affiliate Tiers

### Bronze (Entry Level)
- **Commission Rate**: 20% base
- **Override Rate**: 0%
- **Daily Salary**: None
- **Requirements**: Default tier

### Silver (Intermediate)
- **Commission Rate**: 25% base
- **Override Rate**: 5% on sub-affiliates
- **Daily Salary**: None
- **Requirements**: ≥50 active referrals

### Gold (Premium)
- **Commission Rate**: 30% base
- **Override Rate**: 10% on sub-affiliates
- **Daily Salary**: ₦5,000/day (when ≥200 active referrals)
- **Requirements**: ≥150 active referrals

## Commission Calculation

### Base Commission
```
baseCommission = revenueAmount × baseRate
```

### Override Commission
```
overrideCommission = revenueAmount × overrideRate × numberOfDirectChildren
```

### Total Commission
```
totalCommission = baseCommission + overrideCommission
```

### Example (Gold Tier)
- Revenue: ₦100,000
- Direct children: 5 sub-affiliates
- Base: ₦100,000 × 0.30 = ₦30,000
- Override: ₦100,000 × 0.10 × 5 = ₦50,000
- **Total: ₦80,000**

## Daily Salary System

### Gold-Tier Salary
- **Amount**: ₦5,000/day
- **Eligibility**: ≥200 active referrals
- **Payment Time**: 08:00 WAT (07:00 UTC) daily
- **Cron Job**: `affiliate-salary.cron.ts`

### Cron Behavior
- Runs automatically at 08:00 WAT
- Checks active referral threshold (≥200)
- Skips if salary already paid today
- **Auto-pauses** if no affiliates meet threshold
- Can be manually resumed via API

### Pause Conditions
1. No Gold affiliates meet ≥200 actives threshold
2. Critical errors during processing
3. Manual pause request

## API Endpoints

### Calculate Commission
```bash
POST /affiliate/commission
Content-Type: application/json

{
  "affiliateId": "uuid-here",
  "revenueAmount": 10000
}
```

**Response**:
```json
{
  "baseCommission": 3000,
  "overrideCommission": 1000,
  "totalCommission": 4000,
  "tier": "GOLD",
  "dailySalaryEligible": true
}
```

### Get Affiliate Tree (D3 Visualization)
```bash
GET /affiliate/tree/:affiliateId
```

**Response**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "tier": "GOLD",
  "code": "JOHN2024",
  "activeReferrals": 250,
  "commission": 125000,
  "conversions": 180,
  "isActive": true,
  "children": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "tier": "SILVER",
      "activeReferrals": 75,
      "children": [...]
    }
  ]
}
```

### Upgrade Tier
```bash
POST /affiliate/upgrade/:affiliateId
```

**Response**:
```json
{
  "tier": "SILVER"
}
```

## Database Schema

### AffiliateLink Model
```prisma
model AffiliateLink {
  id              String        @id @default(uuid())
  userId          String        @map("user_id")
  code            String        @unique
  tier            AffiliateTier @default(BRONZE)
  clicks          Int           @default(0)
  conversions     Int           @default(0)
  activeReferrals Int           @default(0)
  commission      Decimal       @default(0)
  commissionRate  Decimal       @map("commission_rate")
  overrideRate    Decimal       @default(0)
  dailySalary     Decimal       @default(0)
  parentId        String?       @map("parent_id")
  isActive        Boolean       @default(true)
  lastSalaryPaidAt DateTime?    @map("last_salary_paid_at")
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user     User @relation(fields: [userId], references: [id])
  parent   AffiliateLink?  @relation("AffiliateTree", fields: [parentId], references: [id])
  children AffiliateLink[] @relation("AffiliateTree")

  @@index([userId])
  @@index([code])
  @@index([parentId])
  @@index([tier])
  @@map("affiliate_links")
}
```

## Frontend Component

### SubTreeChart.tsx
React component for D3-powered affiliate tree visualization:

**Features**:
- 3-level deep tree hierarchy
- Color-coded tiers (Gold, Silver, Bronze)
- Interactive node selection
- Hover tooltips with affiliate details
- Real-time metrics display

**Usage**:
```tsx
import { SubTreeChart } from '@/components/promotions/SubTreeChart';

<SubTreeChart 
  data={affiliateTreeData} 
  width={1000} 
  height={600} 
/>
```

**Mock Data Included**: Component includes realistic mock data for demonstration.

## Tier Upgrade Logic

### Automatic Upgrades
```
Bronze → Silver: ≥50 active referrals
Silver → Gold:   ≥150 active referrals
```

### Manual Trigger
```bash
POST /affiliate/upgrade/:affiliateId
```

## Transaction Records

All commissions and salaries create transaction records:

```json
{
  "type": "COMMISSION",
  "amount": 5000,
  "status": "COMPLETED",
  "reference": "SALARY-1234567890-abc12345",
  "metadata": {
    "type": "daily_salary",
    "affiliateId": "uuid",
    "activeReferrals": 250,
    "tier": "GOLD",
    "paidAt": "2025-01-01T08:00:00Z"
  }
}
```

## Monitoring & Logs

### Cron Logs
```
Starting Gold-tier daily salary processing at 08:00 WAT
Paid ₦5,000 to affiliate abc123 (250 actives)
Gold salary cron completed: 15 processed, 3 skipped, 0 failed, ₦75,000 total paid
```

### Error Handling
- Individual failures don't stop batch processing
- Critical errors pause cron to prevent data corruption
- All errors logged with affiliate ID and stack trace

## Testing

Run unit tests:
```bash
npm test apps/affiliate-engine
```

## Production Deployment

1. **Database Migration**:
```bash
npx prisma migrate deploy
```

2. **Environment Variables**:
```env
DATABASE_URL=postgresql://...
```

3. **Start Services**:
```bash
npm run start:affiliate-engine
npm run start:api-gateway
```

4. **Verify Cron**:
- Check logs at 08:00 WAT
- Monitor transaction table for `SALARY-*` records
- Verify user balances updated

## Security Considerations

- **Authorization**: Verify affiliate ownership before operations
- **Rate Limiting**: Prevent commission calculation abuse
- **Transaction Logs**: Immutable audit trail
- **Cron Isolation**: Separate service for salary processing
