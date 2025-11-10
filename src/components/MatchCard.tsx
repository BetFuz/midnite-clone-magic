import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useBetSlip } from "@/contexts/BetSlipContext";

interface MatchCardProps {
  sport?: string;
  league?: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds: string | null;
  awayOdds: string;
}

const MatchCard = ({ sport, league, time, homeTeam, awayTeam, homeOdds, drawOdds, awayOdds }: MatchCardProps) => {
  const navigate = useNavigate();
  const { addSelection } = useBetSlip();
  
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

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={handleMatchClick}>
      {league && (
        <Badge variant="secondary" className="mb-2 text-xs">{league}</Badge>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-3">{time}</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">{getSportIcon()}</div>
              <span className="text-sm font-medium text-foreground">{homeTeam}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">{getSportIcon()}</div>
              <span className="text-sm font-medium text-foreground">{awayTeam}</span>
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
    </Card>
  );
};

export default MatchCard;
