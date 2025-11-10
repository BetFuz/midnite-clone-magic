import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MatchCardProps {
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds: string;
  awayOdds: string;
}

const MatchCard = ({ time, homeTeam, awayTeam, homeOdds, drawOdds, awayOdds }: MatchCardProps) => {
  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-3">{time}</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">⚽</div>
              <span className="text-sm font-medium text-foreground">{homeTeam}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">⚽</div>
              <span className="text-sm font-medium text-foreground">{awayTeam}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-20 flex flex-col h-auto py-2 hover:bg-primary/20 hover:text-primary"
            >
              <span className="text-xs text-muted-foreground">Home</span>
              <span className="text-base font-bold text-odds">{homeOdds}</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-20 flex flex-col h-auto py-2 hover:bg-primary/20 hover:text-primary"
            >
              <span className="text-xs text-muted-foreground">Away</span>
              <span className="text-base font-bold text-odds">{awayOdds}</span>
            </Button>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-20 flex flex-col h-auto py-2 hover:bg-primary/20 hover:text-primary"
          >
            <span className="text-xs text-muted-foreground">Draw</span>
            <span className="text-base font-bold text-odds">{drawOdds}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;
