# BetFuz API Reference

## Base URLs

- **Production**: `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1`
- **Sandbox**: Same URL with test credentials

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <supabase_jwt_token>
```

---

## Betting Endpoints

### Create Bet
```http
POST /create-bet
Authorization: Bearer <token>
Content-Type: application/json

{
  "selections": [
    {
      "match_id": "abc123",
      "selection_type": "1X2",
      "selection_value": "home",
      "odds": 1.85
    }
  ],
  "stake": 5000,
  "bet_type": "single"
}
```

**Response:**
```json
{
  "bet_slip_id": "uuid",
  "total_odds": 1.85,
  "potential_win": 9250,
  "status": "pending"
}
```

### List Bets
```http
GET /list-bets
Authorization: Bearer <token>
```

### Cash Out
```http
POST /cashout
Content-Type: application/json

{
  "bet_slip_id": "uuid",
  "cashout_amount": 7500
}
```

---

## Sports Data Endpoints

### Public Matches
```http
POST /public-matches
Content-Type: application/json

{
  "league_name": "Premier League",
  "days": 7
}
```

**Response:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "match_id": "ext123",
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "commence_time": "2026-01-05T15:00:00Z",
      "home_odds": 2.10,
      "draw_odds": 3.40,
      "away_odds": 3.50
    }
  ]
}
```

### AI Predictions
```http
POST /ai-predictions
Content-Type: application/json

{
  "match_id": "abc123",
  "prediction_type": "match_result"
}
```

---

## Casino Endpoints

### AI Blackjack
```http
POST /ai-blackjack
Content-Type: application/json

{
  "action": "deal" | "hit" | "stand" | "double" | "split",
  "session_id": "uuid",
  "bet_amount": 1000
}
```

### AI Roulette
```http
POST /ai-roulette
Content-Type: application/json

{
  "bets": [
    { "type": "straight", "number": 17, "amount": 500 },
    { "type": "red", "amount": 1000 }
  ],
  "session_id": "uuid"
}
```

---

## Payment Endpoints

### Deposit
```http
POST /deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "method": "paystack" | "flutterwave" | "bank_transfer",
  "reference": "optional_reference"
}
```

### Withdraw
```http
POST /withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "bank_code": "044",
  "account_number": "0123456789"
}
```

### Payment Webhook (for providers)
```http
POST /payment-webhook
Content-Type: application/json

{
  "event": "charge.success",
  "data": {
    "reference": "ref123",
    "amount": 1000000,
    "currency": "NGN"
  }
}
```

---

## Admin Endpoints

### User Search
```http
POST /admin-user-search
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "query": "john@email.com",
  "limit": 20
}
```

### Void Bet
```http
POST /admin-void-bet
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "bet_slip_id": "uuid",
  "reason": "Match cancelled"
}
```

### Manual Payout
```http
POST /admin-manual-payout
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": "uuid",
  "amount": 100000,
  "reason": "Promotional credit"
}
```

### Export Ledger
```http
POST /admin-export-ledger
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "format": "csv"
}
```

---

## Compliance Endpoints

### KYC Verification
```http
POST /kyc-verification
Authorization: Bearer <token>
Content-Type: application/json

{
  "nin": "12345678901",
  "selfie_url": "https://storage.../selfie.jpg",
  "document_type": "national_id",
  "document_url": "https://storage.../id.jpg"
}
```

### AML Check
```http
POST /aml-check
Content-Type: application/json

{
  "user_id": "uuid",
  "amount": 5000000,
  "type": "withdrawal"
}
```

---

## Fantasy Sports Endpoints

### Optimize Lineup
```http
POST /fantasy-optimize-lineup
Content-Type: application/json

{
  "league_id": "uuid",
  "budget": 60000,
  "locked_players": ["player1_id", "player2_id"]
}
```

### Player Research
```http
POST /fantasy-player-research
Content-Type: application/json

{
  "player_id": "uuid",
  "include_news": true,
  "include_stats": true
}
```

---

## Automation Endpoints

### Rate Limiter
```http
POST /rate-limiter
Content-Type: application/json

{
  "endpoint": "/api/bets",
  "limit": 100,
  "window_seconds": 60
}
```

**Response:**
```json
{
  "allowed": true,
  "remaining": 95
}
```

### n8n Automation
```http
POST /n8n-automation
Authorization: Bearer <N8N_BEARER_TOKEN>
Content-Type: application/json

{
  "workflow_id": "wf123",
  "workflow_name": "Bet Settlement",
  "trigger_event": "bet_won",
  "data": {
    "bet_id": "uuid",
    "user_id": "uuid",
    "winnings": 50000
  }
}
```

### Push Notification
```http
POST /push-notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "You won!",
  "body": "Your bet on Arsenal won ₦50,000!",
  "data": {
    "route": "/bets/uuid"
  }
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Error - Server error |

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Public | 100/min per IP |
| Authenticated | 200/min per user |
| Admin | 500/min per admin |
| Webhooks | 1000/min per source |
