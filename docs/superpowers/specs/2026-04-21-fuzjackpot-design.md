# FuzJackpot — Design Spec
**Date:** 2026-04-21
**Status:** Approved for implementation

---

## Overview

FuzJackpot is a multi-tier weekly prediction jackpot — the best-executed jackpot product in African betting. Three simultaneous jackpots (Mini, Midi, Mega) run every week. Users pick 1X2 outcomes for a set of matches. The pot grows as entries pour in and rolls over if nobody wins. Every match card shows rich statistics and analytics so users can make informed picks. An AI assistant fills picks on demand. Groups can enter together via syndicates.

No African platform combines all of these: multi-tier + rollover + syndicates + per-match stats + AI picks + live pool counter.

---

## Architecture

### Database (new tables)

**`jackpot_rounds`**
```
id              String   @id
tier            Enum     MINI | MIDI | MEGA
weekLabel       String   (e.g. "Week 17 · Apr 21–27")
status          Enum     OPEN | CLOSED | SETTLED | ROLLED_OVER
poolAmount      Decimal  (grows with every entry)
guaranteedMin   Decimal  (₦1M / ₦5M / ₦50M by tier)
entryFee        Decimal  (₦100 / ₦200 / ₦500 by tier)
matchCount      Int      (8 / 12 / 17 by tier)
closesAt        DateTime (Sunday 10pm WAT)
settledAt       DateTime?
rolloverFrom    String?  (id of previous round if rollover)
rolloverWeeks   Int      (how many weeks it has rolled)
createdAt       DateTime
```

**`jackpot_matches`**
```
id              String   @id
roundId         String
eventId         String   (references sports_events)
position        Int      (order 1..17)
homeTeam        String
awayTeam        String
league          String
kickoffAt       DateTime
result          Enum?    HOME | DRAW | AWAY  (null until settled)
homeOdds        Decimal?
drawOdds        Decimal?
awayOdds        Decimal?
statsSnapshot   Json     (form, H2H, goals, injuries — snapshotted at round open)
```

**`jackpot_entries`**
```
id              String   @id
userId          String
roundId         String
syndicateId     String?
picks           Json     ([{matchId, pick: "HOME"|"DRAW"|"AWAY"}, ...])
ticketNumber    Int      (1, 2, 3... for multiple tickets per user)
entryFee        Decimal
status          Enum     PENDING | CORRECT_ALL | CONSOLATION | LOST
correctCount    Int?     (filled on settlement)
payout          Decimal? (filled on settlement)
usedAIPicks     Boolean
createdAt       DateTime
```

**`jackpot_syndicates`**
```
id              String   @id
roundId         String
creatorId       String
shareCode       String   @unique  (6-char alphanumeric)
memberCount     Int
requiredMembers Int
contributionPer Decimal
status          Enum     FORMING | COMPLETE | CANCELLED
members         Json     ([{userId, joinedAt, contributed}])
entryId         String?  (set when fully funded and submitted)
createdAt       DateTime
```

### Backend routes (`/jackpot/*`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jackpot/rounds` | All active rounds with live pool amounts |
| GET | `/jackpot/rounds/:id` | Round detail — matches + stats + current odds |
| POST | `/jackpot/enter` | Submit ticket, debit wallet, increment pool |
| POST | `/jackpot/ai-picks/:roundId` | Claude returns picks + reasons + confidence |
| POST | `/jackpot/syndicate/create` | Create group entry, get share code |
| POST | `/jackpot/syndicate/join/:code` | Join syndicate, contribute stake |
| GET | `/jackpot/syndicate/:code` | Syndicate status (members joined, funded?) |
| GET | `/jackpot/my-tickets` | User's entries across all tiers + live progress |
| GET | `/jackpot/history` | Past rounds — pools, winners, rollovers |
| POST | `/jackpot/settle/:roundId` | Admin/cron — check results, pay winners, rollover |

### Cron job

`jackpotSettlement.ts` — runs at 11pm WAT Sunday. For each CLOSED round:
1. Fetch final results from The Odds API / sports_events table
2. Score every entry's picks against results
3. Find jackpot winners (all correct) — split pool equally if multiple
4. Award consolation prizes (-1, -2, -3 correct) per prize table
5. Credit winners' wallets
6. If no jackpot winner → create next week's round with `rolloverFrom` + increment `rolloverWeeks` + carry pool forward
7. Write audit_log entries for all payouts
8. Push SSE notification to all active users: "🎉 Week 17 Mega Jackpot won by Chidi O. — ₦73M!"

### Real-time

Pool counter updates pushed via existing SSE stream when entries are submitted. Frontend increments the displayed amount optimistically on every entry event.

---

## Tier Structure

| Tier | Matches | Entry Fee | Guaranteed Min | Consolation (-1) | Consolation (-2) | Consolation (-3) |
|------|---------|-----------|----------------|-----------------|-----------------|-----------------|
| Mini | 8 | ₦100 | ₦1,000,000 | ₦50,000 | ₦10,000 | ₦2,000 |
| Midi | 12 | ₦200 | ₦5,000,000 | ₦200,000 | ₦50,000 | ₦10,000 |
| Mega | 17 | ₦500 | ₦50,000,000 | ₦1,000,000 | ₦200,000 | ₦50,000 |

Multiple tickets per user per round — no limit. Each ticket is an independent entry.

---

## Frontend Pages & Components

### `Jackpot.tsx` (full rewrite)

**Hero section — Tier Dashboard:**
Three scrollable jackpot cards:
- Live pool counter (ticks up via SSE)
- Countdown timer to close
- Player count ("341 playing")
- Sparkline chart: pool growth over the week (or across rollover weeks)
- ROLLOVER badge when `rolloverWeeks > 0` with "Week N rollover 🔥"
- Recent winner ticker: "Chidi O. won ₦4.2M last week"

Tap a card → picks interface opens below.

**Match cards (inside each tier):**

Each match card shows:
- Home vs Away team names + league badge
- Kickoff time
- 1X2 pick buttons (Home / Draw / Away) with current odds
- **Form guide:** Last 5 results for each team as W/D/L pill badges
- **H2H mini bar:** Horizontal bar — home win % / draw % / away win % from last 10 meetings
- **Goals per game:** Average scored and conceded (small badge under each team)
- **Odds movement:** ↑↓ arrow next to each odds value showing line movement since open
- **Injury flag:** Red dot if ESPN reports a key player out

**AI Suggest button:**
- Fills all unpicked matches with Claude's recommendations
- Each filled match shows a confidence bar (e.g. 78%) and one-line reason
- User can tap any AI-picked button to override it
- AI reasoning sourced from: form data, H2H, odds movement, injury flags

**Progress tracker:**
- Sticky bar at bottom: pick count / total (e.g. "9 / 12 picked")
- Fills green as picks are made
- Submit button activates when all picks made

**My Tickets tab:**
- All entries across Mini / Midi / Mega
- Live match-by-match tracker as results come in: ✅ correct / ❌ wrong per match
- Radar chart: correct vs incorrect at a glance
- "11/17 correct — on track for ₦200k consolation" progress callout
- Accuracy history bar chart: your hit rate per round over past 8 weeks
- Syndicate entries show member avatars and their contribution

**Syndicate flow:**
- "Enter with friends" button per tier
- Creates syndicate → shows share code + WhatsApp deep link
- Friends open the link → see who's joined, contribute their share
- Auto-submits when fully funded
- Refunds all contributions if round closes before fully funded

### New components

| Component | Responsibility |
|-----------|---------------|
| `JackpotTierCard.tsx` | Live pool counter, sparkline, rollover badge, player count |
| `JackpotMatchCard.tsx` | Match picks + form guide + H2H bar + odds movement + injury flag |
| `JackpotAIPicks.tsx` | AI suggestion overlay with confidence bars + reasons |
| `JackpotProgress.tsx` | Sticky bottom bar with pick count + submit button |
| `JackpotMyTickets.tsx` | Live ticket tracker, radar chart, accuracy history |
| `JackpotSyndicate.tsx` | Create / join group entry flow |
| `useJackpot.ts` | Data hook — rounds, picks state, submit, SSE pool updates |
| `useJackpotStats.ts` | Fetches match stats (form, H2H) from ESPN API |

---

## Match Statistics Data Flow

1. **At round creation (admin):** Backend fetches form and H2H for each match from ESPN API and snapshots into `jackpot_matches.statsSnapshot`. This means stats are always available even if ESPN is down during the round.

2. **On page load:** Frontend reads stats from the round's match data (already in the API response) — no additional API calls needed per match.

3. **Odds movement:** Frontend compares current odds (from The Odds API via `/jackpot/rounds/:id`) against the odds at round open (stored in `jackpot_matches`). Arrow direction derived client-side.

4. **AI picks:** When user taps "AI Suggest", backend receives the round's stats snapshot + current odds and sends to Claude. Claude returns `[{matchId, pick, confidence, reason}]`. No external call for stats — all local data.

---

## Admin Panel

New section in the admin dashboard (`/admin/jackpot`):
- Create new round (select tier, set matches, set guaranteed min, set close time)
- View live pool amounts across all three tiers
- Manually trigger settlement for a round
- See all entries per round (count, total pool collected)
- Manage rollover state (override rollover if needed)
- Winner payout history

---

## Prize Pool Mechanics

- 5% of each entry fee goes to the house (platform fee)
- 95% goes into the prize pool
- Pool is topped up to the guaranteed minimum from a reserve wallet if entries don't reach it
- If pool exceeds guaranteed min, the full pool is paid (no cap)
- On rollover: entire previous pool carries forward + new entries added on top

---

## What Is NOT In Scope

- Jackpot on non-football events (future)
- Live jackpot (picks mid-game — future)
- Jackpot leaderboards / public profiles (future)
- WhatsApp bot integration for pick submission (future)
