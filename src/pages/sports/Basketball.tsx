import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";

const LEAGUES = [
  { name: "NBA",             country: "USA",    emoji: "🏀", url: "/basketball/nba" },
  { name: "EuroLeague",      country: "Europe", emoji: "🏀", url: "/basketball/euroleague" },
  { name: "WNBA",            country: "USA",    emoji: "🏀", url: "/basketball/wnba" },
  { name: "Spanish ACB",     country: "Spain",  emoji: "🇪🇸", url: "/basketball/spanish-acb" },
  { name: "NCAA Basketball", country: "USA",    emoji: "🏀", url: "/basketball/ncaa-basketball" },
];

const LeagueLogo = ({ name, emoji }: { name: string; emoji: string }) => {
  const [err, setErr] = useState(false);
  const url = LEAGUE_LOGOS[name];
  if (url && !err) {
    return (
      <img src={url} alt={name}
        className="w-8 h-8 object-contain flex-shrink-0"
        onError={() => setErr(true)}
      />
    );
  }
  return <span className="text-xl flex-shrink-0">{emoji}</span>;
};

const Basketball = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="flex">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
        <div className="bg-gradient-to-r from-blue-700 to-red-800 px-4 py-2.5 flex items-center gap-2">
          <span className="text-lg">🏀</span>
          <h1 className="text-sm font-bold text-white">Basketball</h1>
        </div>

        <div className="px-3 py-2 space-y-1.5">
          {LEAGUES.map(league => (
            <Link
              key={league.name}
              to={league.url}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <LeagueLogo name={league.name} emoji={league.emoji} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{league.name}</p>
                <p className="text-[11px] text-muted-foreground">{league.country}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </main>
      <BetSlip className="hidden md:flex" />
    </div>
  </div>
);

export default Basketball;
