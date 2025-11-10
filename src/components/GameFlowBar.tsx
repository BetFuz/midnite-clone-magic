import { cn } from "@/lib/utils";

interface GameFlowBarProps {
  homePossession: number;
  awayPossession: number;
  homeTeam: string;
  awayTeam: string;
  className?: string;
}

const GameFlowBar = ({
  homePossession,
  awayPossession,
  homeTeam,
  awayTeam,
  className,
}: GameFlowBarProps) => {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Possession</span>
        <div className="flex gap-4">
          <span className="font-semibold">{homePossession}%</span>
          <span className="font-semibold">{awayPossession}%</span>
        </div>
      </div>
      
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Home Team Possession */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out"
          style={{ width: `${homePossession}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
        
        {/* Away Team Possession */}
        <div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-orange-500 to-orange-600 transition-all duration-1000 ease-out"
          style={{ width: `${awayPossession}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>

        {/* Center Line */}
        <div className="absolute left-1/2 top-0 h-full w-[2px] bg-background -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default GameFlowBar;
