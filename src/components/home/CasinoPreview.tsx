import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const CASINO_GAMES = [
  { name: "Slots",      emoji: "🎰", url: "/casino/slots",      gradient: "from-purple-600 to-purple-900",  badge: "100+ Games" },
  { name: "Blackjack",  emoji: "🃏", url: "/casino/blackjack",  gradient: "from-emerald-600 to-emerald-900", badge: "Live Dealer" },
  { name: "Roulette",   emoji: "🎡", url: "/casino/roulette",   gradient: "from-red-600 to-red-900",         badge: "Live" },
  { name: "Baccarat",   emoji: "👑", url: "/casino/baccarat",   gradient: "from-yellow-600 to-yellow-900",   badge: "VIP" },
  { name: "Crash",      emoji: "🚀", url: "/casino/crash",      gradient: "from-blue-600 to-blue-900",       badge: "Popular" },
  { name: "Poker",      emoji: "♠️", url: "/casino/poker",      gradient: "from-slate-600 to-slate-900",     badge: "Multi-table" },
];

const VIRTUAL_SPORTS = [
  { name: "Virtual Football", emoji: "⚽", url: "/virtuals",       gradient: "from-green-600 to-green-900" },
  { name: "Virtual Racing",   emoji: "🏎",  url: "/racing/f1",      gradient: "from-orange-600 to-orange-900" },
  { name: "Virtual Horses",   emoji: "🐎",  url: "/racing/horse",   gradient: "from-amber-600 to-amber-900" },
  { name: "Virtual Dogs",     emoji: "🐕",  url: "/racing/dogs",    gradient: "from-teal-600 to-teal-900" },
];

export const CasinoPreview = () => (
  <div className="mb-4 space-y-4">
    {/* Casino */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground">🎰 Casino Games</h2>
        <Link to="/casino" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          All Games <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {CASINO_GAMES.map(g => (
          <Link
            key={g.name}
            to={g.url}
            className={`relative overflow-hidden bg-gradient-to-b ${g.gradient} rounded-xl p-3 flex flex-col items-center gap-1.5 hover:scale-105 transition-transform text-center`}
          >
            <span className="text-2xl">{g.emoji}</span>
            <span className="text-xs font-bold text-white leading-tight">{g.name}</span>
            <span className="text-[9px] bg-white/20 text-white/90 px-1.5 py-0.5 rounded-full">{g.badge}</span>
          </Link>
        ))}
      </div>
    </div>

    {/* Virtual Sports */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground">🤖 Virtual Sports</h2>
        <Link to="/virtuals" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          All Virtuals <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {VIRTUAL_SPORTS.map(v => (
          <Link
            key={v.name}
            to={v.url}
            className={`bg-gradient-to-r ${v.gradient} rounded-xl p-3 flex items-center gap-2.5 hover:opacity-90 transition-opacity`}
          >
            <span className="text-2xl flex-shrink-0">{v.emoji}</span>
            <span className="text-xs font-bold text-white leading-tight">{v.name}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);
