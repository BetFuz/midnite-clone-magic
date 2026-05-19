// ESPN public API — no key required, CORS-open
const SOCCER_BASE      = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const BASKETBALL_BASE  = "https://site.api.espn.com/apis/site/v2/sports/basketball";
const BASE = SOCCER_BASE; // kept for soccer helpers

// Leagues that use a non-soccer base URL: "sport:slug" format
const SPORT_OVERRIDES: Record<string, { base: string; slug: string }> = {
  "NBA":         { base: BASKETBALL_BASE, slug: "nba" },
  "WNBA":        { base: BASKETBALL_BASE, slug: "wnba" },
  "EuroLeague":  { base: BASKETBALL_BASE, slug: "mens-college-basketball" },
};

function leagueUrl(leagueName: string, leagueSlug: string, path: string): string {
  const override = SPORT_OVERRIDES[leagueName];
  if (override) return `${override.base}/${override.slug}/${path}`;
  return `${SOCCER_BASE}/${leagueSlug}/${path}`;
}

export const ESPN_LEAGUES: Record<string, string> = {
  "Premier League":    "eng.1",
  "La Liga":           "esp.1",
  "Bundesliga":        "ger.1",
  "Serie A":           "ita.1",
  "Ligue 1":           "fra.1",
  "Champions League":  "uefa.champions",
  "Europa League":     "uefa.europa",
  "Conference League": "uefa.europa.conf",
  "Championship":      "eng.2",
  "League One":        "eng.3",
  "Eredivisie":        "ned.1",
  "NBA":               "nba",
  "Primeira Liga":     "por.1",
  "Super Lig":         "tur.1",
  "MLS":               "usa.1",
};

export interface EspnTeam {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  score?: string;
}

export interface EspnEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: { name: string; completed: boolean; description: string };
    displayClock: string;
    period: number;
  };
  homeTeam: EspnTeam;
  awayTeam: EspnTeam;
  leagueSlug: string;
  leagueName: string;
  venue?: string;
}

export interface EspnPlay {
  id: string;
  clock: { displayValue: string };
  text: string;
  type: { id: string; text: string };
  period: { number: number };
  team?: { id: string };
  scoringPlay?: boolean;
}

export interface EspnStat {
  name: string;
  homeValue: string;
  awayValue: string;
}

export interface EspnAthlete {
  id: string;
  displayName: string;
  jersey?: string;
  position?: string;
  headshot?: string;
}

export interface EspnRosterEntry {
  athlete: EspnAthlete;
  starter: boolean;
  subbedIn?: boolean;
  subbedOut?: boolean;
}

export interface EspnVideo {
  headline: string;
  thumbnail: string;
  links: { source?: { href: string }; mobile?: { href: string } };
  duration: number;
}

export interface EspnMatchDetail {
  event: EspnEvent;
  plays: EspnPlay[];
  stats: EspnStat[];
  homeRoster: EspnRosterEntry[];
  awayRoster: EspnRosterEntry[];
  videos: EspnVideo[];
}

function parseEvent(ev: any, leagueSlug: string, leagueName: string): EspnEvent {
  const comp = ev.competitions?.[0];
  const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
  const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
  return {
    id: ev.id,
    name: ev.name,
    date: ev.date,
    status: {
      type: {
        name: ev.status?.type?.name ?? "STATUS_SCHEDULED",
        completed: ev.status?.type?.completed ?? false,
        description: ev.status?.type?.description ?? "",
      },
      displayClock: ev.status?.displayClock ?? "",
      period: ev.status?.period ?? 0,
    },
    homeTeam: {
      id: home?.team?.id ?? "",
      name: home?.team?.displayName ?? home?.team?.name ?? "",
      abbreviation: home?.team?.abbreviation ?? "",
      logo: home?.team?.logo ?? "",
      score: home?.score,
    },
    awayTeam: {
      id: away?.team?.id ?? "",
      name: away?.team?.displayName ?? away?.team?.name ?? "",
      abbreviation: away?.team?.abbreviation ?? "",
      logo: away?.team?.logo ?? "",
      score: away?.score,
    },
    leagueSlug,
    leagueName,
    venue: comp?.venue?.fullName,
  };
}

export async function fetchScoreboard(leagueSlug: string, leagueName: string): Promise<EspnEvent[]> {
  const res = await fetch(leagueUrl(leagueName, leagueSlug, "scoreboard"), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.events ?? []).map((ev: any) => parseEvent(ev, leagueSlug, leagueName));
}

export async function fetchAllLive(): Promise<EspnEvent[]> {
  const results = await Promise.allSettled(
    Object.entries(ESPN_LEAGUES).map(([name, slug]) => fetchScoreboard(slug, name))
  );
  const all: EspnEvent[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all.filter(e => e.status.type.name === "STATUS_IN_PROGRESS");
}

export async function fetchMatchDetail(leagueSlug: string, eventId: string, leagueName = ""): Promise<EspnMatchDetail | null> {
  try {
    const res = await fetch(leagueUrl(leagueName, leagueSlug, `summary?event=${eventId}`), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();

    const ev = data.header?.competitions?.[0];
    const home = ev?.competitors?.find((c: any) => c.homeAway === "home");
    const away = ev?.competitors?.find((c: any) => c.homeAway === "away");

    const event: EspnEvent = {
      id: eventId,
      name: `${home?.team?.displayName} vs ${away?.team?.displayName}`,
      date: ev?.date ?? "",
      status: {
        type: {
          name: ev?.status?.type?.name ?? "STATUS_SCHEDULED",
          completed: ev?.status?.type?.completed ?? false,
          description: ev?.status?.type?.description ?? "",
        },
        displayClock: ev?.status?.displayClock ?? "",
        period: ev?.status?.period ?? 0,
      },
      homeTeam: {
        id: home?.team?.id ?? "",
        name: home?.team?.displayName ?? "",
        abbreviation: home?.team?.abbreviation ?? "",
        logo: home?.team?.logo ?? "",
        score: home?.score,
      },
      awayTeam: {
        id: away?.team?.id ?? "",
        name: away?.team?.displayName ?? "",
        abbreviation: away?.team?.abbreviation ?? "",
        logo: away?.team?.logo ?? "",
        score: away?.score,
      },
      leagueSlug,
      leagueName: "",
      venue: ev?.venue?.fullName,
    };

    const plays: EspnPlay[] = (data.plays ?? []).map((p: any) => ({
      id: p.id ?? String(Math.random()),
      clock: { displayValue: p.clock?.displayValue ?? "" },
      text: p.text ?? "",
      type: { id: p.type?.id ?? "", text: p.type?.text ?? "" },
      period: { number: p.period?.number ?? 1 },
      team: p.team ? { id: p.team.id } : undefined,
      scoringPlay: p.scoringPlay ?? false,
    }));

    // Stats from boxscore
    const statsRaw = data.boxscore?.teams ?? [];
    const homeStats: Record<string, string> = {};
    const awayStats: Record<string, string> = {};
    for (const teamData of statsRaw) {
      const isHome = teamData.homeAway === "home";
      for (const cat of teamData.statistics ?? []) {
        if (isHome) homeStats[cat.name] = cat.displayValue;
        else awayStats[cat.name] = cat.displayValue;
      }
    }
    const statKeys = Object.keys({ ...homeStats, ...awayStats });
    const stats: EspnStat[] = statKeys.map(k => ({
      name: k,
      homeValue: homeStats[k] ?? "0",
      awayValue: awayStats[k] ?? "0",
    }));

    // Rosters
    function parseRoster(teamData: any): EspnRosterEntry[] {
      return (teamData?.athletes ?? []).flatMap((group: any) =>
        (group.items ?? []).map((a: any) => ({
          athlete: {
            id: a.athlete?.id ?? "",
            displayName: a.athlete?.displayName ?? "",
            jersey: a.athlete?.jersey,
            position: a.position?.abbreviation,
            headshot: a.athlete?.headshot?.href,
          },
          starter: a.starter ?? false,
          subbedIn: a.subbedIn ?? false,
          subbedOut: a.subbedOut ?? false,
        }))
      );
    }
    const rosterTeams = data.rosters ?? [];
    const homeRoster = parseRoster(rosterTeams.find((t: any) => t.homeAway === "home"));
    const awayRoster = parseRoster(rosterTeams.find((t: any) => t.homeAway === "away"));

    const videos: EspnVideo[] = (data.videos ?? []).map((v: any) => ({
      headline: v.headline ?? "",
      thumbnail: v.thumbnail ?? v.posterImages?.default?.href ?? "",
      links: v.links ?? {},
      duration: v.duration ?? 0,
    }));

    return { event, plays, stats, homeRoster, awayRoster, videos };
  } catch {
    return null;
  }
}

// Find ESPN event ID by matching team names in a league's scoreboard
export async function findEventByTeams(
  leagueSlug: string,
  homeTeam: string,
  awayTeam: string
): Promise<EspnEvent | null> {
  const events = await fetchScoreboard(leagueSlug, "");
  const normalize = (s: string) => s.toLowerCase().replace(/\s+fc$|\s+afc$|\s+cf$/, "").trim();
  const h = normalize(homeTeam);
  const a = normalize(awayTeam);
  return (
    events.find(e => {
      const eh = normalize(e.homeTeam.name);
      const ea = normalize(e.awayTeam.name);
      return (eh.includes(h) || h.includes(eh)) && (ea.includes(a) || a.includes(ea));
    }) ?? null
  );
}

// ── NBA Standings ─────────────────────────────────────────────────────────────

export interface NBAStandingEntry {
  rank: number;
  team: { id: string; name: string; abbreviation: string; logo: string };
  wins: number;
  losses: number;
  pct: number;
  gamesBehind: number;
  last10: string;
  streak: string;
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
      points:        parseCategory(find("pointsPerGame") ?? find("points")),
      rebounds:      parseCategory(find("reboundsPerGame") ?? find("rebounds")),
      assists:       parseCategory(find("assistsPerGame") ?? find("assists")),
      steals:        parseCategory(find("stealsPerGame") ?? find("steals")),
      blocks:        parseCategory(find("blocksPerGame") ?? find("blocks")),
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
