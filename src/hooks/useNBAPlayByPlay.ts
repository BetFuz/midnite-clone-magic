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
