import { useQuery } from "@tanstack/react-query";
import { fetchAllLive, fetchScoreboard, ESPN_LEAGUES, EspnEvent } from "@/lib/espn";

export function useAllLiveScores() {
  return useQuery<EspnEvent[]>({
    queryKey: ["espn", "live"],
    queryFn: fetchAllLive,
    refetchInterval: 30_000,
    staleTime: 20_000,
    placeholderData: [],
  });
}

export function useLeagueScoreboard(leagueName: string) {
  const slug = ESPN_LEAGUES[leagueName] ?? "";
  return useQuery<EspnEvent[]>({
    queryKey: ["espn", "scoreboard", slug],
    queryFn: () => fetchScoreboard(slug, leagueName),
    enabled: !!slug,
    refetchInterval: 30_000,
    staleTime: 20_000,
    placeholderData: [],
  });
}
