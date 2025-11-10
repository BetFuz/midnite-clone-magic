import { cn } from "@/lib/utils";
import { Activity, Target, Flag } from "lucide-react";

interface LiveStatsProps {
  possession?: { home: number; away: number } | null;
  shots?: { home: number; away: number } | null;
  corners?: { home: number; away: number } | null;
  className?: string;
}

const LiveStats = ({ possession, shots, corners, className }: LiveStatsProps) => {
  return (
    <div className={cn("bg-muted/30 rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">Live Statistics</span>
      </div>

      {possession && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Possession</span>
          </div>
          <div className="flex gap-4 font-semibold">
            <span className="text-blue-600">{possession.home}%</span>
            <span className="text-orange-600">{possession.away}%</span>
          </div>
        </div>
      )}

      {shots && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Shots</span>
          </div>
          <div className="flex gap-4 font-semibold">
            <span className="text-blue-600">{shots.home}</span>
            <span className="text-orange-600">{shots.away}</span>
          </div>
        </div>
      )}

      {corners && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Flag className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Corners</span>
          </div>
          <div className="flex gap-4 font-semibold">
            <span className="text-blue-600">{corners.home}</span>
            <span className="text-orange-600">{corners.away}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStats;
