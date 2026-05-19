import { Link, useLocation } from "react-router-dom";

const SPORTS = [
  { label: "Live", emoji: "🔴", url: "/live", highlight: true },
  { label: "Football", emoji: "⚽", url: "/sports/football" },
  { label: "Basketball", emoji: "🏀", url: "/sports/basketball" },
  { label: "Tennis", emoji: "🎾", url: "/sports/tennis" },
  { label: "Cricket", emoji: "🏏", url: "/sports/cricket" },
  { label: "Rugby", emoji: "🏉", url: "/sports/rugby" },
  { label: "NFL", emoji: "🏈", url: "/sports/american-football" },
  { label: "MMA", emoji: "🥊", url: "/sports/mma" },
  { label: "Volleyball", emoji: "🏐", url: "/sports/volleyball" },
  { label: "Ice Hockey", emoji: "🏒", url: "/sports/ice-hockey" },
  { label: "Baseball", emoji: "⚾", url: "/sports/baseball" },
  { label: "Golf", emoji: "⛳", url: "/sports/golf" },
  { label: "Darts", emoji: "🎯", url: "/sports/darts" },
  { label: "Snooker", emoji: "🎱", url: "/sports/snooker" },
  { label: "Esports", emoji: "🎮", url: "/sports/esports" },
  { label: "Virtuals", emoji: "🤖", url: "/virtuals" },
  { label: "Casino", emoji: "🎰", url: "/casino" },
];

export const SportsQuickNav = () => {
  const location = useLocation();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-4">
      {SPORTS.map(sport => {
        const isActive = location.pathname === sport.url;
        return (
          <Link
            key={sport.label}
            to={sport.url}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg flex-shrink-0 transition-all min-w-[58px] text-center
              ${sport.highlight
                ? "bg-red-500/20 border border-red-500/40 hover:bg-red-500/30"
                : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
          >
            <span className="text-lg leading-none">{sport.emoji}</span>
            <span className={`text-[10px] font-medium leading-none whitespace-nowrap ${sport.highlight ? "text-red-400" : ""}`}>
              {sport.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
