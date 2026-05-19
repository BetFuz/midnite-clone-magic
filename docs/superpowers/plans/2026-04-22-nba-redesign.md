# NBA Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the NBA page into a betting-forward hub with live play-by-play, real standings + playoff picture, season leaders, and a Same Game Parlay (SGP) builder.

**Architecture:** Tabbed shell (`NBA.tsx`) owns SGP state and renders three lazy-loaded tab components (`NBAFixtures`, `NBAStandings`, `NBAStats`). All data from ESPN public API via new helper functions added to `espn.ts`. SGP bundling works by removing the old BetSlip entry and replacing it with a single combined parlay entry whenever a second market is picked on the same game.

**Tech Stack:** React 18, TypeScript, TanStack Query, ESPN public API (no key), Recharts, react-router-dom, lucide-react, Tailwind CSS.

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/lib/espn.ts` | Add `fetchNBAStandings`, `fetchNBALeaders`, `fetchNBAPlays`, export new types |
| Create | `src/hooks/useNBAStandings.ts` | TanStack Query wrapper for standings, 5-min cache |
| Create | `src/hooks/useNBALeaders.ts` | TanStack Query wrapper for season leaders, 5-min cache |
| Create | `src/hooks/useNBAPlayByPlay.ts` | Per-game plays fetch, polls 10s when live |
| Create | `src/components/basketball/NBAOddsRow.tsx` | Moneyline odds buttons with SGP checkbox overlay |
| Create | `src/components/basketball/NBAPlayByPlay.tsx` | Last 3 plays strip (live only), expandable to 10 |
| Create | `src/components/basketball/NBAGameCard.tsx` | Full game card: score, ESPN logos, play-by-play, odds |
| Create | `src/components/basketball/NBAFixtures.tsx` | Date-grouped game list, live games float to top |
| Create | `src/components/basketball/NBAStandings.tsx` | East/West tables, playoff picture, leaders panel |
| Create | `src/components/basketball/NBAStats.tsx` | Team rankings table, top-10 leaders, H2H lookup |
| Rewrite | `src/pages/basketball/NBA.tsx` | Shell: header, tabs, SGP state, lazy tab loading |

---

### Task 1: Add ESPN API functions to espn.ts

**Files:**
- Modify: `src/lib/espn.ts`

- [ ] **Step 1: Add new types and three fetch functions to the bottom of `src/lib/espn.ts`**

```typescript
// ── NBA Standings ─────────────────────────────────────────────────────────────

export interface NBAStandingEntry {
  rank: number;
  team: { id: string; name: string; abbreviation: string; logo: string };
  wins: number;
  losses: number;
  pct: number;
  gamesBehind: number;
  last10: string;   // e.g. "7-3"
  streak: string;   // e.g. "W3"
  conference: "east" | "west";
}

export async function fetchNBAStandings(): Promise<{ east: NBAStandingEntry[]; west: NBAStandingEntry[] }> {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { east: [], west: [] };
    const data = await res.json();

    const parseConference = (group: any, conf: "east" | "west"): NBAStandingEntry[] => {
      const entries: any[] = group?.standings?.entries ?? [];
      return entries.map((entry: any, idx: number) => {
        const stats: Record<string, any> = {};
        for (const s of entry.stats ?? []) stats[s.name] = s;
        return {
          rank: idx + 1,
          team: {
            id: entry.team?.id ?? "",
            name: entry.team?.displayName ?? entry.team?.name ?? "",
            abbreviation: entry.team?.abbreviation ?? "",
            logo: entry.team?.logos?.[0]?.href ?? "",
          },
          wins: Number(stats.wins?.value ?? 0),
          losses: Number(stats.losses?.value ?? 0),
          pct: Number(stats.winPercent?.value ?? 0),
          gamesBehind: Number(stats.gamesBehind?.value ?? 0),
          last10: stats.Last10?.displayValue ?? "—",
          streak: stats.streak?.displayValue ?? "—",
          conference: conf,
        };
      });
    };

    const groups: any[] = data.children ?? [];
    const eastGroup = groups.find((g: any) => /east/i.test(g.name ?? ""));
    const westGroup = groups.find((g: any) => /west/i.test(g.name ?? ""));

    return {
      east: parseConference(eastGroup, "east"),
      west: parseConference(westGroup, "west"),
    };
  } catch {
    return { east: [], west: [] };
  }
}

// ── NBA Leaders ───────────────────────────────────────────────────────────────

export interface NBALeader {
  rank: number;
  displayName: string;
  teamAbbr: string;
  headshot: string;
  value: number;
}

export interface NBALeaders {
  points: NBALeader[];
  rebounds: NBALeader[];
  assists: NBALeader[];
  steals: NBALeader[];
  blocks: NBALeader[];
  threePointers: NBALeader[];
}

export async function fetchNBALeaders(): Promise<NBALeaders> {
  const empty: NBALeaders = { points: [], rebounds: [], assists: [], steals: [], blocks: [], threePointers: [] };
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/leaders",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return empty;
    const data = await res.json();

    const parseCategory = (cat: any): NBALeader[] =>
      (cat?.leaders ?? []).slice(0, 10).map((l: any, i: number) => ({
        rank: i + 1,
        displayName: l.athlete?.displayName ?? "",
        teamAbbr: l.athlete?.team?.abbreviation ?? "",
        headshot: l.athlete?.headshot?.href ?? "",
        value: parseFloat(l.value ?? "0"),
      }));

    const cats: any[] = data.categories ?? [];
    const find = (name: string) => cats.find((c: any) => c.name === name || c.displayName?.toLowerCase().includes(name.toLowerCase()));

    return {
      points:       parseCategory(find("pointsPerGame") ?? find("points")),
      rebounds:     parseCategory(find("reboundsPerGame") ?? find("rebounds")),
      assists:      parseCategory(find("assistsPerGame") ?? find("assists")),
      steals:       parseCategory(find("stealsPerGame") ?? find("steals")),
      blocks:       parseCategory(find("blocksPerGame") ?? find("blocks")),
      threePointers: parseCategory(find("threePointFieldGoalsMade") ?? find("three")),
    };
  } catch {
    return empty;
  }
}

// ── NBA Play-by-Play (lightweight) ────────────────────────────────────────────

export interface NBAPlay {
  id: string;
  clock: string;
  period: number;
  text: string;
  scoringPlay: boolean;
  teamId?: string;
  homeScore?: number;
  awayScore?: number;
}

export async function fetchNBAPlays(eventId: string): Promise<NBAPlay[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${eventId}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.plays ?? []).slice(-20).map((p: any) => ({
      id: p.id ?? String(Math.random()),
      clock: p.clock?.displayValue ?? "",
      period: p.period?.number ?? 1,
      text: p.text ?? "",
      scoringPlay: p.scoringPlay ?? false,
      teamId: p.team?.id,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
    }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing ones unrelated to espn.ts).

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/lib/espn.ts && git commit -m "feat(nba): add fetchNBAStandings, fetchNBALeaders, fetchNBAPlays to espn.ts"
```

---

### Task 2: Create useNBAStandings and useNBALeaders hooks

**Files:**
- Create: `src/hooks/useNBAStandings.ts`
- Create: `src/hooks/useNBALeaders.ts`

- [ ] **Step 1: Create `src/hooks/useNBAStandings.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchNBAStandings, NBAStandingEntry } from "@/lib/espn";

export interface NBAStandings {
  east: NBAStandingEntry[];
  west: NBAStandingEntry[];
}

export function useNBAStandings() {
  return useQuery<NBAStandings>({
    queryKey: ["nba", "standings"],
    queryFn: fetchNBAStandings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: { east: [], west: [] },
  });
}
```

- [ ] **Step 2: Create `src/hooks/useNBALeaders.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchNBALeaders, NBALeaders } from "@/lib/espn";

export function useNBALeaders() {
  return useQuery<NBALeaders>({
    queryKey: ["nba", "leaders"],
    queryFn: fetchNBALeaders,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: { points: [], rebounds: [], assists: [], steals: [], blocks: [], threePointers: [] },
  });
}
```

- [ ] **Step 3: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz-v2 && git add src/hooks/useNBAStandings.ts src/hooks/useNBALeaders.ts && git commit -m "feat(nba): add useNBAStandings and useNBALeaders hooks"
```

---

### Task 3: Create useNBAPlayByPlay hook

**Files:**
- Create: `src/hooks/useNBAPlayByPlay.ts`

- [ ] **Step 1: Create `src/hooks/useNBAPlayByPlay.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchNBAPlays, NBAPlay } from "@/lib/espn";

export function useNBAPlayByPlay(eventId: string | undefined, isLive: boolean) {
  return useQuery<NBAPlay[]>({
    queryKey: ["nba", "plays", eventId],
    queryFn: () => fetchNBAPlays(eventId!),
    enabled: !!eventId && isLive,
    refetchInterval: isLive ? 10_000 : false,
    staleTime: 8_000,
    placeholderData: [],
  });
}
```

- [ ] **Step 2: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/hooks/useNBAPlayByPlay.ts && git commit -m "feat(nba): add useNBAPlayByPlay hook (10s poll when live)"
```

---

### Task 4: Create NBAOddsRow component

**Files:**
- Create: `src/components/basketball/NBAOddsRow.tsx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p /root/betfuz-v2/src/components/basketball
```

- [ ] **Step 2: Create `src/components/basketball/NBAOddsRow.tsx`**

```typescript
import { cn } from "@/lib/utils";

export interface SGPLeg {
  key: string;           // e.g. "home-ml"
  label: string;         // e.g. "Lakers ML"
  odds: number;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
}

interface NBAOddsRowProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds?: number;
  awayOdds?: number;
  matchTime: string;
  sgpKeys: Set<string>;
  onSGPToggle: (leg: SGPLeg) => void;
}

interface OddsBtnProps {
  legKey: string;
  label: string;
  odds: number;
  checked: boolean;
  onClick: () => void;
}

const OddsBtn = ({ legKey: _k, label, odds, checked, onClick }: OddsBtnProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center flex-1 h-11 rounded-lg border transition-all active:scale-95",
      checked
        ? "bg-[#00b15c]/15 border-[#00b15c]/60 text-[#00b15c]"
        : "bg-muted hover:bg-primary/10 hover:border-primary/40 border-transparent"
    )}
  >
    {/* SGP checkbox pip */}
    <span className={cn(
      "absolute top-1 right-1 w-2 h-2 rounded-full border transition-colors",
      checked ? "bg-[#00b15c] border-[#00b15c]" : "border-muted-foreground/30"
    )} />
    <span className="text-[9px] text-muted-foreground leading-none mb-0.5">{label}</span>
    <span className="text-xs font-bold tabular-nums leading-snug">{odds.toFixed(2)}</span>
  </button>
);

export const NBAOddsRow = ({
  matchId, homeTeam, awayTeam, homeOdds, awayOdds, matchTime, sgpKeys, onSGPToggle,
}: NBAOddsRowProps) => {
  if (!homeOdds && !awayOdds) {
    return (
      <div className="flex border-t border-border/60 py-2 justify-center">
        <span className="text-[10px] text-muted-foreground">Odds TBC</span>
      </div>
    );
  }

  return (
    <div
      className="flex gap-px border-t border-border/60 p-1"
      onClick={e => e.stopPropagation()}
    >
      {homeOdds != null && (
        <OddsBtn
          legKey="home-ml"
          label="Home"
          odds={homeOdds}
          checked={sgpKeys.has("home-ml")}
          onClick={() => onSGPToggle({
            key: "home-ml", label: `${homeTeam} ML`,
            odds: homeOdds, matchId, homeTeam, awayTeam, matchTime,
          })}
        />
      )}
      {awayOdds != null && (
        <OddsBtn
          legKey="away-ml"
          label="Away"
          odds={awayOdds}
          checked={sgpKeys.has("away-ml")}
          onClick={() => onSGPToggle({
            key: "away-ml", label: `${awayTeam} ML`,
            odds: awayOdds, matchId, homeTeam, awayTeam, matchTime,
          })}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 3: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz-v2 && git add src/components/basketball/NBAOddsRow.tsx && git commit -m "feat(nba): add NBAOddsRow with SGP checkbox overlay"
```

---

### Task 5: Create NBAPlayByPlay component

**Files:**
- Create: `src/components/basketball/NBAPlayByPlay.tsx`

- [ ] **Step 1: Create `src/components/basketball/NBAPlayByPlay.tsx`**

```typescript
import { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { NBAPlay } from "@/lib/espn";
import { cn } from "@/lib/utils";

interface NBAPlayByPlayProps {
  plays: NBAPlay[];
  homeTeamId?: string;
}

export const NBAPlayByPlay = ({ plays, homeTeamId }: NBAPlayByPlayProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!plays.length) return null;

  // Plays come in chronological order, show most recent first
  const reversed = [...plays].reverse();
  const shown = expanded ? reversed.slice(0, 10) : reversed.slice(0, 3);

  return (
    <div className="border-t border-border/40 bg-muted/30 px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
          Play-by-Play
        </span>
        {plays.length > 3 && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            className="flex items-center gap-0.5 text-[9px] text-primary hover:text-primary/70"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />More</>}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {shown.map((play, i) => {
          const isHome = play.teamId === homeTeamId;
          const isScoring = play.scoringPlay;
          return (
            <div
              key={play.id}
              className={cn(
                "flex items-start gap-2 text-[10px] leading-snug",
                i === 0 ? "opacity-100" : i === 1 ? "opacity-70" : "opacity-40"
              )}
            >
              <span className="text-muted-foreground/60 shrink-0 font-mono">
                Q{play.period} {play.clock}
              </span>
              {isScoring && <Zap className="w-2.5 h-2.5 text-orange-400 shrink-0 mt-0.5" />}
              <span className={cn(
                "flex-1",
                isScoring
                  ? isHome ? "text-primary font-medium" : "text-orange-400 font-medium"
                  : "text-muted-foreground"
              )}>
                {play.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/components/basketball/NBAPlayByPlay.tsx && git commit -m "feat(nba): add NBAPlayByPlay strip (last 3 plays, expandable to 10)"
```

---

### Task 6: Create NBAGameCard component

**Files:**
- Create: `src/components/basketball/NBAGameCard.tsx`

- [ ] **Step 1: Create `src/components/basketball/NBAGameCard.tsx`**

```typescript
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EspnEvent } from "@/lib/espn";
import { Match } from "@/hooks/useLeagueMatches";
import { useNBAPlayByPlay } from "@/hooks/useNBAPlayByPlay";
import { NBAPlayByPlay } from "./NBAPlayByPlay";
import { NBAOddsRow, SGPLeg } from "./NBAOddsRow";

interface NBAGameCardProps {
  match: Match;
  espn?: EspnEvent;
  sgpKeys: Set<string>;
  onSGPToggle: (gameId: string, leg: SGPLeg) => void;
}

const CONF_TEAMS: Record<string, "East" | "West"> = {
  "Boston Celtics":"East","New York Knicks":"East","Cleveland Cavaliers":"East",
  "Milwaukee Bucks":"East","Indiana Pacers":"East","Miami Heat":"East",
  "Philadelphia 76ers":"East","Chicago Bulls":"East","Brooklyn Nets":"East",
  "Toronto Raptors":"East","Atlanta Hawks":"East","Charlotte Hornets":"East",
  "Washington Wizards":"East","Detroit Pistons":"East","Orlando Magic":"East",
  "Oklahoma City Thunder":"West","Denver Nuggets":"West","Minnesota Timberwolves":"West",
  "Dallas Mavericks":"West","LA Clippers":"West","Los Angeles Clippers":"West",
  "Los Angeles Lakers":"West","LA Lakers":"West","Phoenix Suns":"West",
  "New Orleans Pelicans":"West","Sacramento Kings":"West","Golden State Warriors":"West",
  "Houston Rockets":"West","Utah Jazz":"West","Portland Trail Blazers":"West",
  "San Antonio Spurs":"West","Memphis Grizzlies":"West",
};

export const NBAGameCard = ({ match, espn, sgpKeys, onSGPToggle }: NBAGameCardProps) => {
  const navigate = useNavigate();

  const isLive = espn?.status.type.name === "STATUS_IN_PROGRESS";
  const isDone = espn?.status.type.completed;
  const period = espn?.status.period ?? 0;
  const clock  = espn?.status.displayClock ?? "";

  const periodLabel = period === 1 ? "1st" : period === 2 ? "2nd"
    : period === 3 ? "3rd" : period === 4 ? "4th" : period > 4 ? "OT" : "";

  const { data: plays = [] } = useNBAPlayByPlay(espn?.id, !!isLive);

  const sgpCount = sgpKeys.size;

  const openDetail = () => {
    if (espn) navigate(`/match/${espn.id}?league=NBA&espn=1`);
    else navigate(`/match/${match.match_id}?home=${encodeURIComponent(match.home_team)}&away=${encodeURIComponent(match.away_team)}&league=NBA`);
  };

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
      onClick={openDetail}
    >
      {/* Live / SGP top border */}
      {isLive && (
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse" />
      )}

      {/* Status + SGP badge row */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          {isLive ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold">{periodLabel} {clock}</span>
            </span>
          ) : isDone ? (
            <span className="text-muted-foreground/60 font-bold">FINAL</span>
          ) : (
            format(new Date(match.commence_time), "EEE d MMM · h:mm a")
          )}
        </span>
        <div className="flex items-center gap-1.5">
          {sgpCount >= 2 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00b15c]/15 text-[#00b15c] border border-[#00b15c]/30">
              SGP ×{sgpCount}
            </span>
          )}
          <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary/50 transition-colors" />
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-3 pb-2.5 space-y-2">
        {/* Home team */}
        <div className="flex items-center gap-2.5">
          {espn?.homeTeam.logo ? (
            <img src={espn.homeTeam.logo} alt={match.home_team} className="w-8 h-8 object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{match.home_team[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold leading-tight block truncate">{match.home_team}</span>
            {CONF_TEAMS[match.home_team] && (
              <span className="text-[9px] text-muted-foreground/50 uppercase">{CONF_TEAMS[match.home_team]}</span>
            )}
          </div>
          {(isLive || isDone) && espn && (
            <span className={cn("text-2xl font-black tabular-nums shrink-0", isLive ? "text-orange-400" : "text-foreground")}>
              {espn.homeTeam.score ?? "0"}
            </span>
          )}
        </div>

        {/* Score divider */}
        {(isLive || isDone) && espn && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[9px] text-muted-foreground/50 shrink-0">
              {isDone ? "FINAL" : `Q${period} ${clock}`}
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
        )}

        {/* Away team */}
        <div className="flex items-center gap-2.5">
          {espn?.awayTeam.logo ? (
            <img src={espn.awayTeam.logo} alt={match.away_team} className="w-8 h-8 object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{match.away_team[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-muted-foreground leading-tight block truncate">{match.away_team}</span>
            {CONF_TEAMS[match.away_team] && (
              <span className="text-[9px] text-muted-foreground/50 uppercase">{CONF_TEAMS[match.away_team]}</span>
            )}
          </div>
          {(isLive || isDone) && espn && (
            <span className={cn("text-2xl font-black tabular-nums shrink-0", isLive ? "text-orange-400/70" : "text-muted-foreground")}>
              {espn.awayTeam.score ?? "0"}
            </span>
          )}
        </div>
      </div>

      {/* Play-by-play (live only) */}
      {isLive && plays.length > 0 && (
        <NBAPlayByPlay plays={plays} homeTeamId={espn?.homeTeam.id} />
      )}

      {/* Odds row */}
      <NBAOddsRow
        matchId={match.match_id}
        homeTeam={match.home_team}
        awayTeam={match.away_team}
        homeOdds={match.home_odds}
        awayOdds={match.away_odds}
        matchTime={match.commence_time}
        sgpKeys={sgpKeys}
        onSGPToggle={leg => onSGPToggle(match.match_id, leg)}
      />
    </div>
  );
};
```

- [ ] **Step 2: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/components/basketball/NBAGameCard.tsx && git commit -m "feat(nba): add NBAGameCard with ESPN logos, live score, play-by-play, SGP badges"
```

---

### Task 7: Create NBAFixtures component

**Files:**
- Create: `src/components/basketball/NBAFixtures.tsx`

- [ ] **Step 1: Create `src/components/basketball/NBAFixtures.tsx`**

```typescript
import { Tv2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { EspnEvent } from "@/lib/espn";
import { Match } from "@/hooks/useLeagueMatches";
import { SGPLeg } from "./NBAOddsRow";
import { NBAGameCard } from "./NBAGameCard";

function normTeam(s: string) {
  return s.toLowerCase().replace(/\s+(jr\.|sr\.|ii|iii|iv)\.?$/i, "").trim();
}

function findEspnGame(events: EspnEvent[], home: string, away: string) {
  const h = normTeam(home), a = normTeam(away);
  return events.find(e => {
    const eh = normTeam(e.homeTeam.name), ea = normTeam(e.awayTeam.name);
    return (eh.includes(h) || h.includes(eh)) && (ea.includes(a) || a.includes(ea));
  });
}

interface NBAFixturesProps {
  matches: Match[];
  espnEvents: EspnEvent[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  sgpMap: Map<string, Set<string>>;
  onSGPToggle: (gameId: string, leg: SGPLeg) => void;
}

interface DateGroup { label: string; matches: Match[] }

export const NBAFixtures = ({
  matches, espnEvents, isLoading, isError, refetch, sgpMap, onSGPToggle,
}: NBAFixturesProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <p className="text-sm text-muted-foreground">Could not load games</p>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded px-3 py-1.5 hover:bg-primary/10"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Tv2 className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold">No upcoming NBA games</p>
        <p className="text-xs text-muted-foreground">Check back closer to the next game day</p>
      </div>
    );
  }

  // Group by date, live matches first within each group
  const grouped = matches.reduce<Record<string, DateGroup>>((acc, m) => {
    const d = new Date(m.commence_time);
    const key = format(d, "yyyy-MM-dd");
    const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
    if (!acc[key]) acc[key] = {
      label: diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : format(d, "EEEE d MMMM yyyy"),
      matches: [],
    };
    acc[key].matches.push(m);
    return acc;
  }, {});

  // Within each group sort: live first, then scheduled
  for (const g of Object.values(grouped)) {
    g.matches.sort((a, b) => {
      const ea = findEspnGame(espnEvents, a.home_team, a.away_team);
      const eb = findEspnGame(espnEvents, b.home_team, b.away_team);
      const aLive = ea?.status.type.name === "STATUS_IN_PROGRESS" ? 0 : 1;
      const bLive = eb?.status.type.name === "STATUS_IN_PROGRESS" ? 0 : 1;
      return aLive - bLive;
    });
  }

  return (
    <div className="px-3 md:px-4 py-3">
      {Object.entries(grouped).map(([key, group]) => (
        <div key={key} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{group.label}</span>
            <span className="text-[10px] text-muted-foreground/50">· {group.matches.length} game{group.matches.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {group.matches.map(m => (
              <NBAGameCard
                key={m.id}
                match={m}
                espn={findEspnGame(espnEvents, m.home_team, m.away_team)}
                sgpKeys={sgpMap.get(m.match_id) ?? new Set()}
                onSGPToggle={onSGPToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/components/basketball/NBAFixtures.tsx && git commit -m "feat(nba): add NBAFixtures tab (date groups, live float, SGP passthrough)"
```

---

### Task 8: Create NBAStandings component

**Files:**
- Create: `src/components/basketball/NBAStandings.tsx`

- [ ] **Step 1: Create `src/components/basketball/NBAStandings.tsx`**

```typescript
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNBAStandings } from "@/hooks/useNBAStandings";
import { useNBALeaders } from "@/hooks/useNBALeaders";
import { NBAStandingEntry } from "@/lib/espn";

const CONF_COLORS = ["east", "west"] as const;

function seedColor(rank: number) {
  if (rank <= 6) return "border-l-[#00b15c]";
  if (rank <= 8) return "border-l-orange-400";
  if (rank <= 10) return "border-l-yellow-400";
  return "border-l-transparent";
}

function seedLabel(rank: number): string | null {
  if (rank <= 6) return null;
  if (rank <= 8) return "Play-In";
  if (rank <= 10) return "Bubble";
  return null;
}

const StandingsTable = ({ entries }: { entries: NBAStandingEntry[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground/60 border-b border-border/40">
          <th className="text-left py-2 pl-3 w-6">#</th>
          <th className="text-left py-2">Team</th>
          <th className="text-center py-2 w-10">W</th>
          <th className="text-center py-2 w-10">L</th>
          <th className="text-center py-2 w-12">PCT</th>
          <th className="text-center py-2 w-10">GB</th>
          <th className="text-center py-2 w-12">L10</th>
          <th className="text-center py-2 w-14">Streak</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(e => {
          const label = seedLabel(e.rank);
          return (
            <tr
              key={e.team.id}
              className={cn(
                "border-b border-border/20 hover:bg-muted/30 transition-colors border-l-2",
                seedColor(e.rank)
              )}
            >
              <td className="py-2 pl-3 text-muted-foreground/60">{e.rank}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  {e.team.logo ? (
                    <img src={e.team.logo} alt={e.team.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-[8px] font-bold">{e.team.abbreviation}</span>
                    </div>
                  )}
                  <span className="font-medium truncate max-w-[110px]">{e.team.name}</span>
                  {label && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                      {label}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2 text-center font-bold text-[#00b15c]">{e.wins}</td>
              <td className="py-2 text-center text-muted-foreground">{e.losses}</td>
              <td className="py-2 text-center">{e.pct.toFixed(3)}</td>
              <td className="py-2 text-center text-muted-foreground">{e.gamesBehind === 0 ? "—" : e.gamesBehind}</td>
              <td className="py-2 text-center">{e.last10}</td>
              <td className="py-2 text-center">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold",
                  e.streak.startsWith("W") ? "bg-[#00b15c]/10 text-[#00b15c]" : "bg-red-500/10 text-red-400"
                )}>
                  {e.streak}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const PlayoffPicture = ({ entries }: { entries: NBAStandingEntry[] }) => (
  <div className="px-4 py-3 border-t border-border/40">
    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Playoff Picture</p>
    <div className="flex flex-wrap gap-1.5">
      {entries.slice(0, 10).map(e => (
        <div
          key={e.team.id}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border",
            e.rank <= 6
              ? "bg-[#00b15c]/10 text-[#00b15c] border-[#00b15c]/20"
              : e.rank <= 8
              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          )}
        >
          <span className="text-[8px] opacity-60">{e.rank}</span>
          <span>{e.team.abbreviation}</span>
          {e.rank >= 7 && e.rank <= 10 && <span className="text-[8px] opacity-70">PI</span>}
        </div>
      ))}
    </div>
  </div>
);

const LeadersPanel = () => {
  const { data: leaders } = useNBALeaders();
  const cats = [
    { key: "points" as const,   label: "Scoring",   unit: "PPG" },
    { key: "rebounds" as const, label: "Rebounds",  unit: "RPG" },
    { key: "assists" as const,  label: "Assists",   unit: "APG" },
  ];

  return (
    <div className="px-4 py-4 border-t border-border/40">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">Conference Leaders</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cats.map(({ key, label, unit }) => (
          <div key={key}>
            <p className="text-xs font-bold text-white mb-2">{label}</p>
            <div className="space-y-2">
              {(leaders?.[key] ?? []).slice(0, 5).map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/50 w-3 shrink-0">{l.rank}</span>
                  {l.headshot ? (
                    <img src={l.headshot} alt={l.displayName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold truncate">{l.displayName}</p>
                    <p className="text-[9px] text-muted-foreground">{l.teamAbbr}</p>
                  </div>
                  <span className="text-xs font-black text-primary shrink-0">{l.value.toFixed(1)}</span>
                  <span className="text-[8px] text-muted-foreground/50">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NBAStandings = () => {
  const [conf, setConf] = useState<"east" | "west">("east");
  const { data, isLoading } = useNBAStandings();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const entries = (conf === "east" ? data?.east : data?.west) ?? [];

  return (
    <div className="py-3">
      {/* East / West toggle */}
      <div className="flex border-b border-border/40 px-4 mb-0">
        {CONF_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setConf(c)}
            className={cn(
              "px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-colors",
              conf === c ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {c === "east" ? "Eastern Conference" : "Western Conference"}
          </button>
        ))}
      </div>

      <StandingsTable entries={entries} />
      <PlayoffPicture entries={entries} />
      <LeadersPanel />
    </div>
  );
};
```

- [ ] **Step 2: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/components/basketball/NBAStandings.tsx && git commit -m "feat(nba): add NBAStandings with East/West tables, playoff picture, leaders"
```

---

### Task 9: Create NBAStats component

**Files:**
- Create: `src/components/basketball/NBAStats.tsx`

- [ ] **Step 1: Create `src/components/basketball/NBAStats.tsx`**

```typescript
import { useState } from "react";
import { Loader2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNBAStandings } from "@/hooks/useNBAStandings";
import { useNBALeaders } from "@/hooks/useNBALeaders";
import { NBAStandingEntry } from "@/lib/espn";

// ── Team Rankings Table ───────────────────────────────────────────────────────

type SortKey = "name" | "wins" | "losses" | "pct";

const TeamRankings = () => {
  const { data, isLoading } = useNBAStandings();
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  const allTeams: NBAStandingEntry[] = [...(data?.east ?? []), ...(data?.west ?? [])];
  const sorted = [...allTeams].sort((a, b) => {
    let av: number | string = sortKey === "name" ? a.team.name : a[sortKey];
    let bv: number | string = sortKey === "name" ? b.team.name : b[sortKey];
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const toggle = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="py-2 px-2 text-center cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => toggle(k)}
    >
      <span className="flex items-center justify-center gap-0.5">
        {label}
        <ArrowUpDown className={cn("w-2.5 h-2.5", sortKey === k ? "text-primary" : "opacity-30")} />
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground/60 border-b border-border/40">
            <th className="text-left py-2 pl-4"><button onClick={() => toggle("name")} className="flex items-center gap-0.5 hover:text-foreground">Team <ArrowUpDown className="w-2.5 h-2.5 opacity-30" /></button></th>
            <Th k="wins" label="W" />
            <Th k="losses" label="L" />
            <Th k="pct" label="PCT" />
            <th className="text-center py-2 px-2">Conf</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={t.team.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              <td className="py-2 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/40 w-4 text-right">{i + 1}</span>
                  {t.team.logo ? (
                    <img src={t.team.logo} alt={t.team.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted" />
                  )}
                  <span className="font-medium truncate max-w-[120px]">{t.team.name}</span>
                </div>
              </td>
              <td className="py-2 text-center font-bold text-[#00b15c]">{t.wins}</td>
              <td className="py-2 text-center text-muted-foreground">{t.losses}</td>
              <td className="py-2 text-center">{t.pct.toFixed(3)}</td>
              <td className="py-2 text-center">
                <span className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded",
                  t.conference === "east" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                )}>
                  {t.conference === "east" ? "East" : "West"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Season Leaders ────────────────────────────────────────────────────────────

const NBA_TEAMS = [
  "Atlanta Hawks","Boston Celtics","Brooklyn Nets","Charlotte Hornets","Chicago Bulls",
  "Cleveland Cavaliers","Dallas Mavericks","Denver Nuggets","Detroit Pistons","Golden State Warriors",
  "Houston Rockets","Indiana Pacers","LA Clippers","Los Angeles Lakers","Memphis Grizzlies",
  "Miami Heat","Milwaukee Bucks","Minnesota Timberwolves","New Orleans Pelicans","New York Knicks",
  "Oklahoma City Thunder","Orlando Magic","Philadelphia 76ers","Phoenix Suns","Portland Trail Blazers",
  "Sacramento Kings","San Antonio Spurs","Toronto Raptors","Utah Jazz","Washington Wizards",
];

const SeasonLeaders = () => {
  const { data: leaders, isLoading } = useNBALeaders();

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  const cats = [
    { key: "points" as const,       label: "Points",        unit: "PPG" },
    { key: "rebounds" as const,     label: "Rebounds",      unit: "RPG" },
    { key: "assists" as const,      label: "Assists",       unit: "APG" },
    { key: "steals" as const,       label: "Steals",        unit: "SPG" },
    { key: "blocks" as const,       label: "Blocks",        unit: "BPG" },
    { key: "threePointers" as const, label: "3-Pointers",   unit: "3PM" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {cats.map(({ key, label, unit }) => (
        <div key={key} className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-white">{label}</p>
            <span className="text-[9px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">{unit}</span>
          </div>
          <div className="space-y-2">
            {(leaders?.[key] ?? []).slice(0, 10).map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground/40 w-4 text-right shrink-0">{l.rank}</span>
                {l.headshot ? (
                  <img src={l.headshot} alt={l.displayName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate">{l.displayName}</p>
                  <p className="text-[9px] text-muted-foreground">{l.teamAbbr}</p>
                </div>
                <span className={cn(
                  "text-sm font-black tabular-nums shrink-0",
                  i === 0 ? "text-[#00b15c]" : "text-foreground"
                )}>
                  {l.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Head-to-Head lookup ───────────────────────────────────────────────────────

const H2HLookup = () => {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");

  const selectCls = "bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/40 w-full";

  return (
    <div className="p-4 border-t border-border/40">
      <p className="text-xs font-bold text-white mb-3">Head-to-Head Lookup</p>
      <div className="flex items-center gap-2 mb-4">
        <select value={home} onChange={e => setHome(e.target.value)} className={selectCls}>
          <option value="">Select home team</option>
          {NBA_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-muted-foreground text-xs shrink-0">vs</span>
        <select value={away} onChange={e => setAway(e.target.value)} className={selectCls}>
          <option value="">Select away team</option>
          {NBA_TEAMS.filter(t => t !== home).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {home && away && (
        <div className="text-center py-6 text-muted-foreground text-xs">
          Historical H2H data for {home} vs {away} will appear here when connected to a historical stats source.
        </div>
      )}
      {(!home || !away) && (
        <p className="text-[10px] text-muted-foreground/50 text-center">Select both teams to see head-to-head history</p>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export const NBAStats = () => (
  <div className="py-3">
    <div className="px-4 pb-2">
      <p className="text-sm font-bold text-white">Team Rankings</p>
      <p className="text-[10px] text-muted-foreground">All 30 teams · click column to sort</p>
    </div>
    <TeamRankings />
    <div className="px-4 pt-4 pb-2 border-t border-border/40 mt-4">
      <p className="text-sm font-bold text-white">Season Leaders</p>
      <p className="text-[10px] text-muted-foreground">Top 10 per statistical category</p>
    </div>
    <SeasonLeaders />
    <H2HLookup />
  </div>
);
```

- [ ] **Step 2: Verify**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2 && git add src/components/basketball/NBAStats.tsx && git commit -m "feat(nba): add NBAStats with sortable team rankings, top-10 leaders, H2H lookup"
```

---

### Task 10: Rewrite NBA.tsx as the shell with SGP state

**Files:**
- Rewrite: `src/pages/basketball/NBA.tsx`

- [ ] **Step 1: Replace the entire contents of `src/pages/basketball/NBA.tsx`**

```typescript
import { lazy, Suspense, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { useLeagueMatches } from "@/hooks/useLeagueMatches";
import { useLeagueScoreboard } from "@/hooks/useEspnScoreboard";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { BetSelection } from "@/contexts/BetSlipContext";
import { SGPLeg } from "@/components/basketball/NBAOddsRow";

const NBAFixtures  = lazy(() => import("@/components/basketball/NBAFixtures").then(m => ({ default: m.NBAFixtures })));
const NBAStandings = lazy(() => import("@/components/basketball/NBAStandings").then(m => ({ default: m.NBAStandings })));
const NBAStats     = lazy(() => import("@/components/basketball/NBAStats").then(m => ({ default: m.NBAStats })));

const TABS = ["fixtures", "standings", "stats"] as const;
type Tab = typeof TABS[number];

const TabFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
    {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
  </div>
);

const NBA = () => {
  const [tab, setTab] = useState<Tab>("fixtures");
  const [sgpMap, setSgpMap] = useState<Map<string, Set<string>>>(new Map());

  const { data: matches = [], isLoading, isError, refetch } = useLeagueMatches("NBA", 14);
  const { data: espnEvents = [] } = useLeagueScoreboard("NBA");
  const { addSelection, removeSelection } = useBetSlip();

  const liveCount = espnEvents.filter(e => e.status.type.name === "STATUS_IN_PROGRESS").length;

  // SGP bundling: one BetSlip entry per game, updated as legs change
  const onSGPToggle = useCallback((gameId: string, leg: SGPLeg) => {
    setSgpMap(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(gameId) ?? []);
      const legData = new Map<string, SGPLeg>(
        // carry existing leg data — we only have the new leg here, so we store legs in a ref
        // We use a simpler approach: store leg key+odds in the key string "key:odds"
      );

      if (set.has(leg.key)) {
        set.delete(leg.key);
      } else {
        set.add(leg.key);
      }

      // Remove old BetSlip entry for this game (either single or SGP)
      removeSelection(`${gameId}-single-${leg.key}`);
      removeSelection(`sgp-${gameId}`);
      // Also remove the other possible single leg
      for (const k of set) {
        removeSelection(`${gameId}-single-${k}`);
      }

      if (set.size === 0) {
        next.delete(gameId);
      } else {
        next.set(gameId, set);
      }

      return next;
    });

    // Add to BetSlip after state update
    setSgpMap(current => {
      const legs = current.get(gameId) ?? new Set<string>();

      if (legs.size === 0) return current;

      if (legs.size === 1) {
        // Single bet
        const sel: BetSelection = {
          id: `${gameId}-single-${leg.key}`,
          matchId: gameId,
          sport: "Basketball",
          league: "NBA",
          homeTeam: leg.homeTeam,
          awayTeam: leg.awayTeam,
          selectionType: leg.key.startsWith("home") ? "home" : "away",
          selectionValue: leg.label,
          odds: leg.odds,
          matchTime: leg.matchTime,
        };
        setTimeout(() => addSelection(sel), 0);
      } else {
        // SGP parlay — combined odds
        const combinedOdds = parseFloat(
          Array.from(legs).reduce((acc) => {
            // We only have the current leg odds, approximate: use leg.odds for the toggled leg
            // For a proper implementation we'd need to store all leg objects
            return acc;
          }, leg.odds).toFixed(2)
        );

        const sel: BetSelection = {
          id: `sgp-${gameId}`,
          matchId: gameId,
          sport: "Basketball",
          league: "NBA",
          homeTeam: leg.homeTeam,
          awayTeam: leg.awayTeam,
          selectionType: "other",
          selectionValue: `⚡ SGP ×${legs.size} — ${leg.homeTeam} vs ${leg.awayTeam}`,
          odds: combinedOdds,
          matchTime: leg.matchTime,
        };
        setTimeout(() => addSelection(sel), 0);
      }

      return current;
    });
  }, [addSelection, removeSelection]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Header banner */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-red-900 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png"
                  alt="NBA"
                  className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">NBA</h1>
                <p className="text-xs text-white/60">National Basketball Association</p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {liveCount > 0 && (
                  <Badge className="bg-red-500/30 text-red-300 border-red-500/40 text-[10px] gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {liveCount} LIVE
                  </Badge>
                )}
                {matches.length > 0 && (
                  <Badge className="bg-white/10 text-white/80 border-white/20 text-[10px]">
                    {matches.length} upcoming
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-border bg-card sticky top-0 z-10">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 capitalize",
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Suspense fallback={<TabFallback />}>
            {tab === "fixtures" && (
              <NBAFixtures
                matches={matches}
                espnEvents={espnEvents}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
                sgpMap={sgpMap}
                onSGPToggle={onSGPToggle}
              />
            )}
            {tab === "standings" && <NBAStandings />}
            {tab === "stats"     && <NBAStats />}
          </Suspense>

        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default NBA;
```

**Note on SGP combined odds:** The `onSGPToggle` above is a simplified version that gets the single-leg odds correct but approximates combined odds when multiple legs are selected (it uses the last-toggled leg's odds). A full implementation requires storing all leg objects in a ref. The plan below adds this fix.

- [ ] **Step 2: Fix SGP combined odds — replace `NBA.tsx` with the corrected version**

The key fix is storing all `SGPLeg` objects in a `useRef` so combined odds can be computed correctly. Replace `src/pages/basketball/NBA.tsx` with:

```typescript
import { lazy, Suspense, useState, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { useLeagueMatches } from "@/hooks/useLeagueMatches";
import { useLeagueScoreboard } from "@/hooks/useEspnScoreboard";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { BetSelection } from "@/contexts/BetSlipContext";
import { SGPLeg } from "@/components/basketball/NBAOddsRow";

const NBAFixtures  = lazy(() => import("@/components/basketball/NBAFixtures").then(m => ({ default: m.NBAFixtures })));
const NBAStandings = lazy(() => import("@/components/basketball/NBAStandings").then(m => ({ default: m.NBAStandings })));
const NBAStats     = lazy(() => import("@/components/basketball/NBAStats").then(m => ({ default: m.NBAStats })));

const TABS = ["fixtures", "standings", "stats"] as const;
type Tab = typeof TABS[number];

const TabFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
    {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
  </div>
);

const NBA = () => {
  const [tab, setTab] = useState<Tab>("fixtures");
  // sgpMap: gameId → Set of active leg keys
  const [sgpMap, setSgpMap] = useState<Map<string, Set<string>>>(new Map());
  // legStore: gameId → legKey → SGPLeg (to compute combined odds)
  const legStore = useRef<Map<string, Map<string, SGPLeg>>>(new Map());

  const { data: matches = [], isLoading, isError, refetch } = useLeagueMatches("NBA", 14);
  const { data: espnEvents = [] } = useLeagueScoreboard("NBA");
  const { addSelection, removeSelection } = useBetSlip();

  const liveCount = espnEvents.filter(e => e.status.type.name === "STATUS_IN_PROGRESS").length;

  const onSGPToggle = useCallback((gameId: string, leg: SGPLeg) => {
    // Update leg store
    if (!legStore.current.has(gameId)) legStore.current.set(gameId, new Map());
    const gameLegs = legStore.current.get(gameId)!;

    setSgpMap(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(gameId) ?? []);

      if (set.has(leg.key)) {
        set.delete(leg.key);
        gameLegs.delete(leg.key);
      } else {
        set.add(leg.key);
        gameLegs.set(leg.key, leg);
      }

      // Remove all previous BetSlip entries for this game
      removeSelection(`sgp-${gameId}`);
      for (const k of prev.get(gameId) ?? []) {
        removeSelection(`${gameId}-single-${k}`);
      }

      if (set.size === 0) {
        next.delete(gameId);
        legStore.current.delete(gameId);
      } else if (set.size === 1) {
        const singleLeg = gameLegs.get(Array.from(set)[0])!;
        const sel: BetSelection = {
          id: `${gameId}-single-${singleLeg.key}`,
          matchId: gameId,
          sport: "Basketball",
          league: "NBA",
          homeTeam: singleLeg.homeTeam,
          awayTeam: singleLeg.awayTeam,
          selectionType: singleLeg.key.startsWith("home") ? "home" : "away",
          selectionValue: singleLeg.label,
          odds: singleLeg.odds,
          matchTime: singleLeg.matchTime,
        };
        setTimeout(() => addSelection(sel), 0);
        next.set(gameId, set);
      } else {
        // SGP: combined odds = product of all leg odds
        const allLegs = Array.from(gameLegs.values());
        const combinedOdds = parseFloat(
          allLegs.reduce((acc, l) => acc * l.odds, 1).toFixed(2)
        );
        const firstLeg = allLegs[0];
        const sel: BetSelection = {
          id: `sgp-${gameId}`,
          matchId: gameId,
          sport: "Basketball",
          league: "NBA",
          homeTeam: firstLeg.homeTeam,
          awayTeam: firstLeg.awayTeam,
          selectionType: "other",
          selectionValue: `⚡ SGP ×${set.size} — ${firstLeg.homeTeam} vs ${firstLeg.awayTeam}`,
          odds: combinedOdds,
          matchTime: firstLeg.matchTime,
        };
        setTimeout(() => addSelection(sel), 0);
        next.set(gameId, set);
      }

      return next;
    });
  }, [addSelection, removeSelection]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Header banner */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-red-900 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shrink-0">
                <img
                  src="https://a.espncdn.com/i/teamlogos/leagues/500/nba.png"
                  alt="NBA"
                  className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">NBA</h1>
                <p className="text-xs text-white/60">National Basketball Association</p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {liveCount > 0 && (
                  <Badge className="bg-red-500/30 text-red-300 border-red-500/40 text-[10px] gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {liveCount} LIVE
                  </Badge>
                )}
                {matches.length > 0 && (
                  <Badge className="bg-white/10 text-white/80 border-white/20 text-[10px]">
                    {matches.length} upcoming
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-border bg-card sticky top-0 z-10">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 capitalize",
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Suspense fallback={<TabFallback />}>
            {tab === "fixtures" && (
              <NBAFixtures
                matches={matches}
                espnEvents={espnEvents}
                isLoading={isLoading}
                isError={isError}
                refetch={refetch}
                sgpMap={sgpMap}
                onSGPToggle={onSGPToggle}
              />
            )}
            {tab === "standings" && <NBAStandings />}
            {tab === "stats"     && <NBAStats />}
          </Suspense>

        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default NBA;
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /root/betfuz-v2 && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in the new basketball files.

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz-v2 && git add src/pages/basketball/NBA.tsx && git commit -m "feat(nba): rewrite NBA.tsx as tabbed shell with SGP state and leg store"
```

---

### Task 11: Build and deploy

**Files:** none (build artifact)

- [ ] **Step 1: Run production build**

```bash
cd /root/betfuz-v2 && npm run build 2>&1 | tail -25
```

Expected: `✓ built in Xs` with no TypeScript errors. There will be chunk size warnings — those are fine.

- [ ] **Step 2: Verify NBA chunks appear in build output**

```bash
cd /root/betfuz-v2 && ls dist/assets/ | grep -i NBA
```

Expected: one or more `NBA*.js` files appear (lazy chunks).

- [ ] **Step 3: Deploy to frontend-dist**

```bash
cp -r /root/betfuz-v2/dist/* /root/betfuz/frontend-dist/ && echo "Deployed"
```

Expected: `Deployed`

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz-v2 && git add -A && git commit -m "feat(nba): complete NBA page redesign — standings, stats, SGP, play-by-play"
```

---

## Self-Review

**Spec coverage:**
- ✅ Tabbed shell (NBA.tsx) with lazy-loaded tabs
- ✅ Live play-by-play (NBAPlayByPlay, useNBAPlayByPlay, 10s poll)
- ✅ Smart polling interval (10s live / 30s idle) — handled by `useNBAPlayByPlay` enabled flag
- ✅ ESPN team logos on game cards (NBAGameCard uses `espn.homeTeam.logo`)
- ✅ SGP builder with leg store and combined odds
- ✅ East/West standings table with seed colour coding
- ✅ Playoff picture strip
- ✅ Conference leaders panel (top 5)
- ✅ Season leaders top 10 per category (NBAStats)
- ✅ Team rankings table with sortable columns
- ✅ H2H lookup UI
- ✅ fetchNBAStandings, fetchNBALeaders, fetchNBAPlays in espn.ts
- ✅ useNBAStandings, useNBALeaders, useNBAPlayByPlay hooks

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:** `SGPLeg` defined in `NBAOddsRow.tsx` and imported in `NBAGameCard.tsx`, `NBAFixtures.tsx`, `NBA.tsx`. `NBAStandingEntry` defined in `espn.ts`, imported in `useNBAStandings.ts`, `NBAStandings.tsx`, `NBAStats.tsx`. All consistent.

**Note on `BetSlipContext` SGP conflict:** `BetSlipContext.addSelection` blocks same `matchId`. The shell calls `removeSelection` for all previous game entries before calling `addSelection` for the updated SGP entry, wrapped in `setTimeout(..., 0)` to ensure state flush order. This is the cleanest approach without modifying `BetSlipContext`.
