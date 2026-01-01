# BetFuz Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BETFUZ PLATFORM                              │
├─────────────────────────────────────────────────────────────────────┤
│  FRONTEND (Lovable/Vercel)     │  MOBILE (Capacitor)                │
│  ├─ React 18 + TypeScript      │  ├─ iOS (Xcode)                    │
│  ├─ Vite + Tailwind            │  ├─ Android (Android Studio)       │
│  └─ shadcn/ui                  │  └─ Push Notifications             │
├─────────────────────────────────────────────────────────────────────┤
│                        LOVABLE CLOUD (Supabase)                      │
│  ├─ PostgreSQL (RLS enabled)   │  Edge Functions (100+)             │
│  ├─ Auth + User Roles          │  ├─ AI Games                       │
│  ├─ Realtime                   │  ├─ Betting                        │
│  └─ Storage                    │  └─ Admin/Compliance               │
├─────────────────────────────────────────────────────────────────────┤
│  INTEGRATIONS                                                        │
│  ├─ n8n Workflows              │  Sports APIs                       │
│  ├─ Paystack/Flutterwave       │  ├─ Sportradar, Odds API           │
│  └─ Termii (SMS)               │  └─ API Sports, Football Data      │
└─────────────────────────────────────────────────────────────────────┘
```

## 1. Mobile Apps Setup (Capacitor)

### Prerequisites
- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio (for Android)

### Build Steps

```bash
# 1. Clone from GitHub
git clone https://github.com/YOUR_ORG/betfuz.git
cd betfuz

# 2. Install dependencies
npm install

# 3. Add native platforms
npx cap add ios
npx cap add android

# 4. Build web assets
npm run build

# 5. Sync to native platforms
npx cap sync

# 6. Open in IDE
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio

# 7. Run on device/emulator
npx cap run ios
npx cap run android
```

### Push Notifications Setup

#### iOS (APNs)
1. Create Apple Developer Account
2. Generate APNs Key in Apple Developer Portal
3. Configure in Firebase/OneSignal

#### Android (FCM)
1. Create Firebase project
2. Download `google-services.json`
3. Place in `android/app/`

### App Store Submission Checklist
- [ ] App icons (all sizes)
- [ ] Screenshots for all devices
- [ ] Privacy policy URL
- [ ] Age rating (18+)
- [ ] Gambling compliance documentation
- [ ] NLRC license number in app

---

## 2. Admin Dashboards

### Multi-Tenant Architecture

```sql
-- Tenant (Country) Assignment
admin_tenant_assignments:
  - user_id: UUID
  - tenant_id: UUID (references countries)
  - admin_role: 'country_admin' | 'super_admin' | 'support' | 'finance' | 'compliance'
```

### Role Permissions

| Role | Countries | Users | Bets | Finance | Settings |
|------|-----------|-------|------|---------|----------|
| Super Admin | All | Full | Full | Full | Full |
| Country Admin | Assigned | Full | Full | View | Limited |
| Finance | Assigned | View | View | Full | None |
| Compliance | Assigned | View | View | View | None |
| Support | Assigned | Edit | View | None | None |

### Deployment (Vercel)

```bash
# Create separate Vercel project for admin
vercel --prod --scope=betfuz-admin

# Environment variables
VITE_SUPABASE_URL=https://aacjfdrctnmnenebzdxg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_ADMIN_MODE=true
```

---

## 3. Security & Compliance

### Rate Limiting

```typescript
// Call rate-limiter before protected endpoints
const { data } = await supabase.functions.invoke('rate-limiter', {
  body: { 
    endpoint: '/api/bets',
    limit: 100,        // requests per window
    window_seconds: 60 // 1 minute window
  }
});

if (!data.allowed) {
  throw new Error('Rate limit exceeded');
}
```

### WAF Configuration (Cloudflare)

```yaml
# Recommended Cloudflare rules
- Block countries not in operating regions
- Rate limit: 100 req/min per IP
- Challenge suspicious user agents
- Block known bad IPs
- Enable Bot Fight Mode
```

### AML/KYC Integration

| Threshold | Requirement |
|-----------|-------------|
| < ₦50,000 | Basic verification |
| ₦50,000 - ₦1M | NIN verification |
| > ₦1M | Enhanced due diligence |
| > ₦5M | SAR filing required |

### Compliance Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/kyc-verification` | Process KYC documents |
| `/aml-check` | Run AML screening |
| `/sar-filing` | Submit suspicious activity report |
| `/nlrc-quarterly-report` | Generate NLRC report |

---

## 4. CI/CD Pipeline (GitHub Actions)

### Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy BetFuz

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy-edge-functions:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Rollback Procedure

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Database rollback (use with caution)
supabase db reset --linked
```

---

## 5. n8n Workflow Automation

### Webhook Endpoints

| Event | Endpoint | Payload |
|-------|----------|---------|
| Bet Placed | `/n8n-automation` | `{ trigger_event: 'bet_placed', data: { bet_id, user_id, amount } }` |
| Bet Won | `/n8n-automation` | `{ trigger_event: 'bet_won', data: { bet_id, winnings, affiliate_code } }` |
| Deposit | `/n8n-automation` | `{ trigger_event: 'deposit', data: { user_id, amount, method } }` |
| Withdrawal | `/n8n-automation` | `{ trigger_event: 'withdrawal', data: { user_id, amount } }` |
| KYC Approved | `/n8n-automation` | `{ trigger_event: 'kyc_approved', data: { user_id } }` |
| Fraud Detected | `/n8n-automation` | `{ trigger_event: 'fraud_detected', data: { user_id, severity, details } }` |

### Sample n8n Workflow

```json
{
  "name": "Bet Settlement Pipeline",
  "nodes": [
    { "name": "Webhook", "type": "webhook", "path": "/bet-settled" },
    { "name": "Check Win", "type": "if", "condition": "{{$json.status === 'won'}}" },
    { "name": "Process Commission", "type": "http", "url": "{{$env.SUPABASE_URL}}/functions/v1/affiliate-boost-check" },
    { "name": "Send Notification", "type": "http", "url": "{{$env.SUPABASE_URL}}/functions/v1/push-notification" }
  ]
}
```

---

## 6. Environment Variables

### Required Secrets (Lovable Cloud)

| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access |
| `LOVABLE_API_KEY` | AI Gateway |
| `OPENAI_API_KEY` | Voice betting |
| `SPORTRADAR_API_KEY` | Live sports data |
| `ODDS_API_KEY` | Betting odds |
| `N8N_BEARER_TOKEN` | Workflow auth |
| `KIE_AI_API_KEY` | Premium AI |

---

## 7. Monitoring & Observability

### Key Metrics

- **Uptime**: Target 99.9%
- **API Latency**: < 200ms p95
- **Error Rate**: < 0.1%
- **Bet Settlement Time**: < 5 seconds

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 1% | > 5% |
| API Latency | > 500ms | > 2s |
| Failed Deposits | > 5/hour | > 20/hour |
| Fraud Alerts | > 10/day | > 50/day |

---

## 8. Support Contacts

- **Technical Issues**: dev@betfuz.com
- **Compliance**: compliance@betfuz.com
- **Security**: security@betfuz.com
- **NLRC Liaison**: regulatory@betfuz.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-01 | Initial production release |
