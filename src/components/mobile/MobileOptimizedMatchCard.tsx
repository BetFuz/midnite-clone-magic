import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SwipeableOddsButton } from "./SwipeableOddsButton";
import { TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileOptimizedMatchCardProps {
  match: {
    id: string;
    league: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    homeOdds: string;
    drawOdds?: string;
    awayOdds: string;
    isLive?: boolean;
    score?: string;
    popularityBadge?: string;
  };
}

export const MobileOptimizedMatchCard = ({ match }: MobileOptimizedMatchCardProps) => {
  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {match.league}
          </Badge>
          {match.isLive && (
            <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{match.time}</span>
      </div>

      {/* Teams */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground text-base">{match.homeTeam}</span>
          {match.score && (
            <span className="text-lg font-bold text-primary">{match.score.split('-')[0]}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground text-base">{match.awayTeam}</span>
          {match.score && (
            <span className="text-lg font-bold text-primary">{match.score.split('-')[1]}</span>
          )}
        </div>
      </div>

      {/* Swipeable Odds */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Swipe left to add • Tap to select
        </div>
        <div className={cn(
          "grid gap-2",
          match.drawOdds ? "grid-cols-3" : "grid-cols-2"
        )}>
          <SwipeableOddsButton
            odds={parseFloat(match.homeOdds)}
            selection={match.homeTeam}
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            sport="Football"
            league={match.league}
            selectionType="home"
          />
          {match.drawOdds && (
            <SwipeableOddsButton
              odds={parseFloat(match.drawOdds)}
              selection="Draw"
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              sport="Football"
              league={match.league}
              selectionType="draw"
            />
          )}
          <SwipeableOddsButton
            odds={parseFloat(match.awayOdds)}
            selection={match.awayTeam}
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            sport="Football"
            league={match.league}
            selectionType="away"
          />
        </div>
      </div>

      {/* Popularity Badge */}
      {match.popularityBadge && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{match.popularityBadge}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
