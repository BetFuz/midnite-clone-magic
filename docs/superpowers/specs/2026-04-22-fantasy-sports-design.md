# Fantasy Sports Full Rebuild — Design Spec

**Goal:** Build a complete multi-sport fantasy platform on top of BetFuz — daily and season-long contests, salary cap draft room, live leaderboard, and hybrid ESPN/admin scoring — replacing the broken Supabase-based code entirely.

**Architecture:** Option C — separate backend route files per concern (contests, draft/players, admin, scoring cron) sharing six Prisma models. Frontend: `/fantasy` lobby + `/fantasy/contest/:id` draft room + `/fantasy/leaderboard/:id` live leaderboard — each a focused page. Shared `useFantasyContest` hook. SSE for live contests, 30s polling for settled/upcoming.

**Tech Stack:** React 18, TypeScript, TanStack Query, Tailwind CSS, lucide-react, Recharts, Express backend, Prisma (PostgreSQL), Redis (SSE pub/sub), ESPN public API (auto-scoring), node-cron.

---

## Section 1 — Prisma Data Models

Six new models appended to `schema.prisma`:

### `fantasy_sports`
Sport registry — seeded at startup.
```prisma
model fantasy_sports {
  id       String @id @default(uuid())
  name     String @unique  // "Football" | "Basketball" | "Cricket"
  icon     String          // emoji or slug
  active   Boolean @default(true)
  fantasy_contests fantasy_contests[]
  fantasy_players  fantasy_players[]
}
```

### `fantasy_contests`
A single playable contest.
```prisma
model fantasy_contests {
  id             String   @id @default(uuid())
  sport_id       String
  sport          fantasy_sports @relation(fields: [sport_id], references: [id])
  name           String
  format         String   // "DAILY" | "SEASON"
  status         String   @default("OPEN")  // "OPEN" | "LIVE" | "SETTLED" | "CANCELLED"
  entry_fee      Decimal  @db.Decimal(12,2)
  prize_pool     Decimal  @db.Decimal(12,2)
  salary_cap     Decimal  @db.Decimal(14,2)  // e.g. 100000000 for ₦100M
  max_entries    Int?
  deadline       DateTime
  gameweek_label String?  // e.g. "GW29 · Apr 21–27"
  scoring_rules  Json     // { GOAL: 6, ASSIST: 3, REB: 1.2, ... }
  created_at     DateTime @default(now())
  rosters        fantasy_rosters[]
  score_events   fantasy_score_events[]
}
```

### `fantasy_players`
Player pool per sport.
```prisma
model fantasy_players {
  id              String  @id @default(uuid())
  sport_id        String
  sport           fantasy_sports @relation(fields: [sport_id], references: [id])
  full_name       String
  team            String
  position        String  // GK|DEF|MID|FWD for football; PG|SG|SF|PF|C for basketball; BAT|BWL|AR|WK for cricket
  salary          Decimal @db.Decimal(12,2)
  projected_pts   Float   @default(0)
  form_rating     Float   @default(0)
  espn_id         String? // null for NPFL/admin-managed players
  active          Boolean @default(true)
  created_at      DateTime @default(now())
  roster_players  fantasy_roster_players[]
  score_events    fantasy_score_events[]
}
```

### `fantasy_rosters`
A user's team entry in one contest.
```prisma
model fantasy_rosters {
  id           String   @id @default(uuid())
  contest_id   String
  contest      fantasy_contests @relation(fields: [contest_id], references: [id])
  user_id      String
  user         users    @relation(fields: [user_id], references: [id])
  team_name    String
  total_points Float    @default(0)
  rank         Int?
  is_locked    Boolean  @default(false)
  created_at   DateTime @default(now())
  players      fantasy_roster_players[]

  @@unique([contest_id, user_id])
}
```

### `fantasy_roster_players`
Join between roster and player — one row per pick.
```prisma
model fantasy_roster_players {
  id            String          @id @default(uuid())
  roster_id     String
  roster        fantasy_rosters @relation(fields: [roster_id], references: [id])
  player_id     String
  player        fantasy_players @relation(fields: [player_id], references: [id])
  is_captain    Boolean @default(false)
  is_vice_captain Boolean @default(false)
  is_starter    Boolean @default(true)
  points_scored Float   @default(0)
}
```

### `fantasy_score_events`
Raw scoring events — one row per stat event per player.
```prisma
model fantasy_score_events {
  id         String          @id @default(uuid())
  contest_id String
  contest    fantasy_contests @relation(fields: [contest_id], references: [id])
  player_id  String
  player     fantasy_players  @relation(fields: [player_id], references: [id])
  event_type String   // "GOAL" | "ASSIST" | "REB" | "AST" | "PTS" | "WICKET" | etc.
  points     Float
  source     String   // "ESPN" | "ADMIN"
  created_at DateTime @default(now())
}
```

**Back-relations to add to `users` model:**
```prisma
fantasy_rosters fantasy_rosters[]
```

---

## Section 2 — Backend Routes

### `fantasy-contest.routes.ts` (mounted at `/api/fantasy`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contests` | List contests. Query: `sport`, `format`, `status`. Returns contests + entry count. |
| GET | `/contests/:id` | Contest detail + prize breakdown + user's roster if exists. |
| POST | `/contests/:id/join` | Create roster, deduct entry fee from wallet. Returns roster. |
| GET | `/contests/:id/roster` | My roster picks for this contest. |
| PUT | `/contests/:id/roster` | Save/update picks. Blocked if `is_locked` or past deadline. |
| GET | `/contests/:id/leaderboard` | Ranked rosters. SSE (`text/event-stream`) when contest is LIVE. |

### `fantasy-draft.routes.ts` (mounted at `/api/fantasy`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/players` | Player pool. Query: `sport_id`, `position`, `search`, `sort` (salary\|pts\|form). Paginated. |
| GET | `/players/:id` | Player detail + last 5 score events. |

### `fantasy-admin.routes.ts` (mounted at `/api/admin/fantasy`)
Requires `authenticate` + `requireRole('ADMIN', 'SUPER_ADMIN')`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contests` | All contests (any status). |
| POST | `/contests` | Create contest. Body: sport_id, name, format, entry_fee, prize_pool, salary_cap, deadline, scoring_rules, gameweek_label. |
| PATCH | `/contests/:id` | Update status or prize pool. |
| POST | `/contests/:id/settle` | Lock rosters, compute final ranks, distribute prizes. |
| GET | `/players` | All players for a sport. |
| POST | `/players` | Create player. |
| PATCH | `/players/:id` | Update player salary, projected_pts, form_rating. |
| POST | `/score-events` | Manually log a scoring event. Body: contest_id, player_id, event_type, points. |

---

## Section 3 — Scoring Cron (`fantasyScoring.ts`)

Runs every 30 minutes during live windows (6am–11pm WAT).

**Algorithm:**
1. Find all `fantasy_contests` with `status = 'LIVE'`
2. For each live contest:
   a. Fetch all `fantasy_players` in that contest that have an `espn_id`
   b. Fetch ESPN boxscore for the relevant sport/league
   c. Map ESPN stats → `score_events` using contest's `scoring_rules` JSON (skip if event already recorded)
   d. For admin-managed players: skip (admin posts score events manually)
3. After inserting new events, recompute `fantasy_roster_players.points_scored` for each affected player
4. Recompute `fantasy_rosters.total_points` = sum of player points (captain ×2, vc ×1.5)
5. Recompute ranks within each contest
6. Publish SSE: `cache.publish('fantasy:leaderboard:{contestId}', { updated: true })`

**Settlement** (triggered by admin POST `/settle`):
1. Lock all rosters (`is_locked = true`)
2. Final rank calculation
3. Prize distribution: 1st gets 50%, 2nd gets 30%, 3rd gets 20% of prize pool (for contests with 3+ entries). Edge cases: 1 entry → refund. 2 entries → 60/40 split.
4. Credit winners via `wallets.cashBalance += prize`
5. Set contest `status = 'SETTLED'`

---

## Section 4 — Frontend Pages & Components

### File Map

```
src/pages/
  FantasySports.tsx                    ← lobby: contest cards, sport filter, my teams
  fantasy/
    FantasyDraftRoom.tsx               ← /fantasy/contest/:id — pick players, set captain
    FantasyLeaderboard.tsx             ← /fantasy/leaderboard/:id — live ranked table

src/components/fantasy/
  ContestCard.tsx                      ← lobby card: sport, format badge, prize, deadline countdown
  SportFilter.tsx                      ← Football/Basketball/Cricket pill tabs
  DraftPlayerCard.tsx                  ← player row in the pool: name, pos, salary, proj pts, add button
  DraftSquadPanel.tsx                  ← right panel: my picks, cap tracker, captain selector
  DraftCapBar.tsx                      ← salary cap progress bar + remaining budget
  DraftPositionGrid.tsx                ← pitch/court visual showing selected players by position
  LeaderboardRow.tsx                   ← rank, team name, owner, total pts, rank change arrow
  PlayerScoreBreakdown.tsx             ← expand a roster to see per-player points

src/hooks/
  useFantasyContests.ts                ← TanStack Query: GET /fantasy/contests
  useFantasyDraft.ts                   ← roster state machine: picks, cap, validation, save
  useFantasyLeaderboard.ts             ← SSE for live, 30s poll for settled
  useFantasyPlayers.ts                 ← paginated player pool with filters

src/lib/api/
  fantasy.ts                           ← typed API client for all fantasy endpoints
```

### `FantasySports.tsx` (Lobby)

- Header: "Fantasy Sports" title + "My Teams" badge count
- `SportFilter` pill tabs: All / Football / Basketball / Cricket
- Contest grid (2-col desktop, 1-col mobile): `ContestCard` per contest
- `ContestCard` shows: sport icon, format badge (DAILY green / SEASON blue), contest name, entry fee, prize pool, entries count vs max, deadline countdown, "Join" or "Manage Team" CTA
- My Teams section below: cards for contests user has entered, with current rank + points

### `FantasyDraftRoom.tsx` (`/fantasy/contest/:id`)

Three-panel layout on desktop, stacked on mobile:

**Left — Player Pool**
- Search input + position filter chips + sort dropdown (Salary / Proj Pts / Form)
- Paginated list of `DraftPlayerCard` rows
- Each card: player name, team, position badge, salary, projected pts, form stars (1–5), `+` button (disabled if cap exceeded, position full, or already picked)

**Centre — Squad Visual** (`DraftPositionGrid`)
- Football: pitch layout with 4 rows (GK / DEF / MID / FWD), player slots filled as picked
- Basketball: 5-position court layout (PG/SG/SF/PF/C)
- Cricket: batting/bowling/allrounder/wicketkeeper grid
- Click a filled slot → remove player. Click empty slot → focus player pool filter to that position

**Right — Squad Panel** (`DraftSquadPanel`)
- `DraftCapBar`: salary cap progress bar, `₦XX.XM / ₦100M used`, remaining budget
- Position counts vs limits (GK 1/2, DEF 3/5…)
- Captain / Vice-Captain selector (tap any picked player)
- "Save Team" button — active only when squad is valid (all slots filled, under cap)
- Validation error list below button

### `FantasyLeaderboard.tsx` (`/fantasy/leaderboard/:id`)

- Contest header: name, sport, format, total prize pool
- Live indicator (SSE connected) or "Final" badge
- Rank table: `#rank · Team Name · Owner · Total Pts · ±Change`
- Top 3 highlighted (gold/silver/bronze left border)
- Expand row → `PlayerScoreBreakdown`: per-player points, captain/vc badges, event log

---

## Section 5 — Scoring Rules Per Sport

### Football
| Event | Points |
|-------|--------|
| Goal (FWD) | 6 |
| Goal (MID) | 5 |
| Goal (DEF/GK) | 6 |
| Assist | 3 |
| Clean sheet (GK/DEF) | 6 / 4 |
| Yellow card | -1 |
| Red card | -3 |
| Save (GK, per 3) | 1 |
| Appearance (≥60 min) | 2 |

### Basketball
| Event | Points |
|-------|--------|
| Point scored | 1 |
| Rebound | 1.2 |
| Assist | 1.5 |
| Steal | 3 |
| Block | 3 |
| 3-pointer made | 0.5 bonus |
| Double-double | 3 bonus |
| Triple-double | 5 bonus |
| Turnover | -1 |

### Cricket
| Event | Points |
|-------|--------|
| Run scored | 0.5 |
| Fifty | 8 |
| Hundred | 16 |
| Wicket | 25 |
| Maiden over | 8 |
| Catch | 8 |
| Stumping | 12 |
| Run out | 6 |

Captain gets ×2 points. Vice-captain gets ×1.5 points.

---

## Section 6 — Position Limits Per Sport

### Football (15 players, starting XI + 4 bench)
- GK: exactly 2 (1 starting, 1 bench)
- DEF: 5 (3–5 starting)
- MID: 5 (2–5 starting)
- FWD: 3 (1–3 starting)
- Max 3 players per club

### Basketball (8 players)
- PG: 1–2, SG: 1–2, SF: 1–2, PF: 1–2, C: 1
- Total: exactly 8, no club limit

### Cricket (11 players)
- WK: exactly 1
- BAT: 3–5
- AR: 1–3
- BWL: 3–5
- Max 4 players per team

---

## Section 7 — SSE Leaderboard

`GET /api/fantasy/contests/:id/leaderboard`

When contest status is `LIVE`, the endpoint sends `Content-Type: text/event-stream`. The scoring cron publishes to Redis channel `fantasy:leaderboard:{contestId}` after each scoring pass. The SSE handler subscribes, converts to ranked rows, and streams to connected clients.

When contest is `OPEN` or `SETTLED`, the endpoint returns a normal JSON response. `useFantasyLeaderboard` uses 30s polling in those states.

---

## Section 8 — Prize Distribution

| Entries | Distribution |
|---------|-------------|
| 1 | Full refund |
| 2 | 60% / 40% |
| 3–9 | 50% / 30% / 20% (top 3) |
| 10–49 | Top 20% paid: 1st 35%, 2nd 20%, 3rd 15%, rest split remaining |
| 50+ | Top 25% paid, tiered payout |

Prize credited to `wallets.cashBalance`. Audit log entry created per payout.

---

## Section 9 — Admin Fantasy Panel

New sidebar entry in `AdminSidebar.tsx`: "Fantasy" with `Gamepad2` icon.

`AdminFantasy.tsx` page with three tabs:
- **Contests** — list, create, settle, cancel
- **Players** — player pool management per sport, bulk salary update
- **Scoring** — manual score event entry, ESPN sync status per contest

---

## Non-Goals (explicitly out of scope)
- Trade system between rosters (season-long feature, future)
- Private leagues (invite-only) — future
- Player injury status feed — future
- Mobile push notifications for score events — future
- H2H head-to-head matchups — future
