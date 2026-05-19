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
