import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Play, Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────── */
interface Matchup {
  home: string;
  away: string;
  homeOdds: number;
  drawOdds?: number;
  awayOdds: number;
}

interface VirtualGame {
  id: string;
  name: string;
  emoji: string;
  category: string;
  frequencySeconds: number;
  description: string;
  path?: string;
  hot?: boolean;
  matchups: Matchup[];
}

/* ── Data ────────────────────────────────────────────────── */
const VIRTUAL_GAMES: VirtualGame[] = [
  {
    id: "vfl",
    name: "Virtual Football League",
    emoji: "⚽",
    category: "Football",
    frequencySeconds: 3 * 60,
    description: "Realistic virtual football · 2-min matches",
    hot: true,
    matchups: [
      { home: "Virtual Arsenal",   away: "Virtual City",    homeOdds: 2.20, drawOdds: 3.10, awayOdds: 3.50 },
      { home: "Virtual Madrid",    away: "Virtual Bayern",  homeOdds: 2.40, drawOdds: 3.00, awayOdds: 3.10 },
      { home: "Virtual PSG",       away: "Virtual Chelsea", homeOdds: 1.90, drawOdds: 3.40, awayOdds: 4.20 },
    ],
  },
  {
    id: "vfwc",
    name: "Virtual World Cup",
    emoji: "🌍",
    category: "Football",
    frequencySeconds: 5 * 60,
    description: "International virtual football tournament",
    matchups: [
      { home: "V. Nigeria",  away: "V. Brazil",   homeOdds: 4.50, drawOdds: 3.30, awayOdds: 1.80 },
      { home: "V. France",   away: "V. Germany",  homeOdds: 2.10, drawOdds: 3.20, awayOdds: 3.60 },
    ],
  },
  {
    id: "vhr",
    name: "Virtual Horse Racing",
    emoji: "🏇",
    category: "Racing",
    frequencySeconds: 2 * 60,
    description: "24/7 horse racing · results every 2 min",
    matchups: [
      { home: "Thunder Strike",  away: "Golden Arrow",   homeOdds: 2.50, awayOdds: 3.00 },
      { home: "Silver Bullet",   away: "Night Rider",    homeOdds: 4.00, awayOdds: 2.20 },
      { home: "Storm Chaser",    away: "Desert Wind",    homeOdds: 3.10, awayOdds: 2.70 },
    ],
  },
  {
    id: "vg",
    name: "Virtual Greyhounds",
    emoji: "🐕",
    category: "Racing",
    frequencySeconds: 90,
    description: "Fastest virtual — results every 90 seconds",
    hot: true,
    matchups: [
      { home: "Trap 1 – Lightning",  away: "Trap 3 – Blaze",   homeOdds: 3.00, awayOdds: 2.50 },
      { home: "Trap 2 – Rocket",     away: "Trap 6 – Phantom",  homeOdds: 2.80, awayOdds: 2.90 },
    ],
  },
  {
    id: "f1",
    name: "AI-Powered F1 Racing",
    emoji: "🏎️",
    category: "Racing",
    frequencySeconds: 6 * 60,
    description: "AI-generated Formula 1 with live commentary",
    hot: true,
    path: "/racing/f1",
    matchups: [
      { home: "V. Hamilton",    away: "V. Verstappen", homeOdds: 2.00, awayOdds: 1.90 },
      { home: "V. Leclerc",     away: "V. Norris",     homeOdds: 2.30, awayOdds: 2.10 },
    ],
  },
  {
    id: "vb",
    name: "Virtual Basketball",
    emoji: "🏀",
    category: "Other",
    frequencySeconds: 4 * 60,
    description: "NBA-style virtual games",
    matchups: [
      { home: "V. Lakers",   away: "V. Celtics",  homeOdds: 1.85, awayOdds: 2.10 },
      { home: "V. Warriors", away: "V. Heat",     homeOdds: 1.70, awayOdds: 2.30 },
    ],
  },
  {
    id: "vt",
    name: "Virtual Tennis",
    emoji: "🎾",
    category: "Other",
    frequencySeconds: 5 * 60,
    description: "Grand Slam virtual tennis matches",
    matchups: [
      { home: "V. Djokovic", away: "V. Alcaraz",  homeOdds: 1.75, awayOdds: 2.20 },
      { home: "V. Sinner",   away: "V. Medvedev", homeOdds: 1.90, awayOdds: 2.00 },
    ],
  },
];

const CATEGORY_TABS = ["All", "Football", "Racing", "Other"];

/* ── Countdown hook ──────────────────────────────────────── */
const useCountdown = (frequencySeconds: number, offsetSeconds = 0) => {
  const [remaining, setRemaining] = useState(() => {
    const now = Math.floor(Date.now() / 1000);
    return frequencySeconds - ((now + offsetSeconds) % frequencySeconds);
  });

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(r => (r <= 1 ? frequencySeconds : r - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [frequencySeconds]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${m}:${s.toString().padStart(2, "0")}`;

  return { display, urgent: remaining <= 10 };
};

/* ── Odds Button ─────────────────────────────────────────── */
const OddsBtn = ({
  label, odds, onClick,
}: { label: string; odds: number; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-[52px] h-9 rounded bg-muted hover:bg-primary/10 hover:border-primary border border-transparent transition-colors active:scale-95"
  >
    <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    <span className="text-xs font-bold text-primary leading-tight tabular-nums">{odds.toFixed(2)}</span>
  </button>
);

/* ── Game Card ───────────────────────────────────────────── */
const GameCard = ({ game, index }: { game: VirtualGame; index: number }) => {
  const { display, urgent } = useCountdown(game.frequencySeconds, index * 23);
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();

  // Each matchup gets a stable unique matchId so selections from different
  // matchups within the same game can coexist in the bet slip.
  const matchupId = (matchup: Matchup) =>
    `${game.id}-${matchup.home.replace(/\s+/g, "")}-${matchup.away.replace(/\s+/g, "")}`;

  const bet = (matchup: Matchup, side: "home" | "draw" | "away") => {
    const odds =
      side === "home" ? matchup.homeOdds
      : side === "draw" ? matchup.drawOdds!
      : matchup.awayOdds;
    const val =
      side === "home" ? matchup.home
      : side === "draw" ? "Draw"
      : matchup.away;

    const mid = matchupId(matchup);
    addSelection({
      id: `${mid}-${side}`,
      matchId: mid,
      homeTeam: matchup.home,
      awayTeam: matchup.away,
      league: game.name,
      sport: "Virtuals",
      selectionType: side,
      selectionValue: val,
      odds,
      matchTime: new Date().toISOString(),
    });
  };

  return (
    <div className="mb-2 border border-border rounded-lg overflow-hidden bg-card">
      {/* Game header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/30">
        <span className="text-lg flex-shrink-0">{game.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold truncate">{game.name}</span>
            {game.hot && (
              <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 flex-shrink-0">HOT</Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">{game.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Countdown */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={cn(
              "text-xs font-bold tabular-nums",
              urgent ? "text-red-400 animate-pulse" : "text-foreground"
            )}>
              {display}
            </span>
          </div>
          {game.path && (
            <button
              onClick={() => navigate(game.path!)}
              className="flex items-center gap-1 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-1 rounded transition-colors hover:bg-primary/90 active:scale-95"
            >
              <Play className="w-2.5 h-2.5" />
              Play
            </button>
          )}
        </div>
      </div>

      {/* Matchup rows */}
      {game.matchups.map((m, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">{m.home}</p>
            <p className="text-xs text-muted-foreground truncate leading-tight">{m.away}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <OddsBtn label="1" odds={m.homeOdds} onClick={() => bet(m, "home")} />
            {m.drawOdds != null && (
              <OddsBtn label="X" odds={m.drawOdds} onClick={() => bet(m, "draw")} />
            )}
            <OddsBtn label="2" odds={m.awayOdds} onClick={() => bet(m, "away")} />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────── */
const Virtuals = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? VIRTUAL_GAMES
    : VIRTUAL_GAMES.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Gradient header */}
          <div className="bg-gradient-to-r from-violet-700 to-purple-900 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-sm font-bold text-white">Virtual Sports</h1>
                <p className="text-[11px] text-white/70">24/7 instant results — bet anytime</p>
              </div>
              <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[10px]">
                {VIRTUAL_GAMES.length} games
              </Badge>
            </div>
          </div>

          {/* Category filter — flat border-bottom tabs */}
          <div className="flex border-b border-border bg-card">
            {CATEGORY_TABS.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap",
                  activeCategory === cat
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Game cards */}
          <div className="px-4 md:px-6 py-3">
            {filtered.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </div>

        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Virtuals;
