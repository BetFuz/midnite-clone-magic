import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Trophy, Target } from "lucide-react";

interface MatchStatsProps {
  matchStats: {
    homeTeam: string;
    awayTeam: string;
    homeForm?: string;
    awayForm?: string;
    homePosition?: number;
    awayPosition?: number;
    homeGoalsScored?: number;
    awayGoalsScored?: number;
    homeGoalsConceded?: number;
    awayGoalsConceded?: number;
    h2hHomeWins?: number;
    h2hDraws?: number;
    h2hAwayWins?: number;
    lastMeetingResult?: string;
  };
}

export const MatchStats = ({ matchStats }: MatchStatsProps) => {
  const FormIndicator = ({ form }: { form?: string }) => {
    if (!form) return null;
    return (
      <div className="flex gap-1">
        {form.split('').map((result, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${
              result === 'W' ? 'bg-success text-white' :
              result === 'D' ? 'bg-muted text-foreground' :
              'bg-destructive text-white'
            }`}
          >
            {result}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Match Statistics</h3>
      </div>

      {/* Form */}
      {(matchStats.homeForm || matchStats.awayForm) && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Recent Form (Last 5)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">{matchStats.homeTeam}</p>
              <FormIndicator form={matchStats.homeForm} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">{matchStats.awayTeam}</p>
              <FormIndicator form={matchStats.awayForm} />
            </div>
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* League Position */}
      {(matchStats.homePosition || matchStats.awayPosition) && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">League Position</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-semibold text-foreground">{matchStats.homeTeam}</span>
              <Badge variant="secondary" className="font-bold">#{matchStats.homePosition}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-semibold text-foreground">{matchStats.awayTeam}</span>
              <Badge variant="secondary" className="font-bold">#{matchStats.awayPosition}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Goals Stats */}
      {(matchStats.homeGoalsScored !== undefined) && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Goals This Season</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scored:</span>
                <span className="font-semibold text-success">{matchStats.homeGoalsScored}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conceded:</span>
                <span className="font-semibold text-destructive">{matchStats.homeGoalsConceded}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scored:</span>
                <span className="font-semibold text-success">{matchStats.awayGoalsScored}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conceded:</span>
                <span className="font-semibold text-destructive">{matchStats.awayGoalsConceded}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator className="my-6" />

      {/* Head to Head */}
      {(matchStats.h2hHomeWins !== undefined) && (
        <div>
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Head-to-Head Record
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold text-success">{matchStats.h2hHomeWins}</p>
              <p className="text-xs text-muted-foreground mt-1">{matchStats.homeTeam}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{matchStats.h2hDraws}</p>
              <p className="text-xs text-muted-foreground mt-1">Draws</p>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <p className="text-2xl font-bold text-success">{matchStats.h2hAwayWins}</p>
              <p className="text-xs text-muted-foreground mt-1">{matchStats.awayTeam}</p>
            </div>
          </div>
          {matchStats.lastMeetingResult && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Last Meeting: {matchStats.lastMeetingResult}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
