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
