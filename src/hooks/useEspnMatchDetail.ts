import { useQuery } from "@tanstack/react-query";
import { fetchMatchDetail, findEventByTeams, ESPN_LEAGUES, EspnMatchDetail, EspnEvent } from "@/lib/espn";

export function useEspnMatchDetail(leagueSlug: string, eventId: string) {
  return useQuery<EspnMatchDetail | null>({
    queryKey: ["espn", "detail", leagueSlug, eventId],
    queryFn: () => fetchMatchDetail(leagueSlug, eventId),
    enabled: !!leagueSlug && !!eventId,
    refetchInterval: (data) => {
      if (!data) return false;
      const status = data?.event?.status?.type?.name;
      return status === "STATUS_IN_PROGRESS" ? 25_000 : false;
    },
    staleTime: 20_000,
  });
}

export function useEspnEventByTeams(leagueName: string, homeTeam: string, awayTeam: string) {
  const slug = ESPN_LEAGUES[leagueName] ?? "";
  return useQuery<EspnEvent | null>({
    queryKey: ["espn", "find", slug, homeTeam, awayTeam],
    queryFn: () => findEventByTeams(slug, homeTeam, awayTeam),
    enabled: !!slug && !!homeTeam && !!awayTeam,
    staleTime: 60_000,
  });
}
