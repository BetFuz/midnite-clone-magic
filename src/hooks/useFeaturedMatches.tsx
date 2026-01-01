import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function withTimeout<T>(promise: PromiseLike<T>, ms = 12000): Promise<T> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Request timed out")), ms);
  });

  try {
    return (await Promise.race([Promise.resolve(promise), timeout])) as T;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

interface FeaturedMatch {
  id: string;
  sport: string;
  league: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds: string | null;
  awayOdds: string;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatOdds(v: unknown) {
  const n = toNumber(v);
  return n === null ? "1.00" : n.toFixed(2);
}

function normalizeDateString(raw: string) {
  // Safari/iOS WebViews can fail on some non-ISO formats.
  // Normalize "YYYY-MM-DD HH:mm:ss+00" => "YYYY-MM-DDTHH:mm:ss+00:00".
  let s = raw.trim();
  if (s.includes(" ") && !s.includes("T")) s = s.replace(" ", "T");
  // If we have a trailing timezone like +00 (hours only), expand it.
  s = s.replace(/([+-]\d{2})$/, "$1:00");
  return s;
}

function formatTime(dateValue: unknown) {
  if (!dateValue) return "TBD";
  const date = new Date(normalizeDateString(String(dateValue)));
  if (Number.isNaN(date.getTime())) return "TBD";

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (date.toDateString() === today.toDateString()) return `Today ${timeStr}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow ${timeStr}`;
  return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${timeStr}`;
}

export const useFeaturedMatches = () => {
  return useQuery({
    queryKey: ["featured-matches"],
    queryFn: async () => {
      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data, error } = await withTimeout(
        supabase
          .from("matches")
          .select(
            "id, match_id, sport_key, sport_title, league_name, home_team, away_team, commence_time, home_odds, draw_odds, away_odds, status"
          )
          .gte("commence_time", now.toISOString())
          .lte("commence_time", threeDaysFromNow.toISOString())
          .order("commence_time", { ascending: true })
          .limit(20),
        30000
      );

      if (error) {
        console.error("featured-matches: query error", error);
        throw error;
      }

      const sportMapping: Record<string, string> = {
        soccer_epl: "Football",
        soccer_spain_la_liga: "Football",
        soccer_germany_bundesliga: "Football",
        soccer_italy_serie_a: "Football",
        soccer_france_ligue_one: "Football",
        soccer_uefa_champs_league: "Football",
        soccer_uefa_europa_league: "Football",
        basketball_nba: "Basketball",
        basketball_euroleague: "Basketball",
        americanfootball_nfl: "American Football",
        icehockey_nhl: "Ice Hockey",
        tennis_atp: "Tennis",
        tennis_wta: "Tennis",
        tennis_atp_wimbledon: "Tennis",
        tennis_atp_us_open: "Tennis",
      };

      const out: FeaturedMatch[] = [];
      for (const match of (data ?? []) as any[]) {
        const drawN = toNumber(match.draw_odds);
        out.push({
          id: match.id,
          sport: sportMapping[match.sport_key] || match.sport_title || "Football",
          league: match.league_name || "Unknown League",
          time: formatTime(match.commence_time),
          homeTeam: match.home_team || "TBD",
          awayTeam: match.away_team || "TBD",
          homeOdds: formatOdds(match.home_odds),
          drawOdds: drawN === null ? null : drawN.toFixed(2),
          awayOdds: formatOdds(match.away_odds),
        });
      }

      console.debug("featured-matches: fetched", out.length);
      return out;
    },
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 1,
  });
};
