import { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { NBAPlay } from "@/lib/espn";
import { cn } from "@/lib/utils";

interface NBAPlayByPlayProps {
  plays: NBAPlay[];
  homeTeamId?: string;
}

export const NBAPlayByPlay = ({ plays, homeTeamId }: NBAPlayByPlayProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!plays.length) return null;

  const reversed = [...plays].reverse();
  const shown = expanded ? reversed.slice(0, 10) : reversed.slice(0, 3);

  return (
    <div className="border-t border-border/40 bg-muted/30 px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
          Play-by-Play
        </span>
        {plays.length > 3 && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            className="flex items-center gap-0.5 text-[9px] text-primary hover:text-primary/70"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />More</>}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {shown.map((play, i) => {
          const isHome = play.teamId === homeTeamId;
          const isScoring = play.scoringPlay;
          return (
            <div
              key={play.id}
              className={cn(
                "flex items-start gap-2 text-[10px] leading-snug",
                i === 0 ? "opacity-100" : i === 1 ? "opacity-70" : "opacity-40"
              )}
            >
              <span className="text-muted-foreground/60 shrink-0 font-mono">
                Q{play.period} {play.clock}
              </span>
              {isScoring && <Zap className="w-2.5 h-2.5 text-orange-400 shrink-0 mt-0.5" />}
              <span className={cn(
                "flex-1",
                isScoring
                  ? isHome ? "text-primary font-medium" : "text-orange-400 font-medium"
                  : "text-muted-foreground"
              )}>
                {play.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
