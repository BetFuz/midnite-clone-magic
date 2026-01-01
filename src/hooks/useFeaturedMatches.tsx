import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const useFeaturedMatches = () => {
  return useQuery({
    queryKey: ["featured-matches"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const { data, error } = await supabase
        .from("matches")
        .select("id, match_id, sport_key, sport_title, league_name, home_team, away_team, commence_time, home_odds, draw_odds, away_odds, status")
        .gte("commence_time", now)
        .lte("commence_time", threeDaysFromNow.toISOString())
        .order("commence_time", { ascending: true })
        .limit(20);

      if (error) throw error;

      // Map sport_key to display sport name
      const sportMapping: Record<string, string> = {
        "soccer_epl": "Football",
        "soccer_spain_la_liga": "Football",
        "soccer_germany_bundesliga": "Football",
        "soccer_italy_serie_a": "Football",
        "soccer_france_ligue_one": "Football",
        "soccer_uefa_champs_league": "Football",
        "soccer_uefa_europa_league": "Football",
        "basketball_nba": "Basketball",
        "basketball_euroleague": "Basketball",
        "americanfootball_nfl": "American Football",
        "icehockey_nhl": "Ice Hockey",
        "tennis_atp": "Tennis",
        "tennis_wta": "Tennis",
        "tennis_atp_wimbledon": "Tennis",
        "tennis_atp_us_open": "Tennis",
      };

      const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        
        if (date.toDateString() === now.toDateString()) {
          return `Today ${timeStr}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return `Tomorrow ${timeStr}`;
        } else {
          return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${timeStr}`;
        }
      };

      return (data || []).map((match) => ({
        id: match.id,
        sport: sportMapping[match.sport_key] || match.sport_title || "Football",
        league: match.league_name || "Unknown League",
        time: formatTime(match.commence_time),
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        homeOdds: match.home_odds?.toFixed(2) || "1.00",
        drawOdds: match.draw_odds ? match.draw_odds.toFixed(2) : null,
        awayOdds: match.away_odds?.toFixed(2) || "1.00",
      })) as FeaturedMatch[];
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto-refresh every minute
  });
};
