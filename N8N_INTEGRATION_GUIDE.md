# n8n Complete Integration Guide

## Overview
This guide provides everything n8n needs to fully manage and update your betting platform minute-by-minute with bi-directional real-time communication.

---

## 🔄 Architecture

### Outgoing (Site → n8n)
Your admin webhooks send events to n8n workflows for processing.

### Incoming (n8n → Site)
n8n workflows send updates back to your site via the webhook receiver, which broadcasts to active users through Supabase Realtime.

---

## 📡 What n8n Needs From Your Site

### 1. Outgoing Webhook URLs (Already Configured)
Configure these in your Admin Webhook Settings at `/admin/webhooks`:

- **bet_placed** - Triggered when users place bets
- **bet_won** - Triggered when bets win
- **bet_lost** - Triggered when bets lose
- **deposit** - Triggered when users deposit funds
- **withdrawal** - Triggered when users request withdrawals
- **user_registered** - Triggered when new users sign up

### 2. API Credentials

**Supabase Project URL:**
```
https://aacjfdrctnmnenebzdxg.supabase.co
```

**Anon Key (Public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhY2pmZHJjdG5tbmVuZWJ6ZHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQ1MjEsImV4cCI6MjA3ODM3MDUyMX0.CWYjgGOs-b64CbfzlIfy6P-hSGA1SMgWs6qD0tu7TrY
```

**Service Role Key (Private - Store as n8n credential):**
Ask your admin to provide this securely.

### 3. Incoming Lovable API Endpoints (n8n Calls These)

n8n workflows need to send data TO these endpoints hourly:

#### Update Leagues Endpoint
- **URL**: `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-leagues`
- **Method**: POST
- **Authentication**: Bearer `N8N_BEARER_TOKEN` (configured on Lovable side)
- **Purpose**: Hourly sports/leagues data sync from The Odds API

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

**n8n Configuration**:
```
HTTP Request Node:
- Method: POST
- URL: https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-leagues
- Authentication: Header Auth
  - Header Name: Authorization
  - Header Value: Bearer [YOUR_N8N_BEARER_TOKEN]
- Body: JSON
```

#### Marketing Post Endpoint
- **URL**: `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/marketing-post`
- **Method**: POST
- **Authentication**: Bearer `N8N_BEARER_TOKEN`
- **Purpose**: Hourly AI-generated marketing content delivery

**Request Body**:
```json
{
  "content": "📊 Breaking: Bitcoin reaches new high! Place your crypto prediction bets now and get 20% bonus on wins!"
}
```

**n8n Configuration**:
```
HTTP Request Node:
- Method: POST
- URL: https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/marketing-post
- Authentication: Header Auth
  - Header Name: Authorization
  - Header Value: Bearer [YOUR_N8N_BEARER_TOKEN]
- Body: JSON
```

---

## 📨 What You Need From n8n

### Incoming Webhook Endpoint
Point your n8n workflows to send POST requests to:

```
https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver
```

### n8n Webhook Endpoints (Receive Data FROM Lovable)

n8n must provide these webhook URLs to receive events from Lovable:

#### User Registration Webhook
Default n8n URL (can be changed in admin webhook settings):
```
https://pannaafric.app.n8n.cloud/webhook/user-registration
```

**Data Received from Lovable**:
```json
{
  "id": "user_uuid",
  "username": "John Doe",
  "email": "john@example.com",
  "registered_at": "2025-01-14T12:00:00Z"
}
```

**n8n Workflow Setup**:
1. Add a Webhook trigger node
2. Set Method: POST
3. Set Path: `/user-registration`
4. Connect to your Postgres storage node

---

### Authentication Header
Include in all n8n → Site requests:

```http
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
X-N8N-Source: your-workflow-name
Content-Type: application/json
```

### Supported Event Types

#### 1. Odds Update
Send real-time odds changes to all active users:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "odds_update",
  "source_workflow": "odds-scraper",
  "data": {
    "match_id": "match_123",
    "market": "1X2",
    "odds": [1.85, 3.40, 4.20],
    "timestamp": "2025-01-14T12:00:00Z"
  }
}
```

**What Happens:**
- Updates `realtime_odds_cache` table
- Broadcasts to all users on `odds:updates` channel
- Users see instant odds changes without refresh

---

#### 2. Bet Settlement
Instantly settle bets and notify users:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "bet_settlement",
  "source_workflow": "bet-settler",
  "data": {
    "bet_id": "bet_789",
    "status": "won",
    "payout": 150.00,
    "timestamp": "2025-01-14T12:05:00Z"
  }
}
```

**What Happens:**
- Broadcasts to `bets:settlements` channel
- Users with active bets see instant settlement
- Triggers balance updates if needed

---

#### 3. Promotion Trigger
Send flash promotions to all users:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "promotion_trigger",
  "source_workflow": "promo-scheduler",
  "data": {
    "title": "⚡ Flash Bonus!",
    "message": "50% deposit bonus for the next 2 hours!",
    "code": "FLASH50",
    "expires_at": "2025-01-14T14:00:00Z"
  }
}
```

**What Happens:**
- Broadcasts to `system:alerts` channel
- All active users see toast notification
- Promotion appears site-wide

---

#### 4. System Alert
Global announcements:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "system_alert",
  "source_workflow": "system-monitor",
  "data": {
    "title": "System Maintenance",
    "message": "Scheduled maintenance in 30 minutes",
    "severity": "warning"
  }
}
```

**What Happens:**
- Broadcasts to all users via `system:alerts`
- Shows as site-wide notification

---

#### 5. User Notification
Send notifications to specific users:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "user_notification",
  "source_workflow": "vip-manager",
  "target_user_id": "user_uuid_here",
  "data": {
    "type": "vip_upgrade",
    "title": "VIP Status Upgraded!",
    "message": "Congratulations! You're now a Gold member.",
    "extra": {
      "new_tier": "gold",
      "benefits": ["higher_limits", "faster_withdrawals"]
    }
  }
}
```

**What Happens:**
- Stored in `pending_notifications` table
- Broadcasts to user-specific channel `user:{userId}`
- User sees toast notification instantly
- Notification appears in notification center

---

#### 6. Balance Update
Update user balance in real-time:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "balance_update",
  "source_workflow": "payment-processor",
  "target_user_id": "user_uuid_here",
  "data": {
    "new_balance": 1250.00,
    "change": 250.00,
    "reason": "deposit_approved"
  }
}
```

**What Happens:**
- Broadcasts to user-specific channel
- User sees balance update instantly
- No page refresh needed

---

#### 7. Game State Change
Update live match states:

```json
POST /functions/v1/n8n-webhook-receiver
{
  "event_type": "game_state_change",
  "source_workflow": "live-tracker",
  "data": {
    "match_id": "match_123",
    "event": "goal",
    "team": "home",
    "minute": 34,
    "score": [2, 1]
  }
}
```

**What Happens:**
- Broadcasts to `game:state` channel
- Users watching the match see instant updates

---

## 🔌 Example n8n Workflows

### Workflow 1: Minute-by-Minute Odds Updates

**Trigger:** Cron (every minute)

**Nodes:**
1. **Cron Trigger** - Every 1 minute
2. **HTTP Request** - Fetch odds from provider API
3. **Code** - Transform odds data
4. **HTTP Request** - POST to `/n8n-webhook-receiver`

**Code Node Example:**
```javascript
const matches = $input.all();
const updates = [];

for (const match of matches) {
  updates.push({
    event_type: "odds_update",
    source_workflow: "odds-scraper-v1",
    data: {
      match_id: match.json.id,
      market: "1X2",
      odds: match.json.odds,
      timestamp: new Date().toISOString()
    }
  });
}

return updates;
```

---

### Workflow 2: Automatic Bet Settlement

**Trigger:** Webhook from your site (bet_placed)

**Nodes:**
1. **Webhook Trigger** - Receives bet_placed events
2. **Wait** - Wait for match to finish
3. **HTTP Request** - Check match result from API
4. **Code** - Determine win/loss
5. **HTTP Request** - POST settlement to `/n8n-webhook-receiver`

---

### Workflow 3: VIP User Engagement

**Trigger:** Webhook (user deposits > $1000)

**Nodes:**
1. **Webhook Trigger** - High-value deposit
2. **Code** - Check user VIP status
3. **HTTP Request** - Send personalized notification

```json
{
  "event_type": "user_notification",
  "target_user_id": "{{$json.user_id}}",
  "data": {
    "type": "vip_offer",
    "title": "Exclusive VIP Offer",
    "message": "Thanks for your deposit! Here's a 20% bonus."
  }
}
```

---

### Workflow 4: Flash Promotions

**Trigger:** Manual or scheduled

**Nodes:**
1. **Schedule Trigger** - Friday 6 PM
2. **Code** - Generate promo code
3. **HTTP Request** - Broadcast promotion

---

## 🎯 Frontend Integration

### Using Realtime Hooks in Your React Components

```typescript
import { useRealtimeOdds } from '@/hooks/useRealtimeOdds';
import { useRealtimeBets } from '@/hooks/useRealtimeBets';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

function MatchComponent({ matchId, userId }) {
  // Listen for odds updates for this specific match
  const { oddsUpdates, isConnected } = useRealtimeOdds(matchId);
  
  // Listen for bet settlements
  const { settlements } = useRealtimeBets();
  
  // Listen for notifications
  const { notifications, unreadCount } = useRealtimeNotifications(userId);

  return (
    <div>
      {oddsUpdates.map(update => (
        <div>Match {update.match_id}: {update.odds.join(' - ')}</div>
      ))}
      <Badge>{unreadCount} new notifications</Badge>
    </div>
  );
}
```

---

## 📊 Monitoring & Debugging

### View Event Logs (Admin Only)
Query the `n8n_events_log` table:

```sql
SELECT * FROM n8n_events_log 
ORDER BY created_at DESC 
LIMIT 100;
```

### Check Realtime Odds Cache
```sql
SELECT * FROM realtime_odds_cache 
WHERE match_id = 'match_123';
```

### View User Notifications
```sql
SELECT * FROM pending_notifications 
WHERE user_id = 'user_uuid' 
ORDER BY created_at DESC;
```

---

## 🔒 Security Best Practices

1. **Never expose Service Role Key in frontend**
2. **Use n8n credential store** for sensitive keys
3. **Include X-N8N-Source header** for audit trails
4. **Monitor n8n_events_log** for suspicious activity
5. **Rate limit n8n workflows** to prevent abuse

---

## 🚀 Quick Start Checklist

- [ ] Configure outgoing webhooks in Admin Settings
- [ ] Store Supabase credentials in n8n
- [ ] Create first n8n workflow (try odds updates)
- [ ] Test with POST to `/n8n-webhook-receiver`
- [ ] Verify events appear in `n8n_events_log`
- [ ] Check frontend receives realtime updates
- [ ] Monitor Supabase Realtime connections

---

## 📞 Support

- View edge function logs in Supabase dashboard
- Check browser console for realtime connection status
- Monitor `n8n_events_log` table for processing errors

---

**🎉 You're now set up for minute-by-minute n8n management!**