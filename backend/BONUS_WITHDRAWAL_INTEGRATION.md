# Crypto-Fiat Bonus + Withdrawal Compensation System

## Overview

Production-ready bonus and withdrawal system with:
- **300% First Deposit Bonus** (50% USDT 0x rollover + 50% NGN 5x rollover)
- **60-Second Withdrawal Timer** with automatic ₦1,000 compensation for delays
- **BullMQ Job Queue** for async processing
- **Swagger API Documentation**

## 🎁 Bonus System

### Features
- **Split Bonus Structure**:
  - 50% USDT (0x rollover - released instantly to Tron address)
  - 50% NGN (5x rollover requirement, min odds 1.5)
- **Auto-Release**: USDT portion sent to user's Tron wallet immediately
- **Rollover Tracking**: Automatic progress tracking based on qualifying bets
- **Auto-Complete**: NGN bonus released when rollover requirements met

### Database Schema

```prisma
model Bonus {
  id                String   @id @default(uuid())
  userId            String
  depositAmount     Decimal  @db.Decimal(15, 2)
  usdtBonus         Decimal  @db.Decimal(15, 2)  // 50% of total bonus
  ngnBonus          Decimal  @db.Decimal(15, 2)  // 50% of total bonus
  usdtReleased      Boolean  @default(false)
  ngnLocked         Boolean  @default(true)
  rolloverRequired  Decimal  @db.Decimal(15, 2)  // ngnBonus * 5
  rolloverProgress  Decimal  @default(0)
  minOdds           Decimal  @db.Decimal(10, 4)  // 1.5
  status            BonusStatus
  tronAddress       String?
  releasedAt        DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User @relation(fields: [userId], references: [id])
}

enum BonusStatus {
  PENDING
  USDT_RELEASED
  NGN_RELEASED
  COMPLETED
  EXPIRED
  CANCELLED
}
```

### API Endpoints

#### POST /bonus/create
Create 300% first deposit bonus

**Request:**
```json
{
  "userId": "user-uuid",
  "depositAmount": 10000,
  "tronAddress": "TRon-wallet-address"
}
```

**Response:**
```json
{
  "id": "bonus-uuid",
  "userId": "user-uuid",
  "depositAmount": 10000,
  "usdtBonus": 15000,       // 50% of 300%
  "ngnBonus": 15000,        // 50% of 300%
  "usdtReleased": true,     // Auto-released instantly
  "ngnLocked": true,
  "rolloverRequired": 75000, // ngnBonus * 5
  "rolloverProgress": 0,
  "minOdds": 1.5,
  "status": "USDT_RELEASED",
  "createdAt": "2025-01-28T10:00:00Z"
}
```

#### POST /bonus/release
Release NGN bonus after rollover requirements met

**Request:**
```json
{
  "bonusId": "bonus-uuid",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "NGN bonus released successfully",
  "amount": 15000
}
```

#### GET /bonus/:userId
Get bonus details and rollover progress

**Response:**
```json
{
  "id": "bonus-uuid",
  "userId": "user-uuid",
  "depositAmount": 10000,
  "usdtBonus": 15000,
  "ngnBonus": 15000,
  "usdtReleased": true,
  "ngnLocked": true,
  "rolloverRequired": 75000,
  "rolloverProgress": 25000,
  "rolloverPercentage": 33.33,
  "minOdds": 1.5,
  "status": "USDT_RELEASED"
}
```

## 💸 Withdrawal System

### Features
- **60-Second Timer**: Starts when withdrawal request created
- **Auto-Compensation**: ₦1,000 credited if timer breached
- **Event Emission**: `withdrawal.late` event for monitoring
- **BullMQ Integration**: Async processing with job queue
- **Multiple Methods**: Bank transfer, USDT TRC20, crypto, mobile money

### Database Schema

```prisma
model Withdrawal {
  id                String   @id @default(uuid())
  userId            String
  amount            Decimal  @db.Decimal(15, 2)
  method            WithdrawalMethod
  destination       String
  status            WithdrawalStatus
  requestedAt       DateTime @default(now())
  processedAt       DateTime?
  timerStarted      DateTime?
  timerExpired      Boolean  @default(false)
  compensationPaid  Boolean  @default(false)
  compensationAmount Decimal? @db.Decimal(15, 2)
  reference         String   @unique
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User @relation(fields: [userId], references: [id])
}

enum WithdrawalMethod {
  BANK_TRANSFER
  USDT_TRC20
  CRYPTO
  MOBILE_MONEY
}

enum WithdrawalStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  COMPENSATED    // Timer breached + compensation paid
}
```

### API Endpoints

#### POST /withdraw
Create withdrawal request with 60s timer

**Request:**
```json
{
  "userId": "user-uuid",
  "amount": 50000,
  "method": "BANK_TRANSFER",
  "destination": "1234567890"
}
```

**Response:**
```json
{
  "id": "withdrawal-uuid",
  "userId": "user-uuid",
  "amount": 50000,
  "method": "BANK_TRANSFER",
  "destination": "1234567890",
  "status": "PENDING",
  "requestedAt": "2025-01-28T10:00:00Z",
  "timerStarted": "2025-01-28T10:00:00Z",
  "timerExpiresAt": "2025-01-28T10:01:00Z",
  "reference": "WD-1738000000-ABC123"
}
```

#### POST /withdraw/:withdrawalId/cancel
Cancel withdrawal and refund

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal cancelled and refunded",
  "withdrawal": {
    "id": "withdrawal-uuid",
    "status": "CANCELLED",
    "amount": 50000
  }
}
```

#### GET /withdraw/:userId/history
Get withdrawal history with compensation details

**Response:**
```json
[
  {
    "id": "withdrawal-uuid-1",
    "amount": 50000,
    "method": "BANK_TRANSFER",
    "status": "COMPLETED",
    "requestedAt": "2025-01-28T10:00:00Z",
    "processedAt": "2025-01-28T10:00:45Z",
    "timerExpired": false,
    "compensationPaid": false
  },
  {
    "id": "withdrawal-uuid-2",
    "amount": 30000,
    "method": "USDT_TRC20",
    "status": "COMPENSATED",
    "requestedAt": "2025-01-27T15:00:00Z",
    "processedAt": "2025-01-27T15:01:15Z",
    "timerExpired": true,
    "compensationPaid": true,
    "compensationAmount": 1000
  }
]
```

#### GET /withdraw/:withdrawalId/:userId
Get specific withdrawal details

**Response:**
```json
{
  "id": "withdrawal-uuid",
  "userId": "user-uuid",
  "amount": 50000,
  "method": "BANK_TRANSFER",
  "destination": "1234567890",
  "status": "COMPENSATED",
  "requestedAt": "2025-01-28T10:00:00Z",
  "processedAt": "2025-01-28T10:01:15Z",
  "timerStarted": "2025-01-28T10:00:00Z",
  "timerExpired": true,
  "compensationPaid": true,
  "compensationAmount": 1000,
  "reference": "WD-1738000000-ABC123"
}
```

## 🔧 Implementation Details

### BonusService

**Key Methods:**
- `createBonus()` - Create 300% bonus and auto-release USDT
- `releaseUsdtBonus()` - Send USDT to Tron address
- `releaseNgnBonus()` - Release NGN after rollover complete
- `updateRolloverProgress()` - Track qualifying bets (min odds 1.5)
- `sendUsdtToTron()` - Integrate with TronGrid API

### WithdrawalService

**Key Methods:**
- `createWithdrawal()` - Create request and queue job with 60s delay
- `processWithdrawal()` - Check timer and apply compensation if breached
- `handleLateWithdrawal()` - Credit ₦1,000 and emit event
- `completeWithdrawal()` - Process normally if within timer
- `cancelWithdrawal()` - Cancel and refund

### WithdrawalProcessor (BullMQ)

**Job Processing:**
```typescript
@Processor('withdrawals')
export class WithdrawalProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    const { withdrawalId } = job.data;
    
    // Check timer and process
    return await this.withdrawalService.processWithdrawal(withdrawalId);
  }
}
```

## 📊 Flow Diagrams

### Bonus Flow
```
Deposit ₦10,000
    ↓
Create Bonus (300% = ₦30,000)
    ↓
Split: ₦15,000 USDT + ₦15,000 NGN
    ↓
USDT (0x rollover)              NGN (5x rollover = ₦75,000)
    ↓                                ↓
Instant release to Tron         Locked until rollover met
                                     ↓
                                Track qualifying bets (min odds 1.5)
                                     ↓
                                Auto-release when complete
```

### Withdrawal Flow
```
User requests withdrawal
    ↓
Deduct from balance
    ↓
Create withdrawal record
    ↓
Add to BullMQ queue (60s delay)
    ↓
Timer starts
    ↓
60 seconds later...
    ↓
    ├─ Within 60s → Complete normally
    │
    └─ Timer breached → Credit ₦1,000 compensation
                      → Emit 'withdrawal.late' event
                      → Status = COMPENSATED
```

## 🚀 Setup

### 1. Update Prisma Schema
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 2. Environment Variables
```bash
# Tron Integration
TRON_API_URL=https://api.trongrid.io
TRON_WALLET_ADDRESS=your-tron-wallet-address
TRON_PRIVATE_KEY=your-private-key

# Redis (for BullMQ)
REDIS_URL=redis://localhost:6379
```

### 3. Start Services
```bash
# Start infrastructure
npm run docker:up

# Start API Gateway
npm run start:gateway
```

### 4. Access Swagger Docs
```
http://localhost:3000/api-docs
```

## 🔐 Security Considerations

1. **Tron Integration**: Use secure key management (Vault/KMS)
2. **Rollover Validation**: Server-side checks for min odds
3. **Compensation Limits**: Prevent abuse with rate limiting
4. **Balance Verification**: Atomic operations for withdrawals
5. **Job Idempotency**: Prevent duplicate processing

## 📈 Monitoring

**Key Metrics:**
- Bonus creation rate
- USDT release success rate
- Average rollover completion time
- Withdrawal timer breach rate
- Compensation payout frequency
- Late withdrawal events

**Alerts:**
- High compensation rate (> 10%)
- Failed USDT transfers
- Withdrawal queue backlog
- Suspicious rollover patterns

## 🧪 Testing

```bash
# Test bonus service
npm test -- bonus.service.spec.ts

# Test withdrawal processor
npm test -- withdrawal.processor.spec.ts
```

## 📝 Next Steps

1. Integrate real Tron wallet service (TronWeb/TronGrid)
2. Add payment gateway for bank transfers
3. Implement fraud detection for bonuses
4. Add admin dashboard for monitoring
5. Set up alerting for compensation events
