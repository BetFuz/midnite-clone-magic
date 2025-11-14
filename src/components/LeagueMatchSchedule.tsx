import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useLeagueMatches, Match } from "@/hooks/useLeagueMatches";
import { format } from "date-fns";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Skeleton } from "@/components/ui/skeleton";

interface LeagueMatchScheduleProps {
  leagueName: string;
  daysAhead?: number;
}

export const LeagueMatchSchedule = ({ leagueName, daysAhead = 7 }: LeagueMatchScheduleProps) => {
  const { data: matches, isLoading, isError, error, refetch } = useLeagueMatches(leagueName, daysAhead);
  const { addSelection } = useBetSlip();

  const handleAddBet = (match: Match, selectionType: "home" | "away" | "draw", odds: number, selectionValue: string) => {
    addSelection({
      id: `${match.match_id}-${selectionType}`,
      matchId: match.match_id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      league: match.league_name,
      sport: match.sport_title,
      selectionType,
      selectionValue,
      odds,
      matchTime: match.commence_time,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">
            Failed to load matches. {error instanceof Error ? error.message : "Please try again."}
          </p>
          <div className="flex justify-center mt-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No upcoming matches scheduled for the next {daysAhead} days
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Upcoming Matches ({matches.length})</h3>
      </div>
      
      {matches.map((match) => (
        <Card key={match.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(match.commence_time), "PPp")}
                </span>
              </div>
              <Badge variant="outline">{match.status}</Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Teams */}
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{match.home_team}</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">VS</Badge>
                </div>
                <div>
                  <p className="font-semibold">{match.away_team}</p>
                </div>
              </div>

              {/* Odds & Betting */}
              {(match.home_odds || match.draw_odds || match.away_odds) && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  {match.home_odds && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto py-2"
                      onClick={() => handleAddBet(match, "home", match.home_odds!, "Home Win")}
                    >
                      <span className="text-xs text-muted-foreground">Home</span>
                      <span className="text-lg font-bold text-primary">{match.home_odds.toFixed(2)}</span>
                    </Button>
                  )}
                  
                  {match.draw_odds && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto py-2"
                      onClick={() => handleAddBet(match, "draw", match.draw_odds!, "Draw")}
                    >
                      <span className="text-xs text-muted-foreground">Draw</span>
                      <span className="text-lg font-bold text-primary">{match.draw_odds.toFixed(2)}</span>
                    </Button>
                  )}
                  
                  {match.away_odds && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto py-2"
                      onClick={() => handleAddBet(match, "away", match.away_odds!, "Away Win")}
                    >
                      <span className="text-xs text-muted-foreground">Away</span>
                      <span className="text-lg font-bold text-primary">{match.away_odds.toFixed(2)}</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};