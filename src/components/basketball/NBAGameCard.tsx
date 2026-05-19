import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EspnEvent } from "@/lib/espn";
import { Match } from "@/hooks/useLeagueMatches";
import { useNBAPlayByPlay } from "@/hooks/useNBAPlayByPlay";
import { NBAPlayByPlay } from "./NBAPlayByPlay";
import { NBAOddsRow, SGPLeg } from "./NBAOddsRow";

interface NBAGameCardProps {
  match: Match;
  espn?: EspnEvent;
  sgpKeys: Set<string>;
  onSGPToggle: (gameId: string, leg: SGPLeg) => void;
}

const CONF_TEAMS: Record<string, "East" | "West"> = {
  "Boston Celtics":"East","New York Knicks":"East","Cleveland Cavaliers":"East",
  "Milwaukee Bucks":"East","Indiana Pacers":"East","Miami Heat":"East",
  "Philadelphia 76ers":"East","Chicago Bulls":"East","Brooklyn Nets":"East",
  "Toronto Raptors":"East","Atlanta Hawks":"East","Charlotte Hornets":"East",
  "Washington Wizards":"East","Detroit Pistons":"East","Orlando Magic":"East",
  "Oklahoma City Thunder":"West","Denver Nuggets":"West","Minnesota Timberwolves":"West",
  "Dallas Mavericks":"West","LA Clippers":"West","Los Angeles Clippers":"West",
  "Los Angeles Lakers":"West","LA Lakers":"West","Phoenix Suns":"West",
  "New Orleans Pelicans":"West","Sacramento Kings":"West","Golden State Warriors":"West",
  "Houston Rockets":"West","Utah Jazz":"West","Portland Trail Blazers":"West",
  "San Antonio Spurs":"West","Memphis Grizzlies":"West",
};

export const NBAGameCard = ({ match, espn, sgpKeys, onSGPToggle }: NBAGameCardProps) => {
  const navigate = useNavigate();

  const isLive = espn?.status.type.name === "STATUS_IN_PROGRESS";
  const isDone = espn?.status.type.completed;
  const period = espn?.status.period ?? 0;
  const clock  = espn?.status.displayClock ?? "";

  const periodLabel = period === 1 ? "1st" : period === 2 ? "2nd"
    : period === 3 ? "3rd" : period === 4 ? "4th" : period > 4 ? "OT" : "";

  const { data: plays = [] } = useNBAPlayByPlay(espn?.id, !!isLive);

  const sgpCount = sgpKeys.size;

  const openDetail = () => {
    if (espn) navigate(`/match/${espn.id}?league=NBA&espn=1`);
    else navigate(`/match/${match.match_id}?home=${encodeURIComponent(match.home_team)}&away=${encodeURIComponent(match.away_team)}&league=NBA`);
  };

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
      onClick={openDetail}
    >
      {isLive && (
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse" />
      )}

      {/* Status + SGP badge */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          {isLive ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold">{periodLabel} {clock}</span>
            </span>
          ) : isDone ? (
            <span className="text-muted-foreground/60 font-bold">FINAL</span>
          ) : (
            format(new Date(match.commence_time), "EEE d MMM · h:mm a")
          )}
        </span>
        <div className="flex items-center gap-1.5">
          {sgpCount >= 2 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00b15c]/15 text-[#00b15c] border border-[#00b15c]/30">
              SGP ×{sgpCount}
            </span>
          )}
          <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary/50 transition-colors" />
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-3 pb-2.5 space-y-2">
        <div className="flex items-center gap-2.5">
          {espn?.homeTeam.logo ? (
            <img src={espn.homeTeam.logo} alt={match.home_team} className="w-8 h-8 object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{match.home_team[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold leading-tight block truncate">{match.home_team}</span>
            {CONF_TEAMS[match.home_team] && (
              <span className="text-[9px] text-muted-foreground/50 uppercase">{CONF_TEAMS[match.home_team]}</span>
            )}
          </div>
          {(isLive || isDone) && espn && (
            <span className={cn("text-2xl font-black tabular-nums shrink-0", isLive ? "text-orange-400" : "text-foreground")}>
              {espn.homeTeam.score ?? "0"}
            </span>
          )}
        </div>

        {(isLive || isDone) && espn && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[9px] text-muted-foreground/50 shrink-0">
              {isDone ? "FINAL" : `Q${period} ${clock}`}
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {espn?.awayTeam.logo ? (
            <img src={espn.awayTeam.logo} alt={match.away_team} className="w-8 h-8 object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{match.away_team[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-muted-foreground leading-tight block truncate">{match.away_team}</span>
            {CONF_TEAMS[match.away_team] && (
              <span className="text-[9px] text-muted-foreground/50 uppercase">{CONF_TEAMS[match.away_team]}</span>
            )}
          </div>
          {(isLive || isDone) && espn && (
            <span className={cn("text-2xl font-black tabular-nums shrink-0", isLive ? "text-orange-400/70" : "text-muted-foreground")}>
              {espn.awayTeam.score ?? "0"}
            </span>
          )}
        </div>
      </div>

      {isLive && plays.length > 0 && (
        <NBAPlayByPlay plays={plays} homeTeamId={espn?.homeTeam.id} />
      )}

      <NBAOddsRow
        matchId={match.match_id}
        homeTeam={match.home_team}
        awayTeam={match.away_team}
        homeOdds={match.home_odds}
        awayOdds={match.away_odds}
        matchTime={match.commence_time}
        sgpKeys={sgpKeys}
        onSGPToggle={leg => onSGPToggle(match.match_id, leg)}
      />
    </div>
  );
};
