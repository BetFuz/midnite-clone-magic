# n8n API Endpoints - Complete Summary

## Overview
This document outlines all API endpoints created for bi-directional integration between Lovable and n8n.

---

## 🔹 Incoming Endpoints (n8n → Lovable)

These endpoints receive data FROM n8n and are called BY n8n workflows.

### 1. Update Leagues Endpoint

**Purpose**: Receive hourly sports and leagues data from The Odds API via n8n

**URL**:
```
https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-leagues
```

**Method**: `POST`

**Authentication**: 
```http
Authorization: Bearer N8N_BEARER_TOKEN
```
*(Token configured in Lovable secrets)*

**Request Body**:
```json
{
  "leaguesData": {
    "sport_key": "soccer_epl",
    "sport_title": "English Premier League",
    "leagues": []
  }
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Leagues updated for soccer_epl"
}
```

**Response Error (401)**:
```json
{
  "error": "Unauthorized"
}
```

**Response Error (400)**:
```json
{
  "error": "Invalid request body"
}
```

**What It Does**:
1. Validates Bearer token
2. Upserts data into `sports_leagues` table
3. Updates existing leagues or creates new entries
4. Returns success confirmation

**Database Impact**:
- Table: `sports_leagues`
- Action: UPSERT (based on `sport_key`)
- Columns updated: `sport_title`, `leagues`, `updated_at`

---

### 2. Marketing Post Endpoint

**Purpose**: Receive hourly AI-generated marketing content from n8n

**URL**:
```
https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/marketing-post
```

**Method**: `POST`

**Authentication**:
```http
Authorization: Bearer N8N_BEARER_TOKEN
```

**Request Body**:
```json
{
  "content": "📊 Breaking: Bitcoin reaches new high! Place your crypto prediction bets now!"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Marketing post created successfully",
  "post_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Error (401)**:
```json
{
  "error": "Unauthorized"
}
```

**Response Error (400)**:
```json
{
  "error": "Content is required and must be a string"
}
```

**What It Does**:
1. Validates Bearer token
2. Inserts marketing content into database
3. Broadcasts to Realtime channel `marketing:updates`
4. Returns post ID for tracking

**Database Impact**:
- Table: `marketing_posts`
- Action: INSERT
- Broadcasts: Realtime channel for instant frontend updates

---

### 3. n8n Webhook Receiver (Multi-Event)

**Purpose**: Central hub for receiving various event types from n8n (odds, settlements, alerts)

**URL**:
```
https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver
```

**Method**: `POST`

**Authentication**:
```http
Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY
X-N8N-Source: workflow-name
```

**Supported Event Types**:
- `odds_update` - Real-time odds changes
- `bet_settlement` - Bet results
- `promotion_trigger` - Flash promotions
- `system_alert` - System announcements
- `user_notification` - User-specific notifications
- `balance_update` - Balance changes
- `game_state_change` - Live game updates

**Request Body**:
```json
{
  "event_type": "odds_update",
  "source_workflow": "odds-scraper",
  "target_user_id": "uuid-optional",
  "data": {
    // Event-specific data
  }
}
```

---

## 🔸 Outgoing Endpoints (Lovable → n8n)

These endpoints are called BY Lovable to send data TO n8n.

### 4. User Registration Webhook Handler

**Internal Endpoint** (Called by Lovable's auth system):
```
https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/user-registration-webhook
```

**This endpoint forwards data to n8n at**:
```
https://pannaafric.app.n8n.cloud/webhook/user-registration
```

**What Lovable Sends to n8n**:
```json
{
  "id": "user_uuid",
  "username": "John Doe",
  "email": "john@example.com",
  "registered_at": "2025-01-14T12:00:00Z"
}
```

**Flow**:
1. User registers on Lovable
2. Lovable calls `user-registration-webhook` with user ID
3. Edge function fetches user profile
4. Sends data to n8n webhook
5. n8n stores in Postgres or processes further

---

## 🔐 Authentication Summary

### For n8n Calling Lovable:
- Header: `Authorization: Bearer N8N_BEARER_TOKEN`
- Token stored in Lovable secrets (configured by admin)
- Required for: `update-leagues`, `marketing-post`

### For Lovable Calling n8n:
- No authentication required on n8n webhooks (public endpoints)
- Can configure webhook URLs in admin panel at `/admin/webhooks`

---

## 📊 Database Tables Created

### sports_leagues
```sql
- id: UUID (PK)
- sport_key: TEXT (UNIQUE)
- sport_title: TEXT
- leagues: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**Purpose**: Store sports and leagues data from The Odds API

**RLS**: Public read access

---

### marketing_posts
```sql
- id: UUID (PK)
- content: TEXT
- posted_at: TIMESTAMPTZ
- status: TEXT (default: 'active')
- created_at: TIMESTAMPTZ
```

**Purpose**: Store AI-generated marketing content

**RLS**: Public read access

**Realtime**: Broadcasts on `marketing:updates` channel

---

## 🚀 How to Test

### Test Update Leagues:
```bash
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-leagues \
  -H "Authorization: Bearer YOUR_N8N_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaguesData": {
      "sport_key": "test_sport",
      "sport_title": "Test Sport",
      "leagues": [{"id": 1, "name": "Test League"}]
    }
  }'
```

### Test Marketing Post:
```bash
curl -X POST https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/marketing-post \
  -H "Authorization: Bearer YOUR_N8N_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test marketing post"
  }'
```

---

## 📝 Configuration Steps

### For n8n Team:

1. **Store Credentials**:
   - Add `N8N_BEARER_TOKEN` as credential in n8n
   - Use for `update-leagues` and `marketing-post` calls

2. **Configure Workflows**:
   - **Hourly Leagues Sync**: 
     - Trigger: Schedule (every hour)
     - Action: HTTP Request to `update-leagues`
     - Auth: Bearer token
   
   - **Hourly Marketing**: 
     - Trigger: Schedule (every hour)  
     - Action: HTTP Request to `marketing-post`
     - Auth: Bearer token

3. **Setup User Registration Receiver**:
   - Create webhook trigger: `/user-registration`
   - Method: POST
   - Store received data in Postgres

### For Lovable Admin:

1. **Configure Webhooks** at `/admin/webhooks`:
   - Set `user_registered` URL to n8n webhook
   - Test webhook delivery

2. **Monitor Logs**:
   - Check edge function logs for errors
   - View `n8n_events_log` table for event history

---

## 🔍 Monitoring & Debugging

### Check Edge Function Logs:
View in Lovable backend dashboard for:
- `update-leagues`
- `marketing-post`
- `user-registration-webhook`
- `n8n-webhook-receiver`

### Database Monitoring:
```sql
-- Check sports leagues data
SELECT * FROM sports_leagues ORDER BY updated_at DESC;

-- Check marketing posts
SELECT * FROM marketing_posts ORDER BY created_at DESC LIMIT 10;

-- Check n8n event logs
SELECT * FROM n8n_events_log ORDER BY created_at DESC LIMIT 20;
```

---

## 🎯 Next Steps

1. ✅ Create bearer token for n8n authentication
2. ✅ Configure n8n workflows for hourly syncs
3. ✅ Set up n8n webhook receiver for user registrations
4. ✅ Test all endpoints with sample data
5. ✅ Monitor logs for first 24 hours
6. ✅ Set up alerts for failed requests

---

## 📞 Support

For issues or questions:
- Check edge function logs in backend
- Review `n8n_events_log` table
- Verify bearer token is correct
- Ensure webhook URLs are accessible
