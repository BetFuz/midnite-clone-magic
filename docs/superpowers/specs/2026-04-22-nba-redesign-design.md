# NBA Page Redesign — Design Spec

**Goal:** Rebuild the NBA page into a betting-forward hub with world-class stats, live play-by-play, real standings with playoff picture, and a simple Same Game Parlay (SGP) builder.

**Architecture:** Tabbed shell (`NBA.tsx`) with three lazy-loaded tab components (`NBAFixtures`, `NBAStandings`, `NBAStats`). SGP state lives in the shell and flows down. All data from ESPN public API (no key required) via new helper functions added to `espn.ts`.

**Tech Stack:** React, TypeScript, TanStack Query, ESPN public API, Recharts (sparklines), react-router-dom, lucide-react, Tailwind CSS.

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/components/basketball/NBAFixtures.tsx` | Fixtures tab — date-grouped game cards, live games float to top |
| `src/components/basketball/NBAStandings.tsx` | Standings tab — East/West tables, playoff picture, leaders |
| `src/components/basketball/NBAStats.tsx` | Stats tab — team rankings table, top 10 leaders, H2H lookup |
| `src/components/basketball/NBAGameCard.tsx` | Single game card — score, ESPN logo, odds row, SGP toggles, play-by-play |
| `src/components/basketball/NBAPlayByPlay.tsx` | Last 3 plays inline strip (live only), expandable |
| `src/components/basketball/NBAOddsRow.tsx` | Moneyline + Spread + O/U buttons with SGP checkboxes |
| `src/hooks/useNBAStandings.ts` | ESPN standings fetch, East/West split, 5-min cache |
| `src/hooks/useNBALeaders.ts` | ESPN season leaders (pts/reb/ast/stl/blk/3PM), 5-min cache |
| `src/hooks/useNBAPlayByPlay.ts` | ESPN play-by-play per game, polls every 10s when live |

### Modified files
| File | Change |
|------|--------|
| `src/pages/basketball/NBA.tsx` | Rewritten as shell: header banner, tab bar, SGP state map, lazy tab loading |
| `src/lib/espn.ts` | Add `fetchNBAStandings()`, `fetchNBALeaders()`, `fetchNBAPlays()` |

---

## Section 1 — NBA.tsx Shell

The shell owns:
- **Tab state**: `"fixtures" | "standings" | "stats"`
- **SGP state**: `Map<gameId, Set<selectionKey>>` passed down to `NBAFixtures` → `NBAGameCard`
- **SGP bundling logic**: when `set.size >= 2`, replaces individual BetSlip entries with a combined parlay entry. Combined odds = product of individual odds. Label: `"SGP — Home vs Away ×N"`. BetSlip shows `⚡ Same Game Parlay` badge with each leg listed underneath.
- **Header banner**: blue-to-red NBA gradient, ESPN logo, live game count badge

Tab components are loaded with `React.lazy` + `Suspense` so only the active tab's code is fetched on first visit.

Scoreboard polling: `useLeagueScoreboard("NBA")` — interval drops to 10s when any `STATUS_IN_PROGRESS` game exists, reverts to 30s when no live games (smart interval via `useEffect` watching live count).

---

## Section 2 — NBAGameCard & Fixtures

### NBAGameCard layout (top to bottom)
1. **Status bar** — date/time for upcoming; `Q3 4:22` with pulsing red dot for live; `FINAL` for completed. Live cards get an orange gradient top border (2px).
2. **Teams + Score** — ESPN CDN team logo (`homeTeam.logo`), team name, conference badge (East/West). Live/final scores in large tabular-nums. Home on top, away below with a `FINAL / Q{n} {clock}` divider line.
3. **Play-by-play strip** (`NBAPlayByPlay`) — visible only when `STATUS_IN_PROGRESS`. Shows last 3 plays with clock and period. Fades older plays. "Show more" expands to last 10 plays.
4. **Odds row** (`NBAOddsRow`) — three market columns: Moneyline (Home/Away), Spread (Home/Away), Over/Under. Each button has a small checkbox overlay. Checking 2+ on the same game activates SGP mode — green `SGP ×N` badge appears on the card header.

### NBAFixtures layout
- Live games float to top of their date group (sorted by `STATUS_IN_PROGRESS` first)
- Date groups: "Today", "Tomorrow", then `"Friday 24 April 2026"`
- 1-column on mobile, 2-column on `md:` and above
- Smart polling: `refetchInterval` set to `10_000` when `liveCount > 0`, else `30_000`

---

## Section 3 — NBAStandings

### Conference tables
East / West sub-toggle within the Standings tab.

Columns: `# · Team · W · L · PCT · GB · L10 · Streak`

Row colour coding by left border:
- Seeds 1–6: green (playoff)
- Seeds 7–8: orange (play-in)
- Seeds 9–10: yellow (play-in bubble)
- Seeds 11–15: no colour

### Playoff picture strip
Horizontal strip below the table. 8 seed pills per conference in order. Seeds 7/8 marked `Play-In`. Derived from standings data — no extra fetch.

### Conference leaders panel
Three columns (stacked on mobile): **Top Scorers**, **Top Rebounders**, **Top Assisters**.
Each shows top 5: player headshot (ESPN CDN), name, team abbreviation, stat value (PPG/RPG/APG).
Data from `useNBALeaders`.

---

## Section 4 — NBAStats

### Team Rankings table
All 30 teams. Columns: `PPG · Opp PPG · RPG · APG · FG% · 3P% · Pace`.
Click column header to sort. Top 5 in each column highlighted green, bottom 5 red.
Data derived from standings/scoreboard (ESPN team stats endpoint).

### Season Leaders cards
Top 10 per category: pts / reb / ast / stl / blk / 3PM.
Each row: headshot, name, team, value, mini sparkline bar (last 5 games trend via Recharts `BarChart`).

### Head-to-head lookup
Two team dropdowns (all 30 NBA teams). On selection, fetches last 5 meetings from ESPN scoreboard history. Shows: date, winner, final score. If no data available, shows "No recent meetings found."

---

## Section 5 — ESPN API Additions (espn.ts)

### `fetchNBAStandings()`
`GET https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings`

Returns: array of teams with `{ rank, team: { name, logo, abbreviation }, wins, losses, pct, gamesBehind, streak, last10 }` split into `east[]` and `west[]`.

### `fetchNBALeaders()`
`GET https://site.api.espn.com/apis/site/v2/sports/basketball/nba/leaders`

Returns: `{ points[], rebounds[], assists[], steals[], blocks[], threePointers[] }` — each entry has `{ athlete: { displayName, headshot, team }, value }`.

### `fetchNBAPlays(eventId)`
`GET https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={eventId}`

Returns: `plays[]` array from `data.plays` (already partially parsed in `fetchMatchDetail` — extract into its own lightweight function). Only called when game is live.

---

## Data Flow

```
NBA.tsx (shell)
  ├── useLeagueScoreboard("NBA")  → smart 10s/30s poll
  ├── sgpMap state                → passed to NBAFixtures → NBAGameCard
  │
  ├── [tab=fixtures]  → NBAFixtures
  │     └── NBAGameCard (per match)
  │           ├── NBAPlayByPlay (useNBAPlayByPlay, live only)
  │           └── NBAOddsRow (SGP toggle callbacks)
  │
  ├── [tab=standings] → NBAStandings
  │     ├── useNBAStandings
  │     └── useNBALeaders
  │
  └── [tab=stats]     → NBAStats
        ├── useNBAStandings (reused, cached)
        └── useNBALeaders (reused, cached)
```

---

## SGP Bundling Logic

```typescript
// In NBA.tsx
type SelectionKey = string; // e.g. "home-ml" | "away-spread" | "over-224.5"
const [sgpMap, setSgpMap] = useState<Map<string, Set<SelectionKey>>>(new Map());

function onSGPToggle(gameId: string, key: SelectionKey, selection: BetSelection) {
  setSgpMap(prev => {
    const next = new Map(prev);
    const set = new Set(next.get(gameId) ?? []);
    if (set.has(key)) {
      set.delete(key);
      removeSingleFromSlip(gameId, key);
    } else {
      set.add(key);
    }
    if (set.size === 0) {
      next.delete(gameId);
      removeGameFromSlip(gameId);
    } else if (set.size === 1) {
      // revert to single
      addSingleToSlip(selection);
      next.set(gameId, set);
    } else {
      // bundle as SGP parlay
      bundleSGP(gameId, set);
      next.set(gameId, set);
    }
    return next;
  });
}
```

Combined odds = `legs.reduce((acc, leg) => acc * leg.odds, 1)`, rounded to 2dp.

---

## Error Handling

- ESPN API failures: each hook returns `{ data, isLoading, isError }` — tabs show a retry button on error, never crash
- Empty data (off-season): Fixtures tab shows "No upcoming NBA games. Check back on opening night." with a basketball icon
- Play-by-play unavailable: `NBAPlayByPlay` renders nothing if plays array is empty (no error state needed)
- SGP odds: if any leg has no odds, SGP badge is hidden and legs are treated as individual bets

---

## Non-Goals (explicitly out of scope)
- Full SGP modal with all player props (future upgrade)
- Player profile pages (tapping leader row does nothing)
- Paid stats API integration (abstraction layer ready, but not wired)
- Push notifications for score changes
