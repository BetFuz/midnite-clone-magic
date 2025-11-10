import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { TrendingUp, Activity } from "lucide-react";
import GameFlowBar from "./GameFlowBar";
import LiveStats from "./LiveStats";
import { useState } from "react";

interface LiveMatchCardProps {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  homeOdds: number;
  drawOdds: number | null;
  awayOdds: number;
  possession?: { home: number; away: number } | null;
  shots?: { home: number; away: number } | null;
  corners?: { home: number; away: number } | null;
  trending?: boolean;
}

const LiveMatchCard = ({
  id,
  sport,
  league,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  homeOdds,
  drawOdds,
  awayOdds,
  possession,
  shots,
  corners,
  trending,
}: LiveMatchCardProps) => {
  const { addSelection } = useBetSlip();
  const [showStats, setShowStats] = useState(false);

  const handleOddsClick = (
    selectionType: "home" | "away" | "draw",
    selectionValue: string,
    odds: number
  ) => {
    addSelection({
      id: `${id}-${selectionType}`,
      matchId: id,
      sport,
      league,
      homeTeam,
      awayTeam,
      selectionType,
      selectionValue,
      odds,
      matchTime: `LIVE - ${minute}`,
    });
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all border-l-4 border-l-red-500 relative overflow-hidden">
      {/* Live Pulse Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>

      {trending && (
        <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600 gap-1">
          <TrendingUp className="h-3 w-3" />
          Trending
        </Badge>
      )}

      {/* Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <Badge variant="destructive" className="text-xs">
              LIVE
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{league}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold text-green-600 border-green-600">
            {minute}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="h-7"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-foreground">{homeTeam}</span>
          <span className="text-2xl font-bold text-primary">{homeScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{awayTeam}</span>
          <span className="text-2xl font-bold text-primary">{awayScore}</span>
        </div>
      </div>

      {/* Game Flow Bar */}
      {possession && (
        <GameFlowBar
          homePossession={possession.home}
          awayPossession={possession.away}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )}

      {/* Live Stats (Collapsible) */}
      {showStats && (shots || corners) && (
        <LiveStats
          possession={possession}
          shots={shots}
          corners={corners}
          className="mb-4"
        />
      )}

      {/* Live Odds */}
      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          className="flex-1 flex flex-col items-center gap-1 h-auto py-2 hover:bg-primary hover:text-primary-foreground transition-all group relative overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            handleOddsClick("home", homeTeam, homeOdds);
          }}
        >
          <span className="text-xs text-muted-foreground group-hover:text-primary-foreground">
            Home
          </span>
          <span className="text-lg font-bold animate-pulse">{homeOdds.toFixed(2)}</span>
        </Button>

        {drawOdds && (
          <Button
            variant="outline"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2 hover:bg-primary hover:text-primary-foreground transition-all group"
            onClick={(e) => {
              e.stopPropagation();
              handleOddsClick("draw", "Draw", drawOdds);
            }}
          >
            <span className="text-xs text-muted-foreground group-hover:text-primary-foreground">
              Draw
            </span>
            <span className="text-lg font-bold animate-pulse">{drawOdds.toFixed(2)}</span>
          </Button>
        )}

        <Button
          variant="outline"
          className="flex-1 flex flex-col items-center gap-1 h-auto py-2 hover:bg-primary hover:text-primary-foreground transition-all group"
          onClick={(e) => {
            e.stopPropagation();
            handleOddsClick("away", awayTeam, awayOdds);
          }}
        >
          <span className="text-xs text-muted-foreground group-hover:text-primary-foreground">
            Away
          </span>
          <span className="text-lg font-bold animate-pulse">{awayOdds.toFixed(2)}</span>
        </Button>
      </div>
    </Card>
  );
};

export default LiveMatchCard;
