# WebSocket / Real-Time Bet-Ticket Updates Integration

## Overview

This integration provides real-time bet updates and cashout functionality through Supabase WebSocket Edge Functions, which can be integrated with the existing NestJS backend via webhooks and database triggers.

## Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────────┐
│  React Frontend │◄────────────────────────────│  Supabase Edge Fn    │
│  (bet-socket-   │                             │  (bet-socket-gateway)│
│   gateway)      │                             └──────────┬───────────┘
└─────────────────┘                                        │
                                                           │ Realtime DB
                                                           ▼
                                              ┌────────────────────────┐
                                              │   Postgres Database    │
                                              │   - bet_slips          │
                                              │   - bet_selections     │
                                              └────────┬───────────────┘
                                                       │
                                                       │ Triggers/Webhooks
                                                       ▼
                                              ┌────────────────────────┐
                                              │  NestJS Backend        │
                                              │  - Settlement Service  │
                                              │  - Cashout Service     │
                                              │  - BullMQ Jobs         │
                                              └────────────────────────┘
```

## Components

### 1. Supabase Edge Function: `bet-socket-gateway`

**Location**: `supabase/functions/bet-socket-gateway/index.ts`

**Purpose**: WebSocket relay that pushes real-time events to connected clients

**Events Emitted**:
- `bet.updated` - Bet slip or selection status changed
- `bet.settled` - Bet has been settled (won/lost)
- `selection.updated` - Individual selection status changed
- `cashout.offered` - Cashout offer generated
- `cashout.success` - Cashout processed successfully
- `cashout.error` - Cashout processing failed

**Events Received**:
- `cashout.request` - User requests cashout for a bet
- `cashout.accept` - User accepts cashout offer
- `ping` - Keepalive ping

**Authentication**: Uses Supabase JWT tokens passed via Authorization header

### 2. React Hook: `useRealtimeBetUpdates`

**Location**: `src/hooks/useRealtimeBetUpdates.ts`

**Features**:
- Auto-connect on mount with token refresh
- Auto-reconnect on disconnect (5s delay)
- Cashout offer management with expiry tracking
- Toast notifications for bet events
- Connection status monitoring

**API**:
```typescript
const {
  connected,        // WebSocket connection status
  lastUpdate,       // Last received update
  cashoutOffers,    // Map<betSlipId, CashoutOffer>
  requestCashout,   // (betSlipId) => void
  acceptCashout,    // (betSlipId, amount) => void
  reconnect         // () => void
} = useRealtimeBetUpdates();
```

### 3. Live Bet Component: `BetTicketLive`

**Location**: `src/components/BetTicketLive.tsx`

**Features**:
- Real-time bet status updates
- Live cashout offers with countdown timer
- Connection status indicator
- Accept/decline cashout actions
- Visual progress indicators

## Integration with NestJS Backend

### Option 1: Database Triggers (Recommended)

Create PostgreSQL triggers that call your NestJS settlement service:

```sql
-- Trigger when bet status changes
CREATE OR REPLACE FUNCTION notify_bet_settlement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('won', 'lost') AND OLD.status != NEW.status THEN
    -- Call NestJS webhook
    PERFORM pg_notify(
      'bet_settled',
      json_build_object(
        'bet_slip_id', NEW.id,
        'user_id', NEW.user_id,
        'status', NEW.status,
        'stake', NEW.total_stake,
        'potential_win', NEW.potential_win
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bet_settlement_trigger
  AFTER UPDATE ON bet_slips
  FOR EACH ROW
  EXECUTE FUNCTION notify_bet_settlement();
```

### Option 2: BullMQ Job Integration

The NestJS backend can enqueue BullMQ jobs for bet settlement:

```typescript
// In your NestJS settlement service
@Injectable()
export class SettlementService {
  constructor(
    @InjectQueue('bet-settlement') private settlementQueue: Queue,
    private prisma: PrismaService
  ) {}

  async settleBet(betSlipId: string, status: 'won' | 'lost') {
    // Add to BullMQ for processing
    await this.settlementQueue.add('settle-bet', {
      betSlipId,
      status,
      timestamp: new Date()
    });

    // Update Supabase database (triggers WebSocket update)
    await this.prisma.betSlip.update({
      where: { id: betSlipId },
      data: { 
        status,
        settled_at: new Date()
      }
    });
  }
}
```

### Option 3: Webhook Integration

Configure the Edge Function to call NestJS webhooks:

```typescript
// In bet-socket-gateway edge function
if (message.type === "cashout.accept") {
  // Call NestJS API
  const response = await fetch('https://your-nestjs-api.com/webhooks/cashout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INTERNAL_API_KEY}`
    },
    body: JSON.stringify({
      betSlipId,
      userId,
      cashoutAmount: cashoutOffer
    })
  });

  const result = await response.json();
  // Handle result...
}
```

## Cashout Flow

1. **User Requests Cashout**
   ```
   Frontend → WebSocket → Edge Function
   ```

2. **Cashout Offer Calculation**
   ```typescript
   // Current implementation (simplified)
   const currentValue = betSlip.total_stake * 0.7;
   const cashoutOffer = Math.min(currentValue, betSlip.potential_win * 0.8);
   ```

3. **Offer Expiry**
   - Offers expire after 30 seconds
   - Frontend tracks expiry via countdown timer
   - Expired offers are automatically removed from UI

4. **Accept Cashout**
   ```
   Frontend → WebSocket → Edge Function → Update DB → Credit Balance
   ```

5. **NestJS Integration Point**
   - Hook into database trigger or webhook
   - Process cashout through your settlement service
   - Update any external systems (payment processors, analytics)

## Database Schema Requirements

Ensure your bet_slips table supports these statuses:
```sql
ALTER TABLE bet_slips 
ADD CONSTRAINT check_status 
CHECK (status IN ('pending', 'pending_settlement', 'won', 'lost', 'cashed_out', 'cancelled'));
```

## Environment Variables

Required in Supabase Edge Function:
- `SUPABASE_URL` - Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided

Required in Frontend:
- Project ref hardcoded in `useRealtimeBetUpdates.ts` (line 29)

## Testing

### WebSocket Connection Test
```bash
# Install wscat
npm install -g wscat

# Connect to edge function
wscat -c "wss://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/bet-socket-gateway" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send test message
{"type": "ping"}

# Expected response
{"type": "pong"}
```

### Cashout Flow Test
```javascript
// In browser console
const betSlipId = 'test-bet-id';
ws.send(JSON.stringify({ type: 'cashout.request', betSlipId }));
```

## Performance Considerations

1. **Connection Limits**: Each WebSocket maintains an open connection. Monitor concurrent connections.

2. **Message Size**: Keep messages under 1MB. Paginate large payloads.

3. **Reconnection Strategy**: 5-second exponential backoff prevents thundering herd.

4. **Offer Expiry**: Client-side expiry cleanup runs every 1 second.

5. **Database Realtime**: Supabase Realtime uses PostgreSQL LISTEN/NOTIFY. Ensure proper indexing on `user_id` and `bet_slip_id`.

## Security

1. **JWT Validation**: Edge function validates Supabase JWT on connection
2. **User Isolation**: Only subscribe to user's own bet updates
3. **Cashout Authorization**: Verify bet ownership before processing cashout
4. **Rate Limiting**: Consider adding rate limits on cashout requests

## Future Enhancements

1. **Live Odds Updates**: Push real-time odds changes to active bets
2. **Partial Cashout**: Allow cashing out portion of bet
3. **Auto-Cashout**: Set target profit percentage for automatic cashout
4. **Bet Builder Updates**: Real-time odds recalculation for bet builders
5. **Group Bet Sync**: Synchronize pool betting states across users

## Monitoring

Key metrics to track:
- WebSocket connection count
- Average connection duration
- Cashout acceptance rate
- Message delivery latency
- Reconnection frequency
- Error rates by type

## Troubleshooting

**Connection fails immediately**
- Check JWT token is valid
- Verify project ref in WebSocket URL
- Check CORS settings if using custom domain

**No updates received**
- Verify Postgres Realtime is enabled for tables
- Check RLS policies allow user to read their bets
- Ensure bet_slips has REPLICA IDENTITY FULL

**Cashout offers not appearing**
- Check bet status is 'pending' or 'pending_settlement'
- Verify WebSocket connection is active
- Check browser console for errors

**Offers expire too quickly**
- Adjust `expiresIn` in edge function (line 124)
- Consider user timezone and network latency
