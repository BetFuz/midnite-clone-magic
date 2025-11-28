# Betfuz Backend - Nx Monorepo

Production-ready Node.js/TypeScript backend for Betfuz sports betting platform with NLRC compliance.

## 🏗️ Architecture

```
betfuz/
├── apps/
│   ├── api-gateway/          # REST + GraphQL API Gateway
│   ├── ussd-microservice/    # Africa's Talking USSD service (NestJS)
│   ├── affiliate-engine/     # Affiliate commission processing (BullMQ)
│   └── nlrc-verifier/        # NLRC licence verification cron service
├── libs/                     # Shared libraries
├── prisma/                   # Database schema
└── docker-compose.yml        # PostgreSQL, Redis, RabbitMQ
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- NLRC API credentials

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Infrastructure
```bash
npm run docker:up
```

### 4. Setup Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Services
```bash
# Start all services
npm run start:gateway    # Port 3000
npm run start:ussd       # Port 3002
npm run start:affiliate  # Port 3001
npm run start:verifier   # Port 3003
```

## 📊 NLRC Licence Verifier

### Features
- ✅ Hourly cron job to verify NLRC licence status
- ✅ Writes ACTIVE/EXPIRED status to PostgreSQL
- ✅ Exposes `/health/licence` endpoint
- ✅ Guards to block bet placement when licence is invalid
- ✅ Comprehensive error handling and logging
- ✅ Unit tests with nock for API mocking

### Endpoints
```
GET /api/health/licence  # Check current licence status
GET /api/health          # General health check
```

### Licence Status Flow
```
NLRC API → Verifier Service (hourly) → PostgreSQL → Bet Guard → Block/Allow Bets
```

### Usage in API Gateway
```typescript
import { BetGuard } from '@betfuz/nlrc-verifier';

@UseGuards(BetGuard)
@Post('bets')
async placeBet(@Body() betDto: CreateBetDto) {
  // This endpoint will be blocked if licence is not ACTIVE
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test NLRC verifier specifically
nx test nlrc-verifier

# Test with coverage
nx test nlrc-verifier --coverage
```

## 📦 Project Structure

```
apps/nlrc-verifier/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── nlrc-verifier.service.ts  # Core verification logic + cron
│   ├── health.controller.ts       # Health check endpoints
│   ├── prisma.service.ts          # Database client
│   ├── guards/
│   │   └── bet.guard.ts          # Guard to block bets
│   └── nlrc-verifier.service.spec.ts  # Unit tests
```

## 🔐 Security Features

1. **Licence Verification**: Hourly checks against NLRC API
2. **Bet Blocking**: Automatic prevention of bets when licence invalid
3. **Audit Trail**: All verification attempts logged to database
4. **Error Handling**: Graceful degradation on API failures
5. **Environment Validation**: Required credentials checked at startup

## 🛠️ Database Schema

### NLRC Licence Table
```prisma
model NlrcLicence {
  id              Int      @id @default(autoincrement())
  status          LicenceStatus  // ACTIVE, EXPIRED, SUSPENDED, UNKNOWN
  licenceNumber   String
  expiryDate      DateTime
  lastChecked     DateTime
  responseData    Json?
  errorMessage    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🚢 Deployment

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)
- Set `NLRC_API_URL` to production NLRC endpoint
- Configure `NLRC_LICENCE_NUMBER` with your actual licence
- Set `NLRC_API_KEY` to your production API key
- Update `DATABASE_URL` to production PostgreSQL
- Set `NODE_ENV=production`

## 📈 Monitoring

The verifier service logs all operations:
- Successful verifications
- API failures
- Database errors
- Licence status changes

Integrate with your logging platform (Datadog, CloudWatch, etc.)

## 🔄 Cron Schedule

Default: Every hour (`0 * * * *`)

Customize in `nlrc-verifier.service.ts`:
```typescript
@Cron(CronExpression.EVERY_HOUR)  // Change to desired frequency
async verifyLicence() { ... }
```

## 📝 API Response Examples

### Licence Health Check
```json
{
  "service": "nlrc-licence-verifier",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "licence": {
    "status": "ACTIVE",
    "isValid": true,
    "lastChecked": "2025-01-28T09:00:00.000Z",
    "expiryDate": "2025-12-31T00:00:00.000Z",
    "errorMessage": null,
    "bettingAllowed": true
  }
}
```

### Blocked Bet Attempt
```json
{
  "statusCode": 403,
  "message": "Bet placement is currently unavailable",
  "reason": "NLRC licence is EXPIRED",
  "licenceStatus": "EXPIRED",
  "lastChecked": "2025-01-28T09:00:00.000Z"
}
```

## 🤝 Integration with Existing Supabase Backend

This backend runs alongside your Supabase setup:
- **Frontend** → Supabase (existing features)
- **Frontend** → Node.js Backend (compliance, USSD, affiliates)
- **NLRC Verifier** → Guards both systems from accepting bets when licence invalid

## 📚 Additional Services

### API Gateway
REST + GraphQL unified API with authentication and rate limiting.

### USSD Microservice
Africa's Talking integration for mobile betting via USSD codes.

### Affiliate Engine
BullMQ-powered commission tracking and payout processing.

## 🐛 Troubleshooting

### Licence Verifier Not Running
- Check Docker containers: `docker-compose ps`
- Verify environment variables are set
- Check logs: `docker-compose logs nlrc-verifier`

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Run migrations: `npm run prisma:migrate`

### NLRC API Errors
- Verify API key is valid
- Check licence number format
- Review error messages in `/health/licence` endpoint

## 📄 License

MIT

## 🙋 Support

For production deployment assistance or NLRC integration support, contact the development team.
