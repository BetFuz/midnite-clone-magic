import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { TrendingUp, Users, Info, ChevronDown, BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ExpandedLiveMarkets from "./ExpandedLiveMarkets";
import { useState } from "react";

interface MatchCardProps {
  sport?: string;
  league?: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds: string | null;
  awayOdds: string;
  homeForm?: string;
  awayForm?: string;
  popularBet?: string;
  popularBetPercentage?: number;
}

const MatchCard = ({ 
  sport, 
  league, 
  time, 
  homeTeam, 
  awayTeam, 
  homeOdds, 
  drawOdds, 
  awayOdds,
  homeForm,
  awayForm,
  popularBet,
  popularBetPercentage 
}: MatchCardProps) => {
  const navigate = useNavigate();
  const { addSelection } = useBetSlip();
  const [showMarkets, setShowMarkets] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const handleOddsClick = (selectionType: "home" | "away" | "draw", selectionValue: string, odds: string) => {
    const matchId = `${homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam.toLowerCase().replace(/\s+/g, '-')}`;
    
    addSelection({
      id: `${matchId}-${selectionType}`,
      matchId,
      sport: sport || "⚽",
      league,
      homeTeam,
      awayTeam,
      selectionType,
      selectionValue,
      odds: parseFloat(odds),
      matchTime: time,
    });
  };

  const handleMatchClick = () => {
    navigate(`/match/${homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const getSportIcon = () => {
    switch (sport) {
      case "Basketball":
        return "🏀";
      case "American Football":
        return "🏈";
      case "Tennis":
        return "🎾";
      default:
        return "⚽";
    }
  };

  const FormIndicator = ({ form }: { form: string }) => (
    <div className="flex gap-0.5">
      {form.split('').slice(0, 3).map((result, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            result === 'W' ? 'bg-success' :
            result === 'D' ? 'bg-muted-foreground' :
            'bg-destructive'
          }`}
        />
      ))}
    </div>
  );

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={handleMatchClick}>
      <div className="flex items-center justify-between mb-3">
        {league && (
          <Badge variant="secondary" className="text-xs">{league}</Badge>
        )}
        {popularBet && popularBetPercentage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <Users className="h-3 w-3" />
                  <span className="font-semibold">{popularBetPercentage}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{popularBetPercentage}% betting on {popularBet}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-3">{time}</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">{getSportIcon()}</div>
                <span className="text-sm font-medium text-foreground">{homeTeam}</span>
              </div>
              {homeForm && <FormIndicator form={homeForm} />}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">{getSportIcon()}</div>
                <span className="text-sm font-medium text-foreground">{awayTeam}</span>
              </div>
              {awayForm && <FormIndicator form={awayForm} />}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-20 flex flex-col h-auto py-2 hover:bg-primary/20 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleOddsClick("home", `${homeTeam} to win`, homeOdds);
              }}
            >
              <span className="text-xs text-muted-foreground">Home</span>
              <span className="text-base font-bold text-odds">{homeOdds}</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-20 flex flex-col h-auto py-2 hover:bg-primary/20 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleOddsClick("away", `${awayTeam} to win`, awayOdds);
              }}
            >
              <span className="text-xs text-muted-foreground">Away</span>
              <span className="text-base font-bold text-odds">{awayOdds}</span>
            </Button>
          </div>
          {drawOdds && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-20 flex flex-col h-auto py-2 hover:bg-primary/20 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleOddsClick("draw", "Draw", drawOdds);
              }}
            >
              <span className="text-xs text-muted-foreground">Draw</span>
              <span className="text-base font-bold text-odds">{drawOdds}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats Preview */}
      {showStats && (homeForm || awayForm) && (
        <div className="mt-3 pt-3 border-t border-border animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <div className="text-muted-foreground mb-1">Form (Last 5)</div>
              <div className="flex justify-center">
                {homeForm && <FormIndicator form={homeForm} />}
              </div>
              <div className="flex justify-center mt-1">
                {awayForm && <FormIndicator form={awayForm} />}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">H2H Record</div>
              <div className="font-semibold text-blue-600">3</div>
              <div className="font-semibold text-orange-600">2</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Avg Goals</div>
              <div className="font-semibold">2.8</div>
              <div className="font-semibold">2.3</div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Markets */}
      {showMarkets && (
        <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <ExpandedLiveMarkets
            matchId={`${homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeam.toLowerCase().replace(/\s+/g, '-')}`}
            sport={sport || "Football"}
            league={league || ""}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 pt-3 border-t border-border flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs gap-1"
          onClick={() => setShowStats(!showStats)}
        >
          <BarChart3 className="h-3 w-3" />
          {showStats ? "Hide" : "Show"} Stats
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs gap-1"
          onClick={() => setShowMarkets(!showMarkets)}
        >
          {showMarkets ? "Hide" : "More"} Markets
          <ChevronDown className={`h-3 w-3 transition-transform ${showMarkets ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </Card>
  );
};

export default MatchCard;
