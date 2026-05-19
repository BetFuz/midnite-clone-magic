import { cn } from "@/lib/utils";

export interface SGPLeg {
  key: string;
  label: string;
  odds: number;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
}

interface NBAOddsRowProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds?: number;
  awayOdds?: number;
  matchTime: string;
  sgpKeys: Set<string>;
  onSGPToggle: (leg: SGPLeg) => void;
}

interface OddsBtnProps {
  legKey: string;
  label: string;
  odds: number;
  checked: boolean;
  onClick: () => void;
}

const OddsBtn = ({ legKey: _k, label, odds, checked, onClick }: OddsBtnProps) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center flex-1 h-11 rounded-lg border transition-all active:scale-95",
      checked
        ? "bg-[#00b15c]/15 border-[#00b15c]/60 text-[#00b15c]"
        : "bg-muted hover:bg-primary/10 hover:border-primary/40 border-transparent"
    )}
  >
    <span className={cn(
      "absolute top-1 right-1 w-2 h-2 rounded-full border transition-colors",
      checked ? "bg-[#00b15c] border-[#00b15c]" : "border-muted-foreground/30"
    )} />
    <span className="text-[9px] text-muted-foreground leading-none mb-0.5">{label}</span>
    <span className="text-xs font-bold tabular-nums leading-snug">{odds.toFixed(2)}</span>
  </button>
);

export const NBAOddsRow = ({
  matchId, homeTeam, awayTeam, homeOdds, awayOdds, matchTime, sgpKeys, onSGPToggle,
}: NBAOddsRowProps) => {
  if (!homeOdds && !awayOdds) {
    return (
      <div className="flex border-t border-border/60 py-2 justify-center">
        <span className="text-[10px] text-muted-foreground">Odds TBC</span>
      </div>
    );
  }

  return (
    <div
      className="flex gap-px border-t border-border/60 p-1"
      onClick={e => e.stopPropagation()}
    >
      {homeOdds != null && (
        <OddsBtn
          legKey="home-ml"
          label="Home"
          odds={homeOdds}
          checked={sgpKeys.has("home-ml")}
          onClick={() => onSGPToggle({
            key: "home-ml", label: `${homeTeam} ML`,
            odds: homeOdds, matchId, homeTeam, awayTeam, matchTime,
          })}
        />
      )}
      {awayOdds != null && (
        <OddsBtn
          legKey="away-ml"
          label="Away"
          odds={awayOdds}
          checked={sgpKeys.has("away-ml")}
          onClick={() => onSGPToggle({
            key: "away-ml", label: `${awayTeam} ML`,
            odds: awayOdds, matchId, homeTeam, awayTeam, matchTime,
          })}
        />
      )}
    </div>
  );
};
