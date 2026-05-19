import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const TOURNAMENTS = [
  { name: "Australian Open",     surface: "Hard",    matches: 32, emoji: "🎾", url: "/tennis/australian-open" },
  { name: "French Open",         surface: "Clay",    matches: 28, emoji: "🎾", url: "/tennis/french-open" },
  { name: "Wimbledon",           surface: "Grass",   matches: 24, emoji: "🎾", url: "/tennis/wimbledon" },
  { name: "US Open",             surface: "Hard",    matches: 30, emoji: "🎾", url: "/tennis/us-open" },
  { name: "ATP Masters 1000",    surface: "Various", matches: 16, emoji: "🎾", url: "/tennis/atp-masters-1000" },
  { name: "WTA Finals",          surface: "Hard",    matches: 8,  emoji: "🎾", url: "/tennis/wta-finals" },
];

const SURFACE_COLOR: Record<string, string> = {
  Hard:    "bg-blue-500/15 text-blue-400",
  Clay:    "bg-orange-500/15 text-orange-400",
  Grass:   "bg-green-500/15 text-green-400",
  Various: "bg-muted text-muted-foreground",
};

const Tennis = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="flex">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 px-4 md:px-6 py-3 flex items-center gap-2">
          <span className="text-xl">🎾</span>
          <h1 className="text-sm font-bold text-white">Tennis</h1>
        </div>

        <div className="px-4 md:px-6 py-3 space-y-2">
          {TOURNAMENTS.map(t => (
            <Link
              key={t.name}
              to={t.url}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{t.name}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SURFACE_COLOR[t.surface] ?? SURFACE_COLOR.Various}`}>
                  {t.surface}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">{t.matches}</p>
                <p className="text-[10px] text-muted-foreground">matches</p>
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

export default Tennis;
