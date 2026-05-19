import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Play, Search, Shield, TrendingUp,
  Crown, Users, Flame, Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Game data ───────────────────────────────────────────── */
interface Game {
  id: number;
  name: string;
  provider: string;
  category: string;
  minBet: number;
  multiplier: string;
  featured?: boolean;
  african?: boolean;
  provablyFair?: boolean;
  hot?: boolean;
  players?: number;
  slug?: string;          // internal React Router path: /games/<slug>
  externalUrl?: string;   // full page navigation (different frontend)
  externalProvider?: boolean; // third-party provider, not yet integrated
  new?: boolean;
  emoji?: string;         // override thumbnail emoji
}

const GAMES: Game[] = [
  // ── FuzGames Crash Games — LIVE (7 games, port 3001) ──
  { id: 101, name: "Fuz Hero",   provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, hot: true,  players: 4821, new: true, externalUrl: "/games/fuz-hero/",   emoji: "🚀" },
  { id: 102, name: "Fuz Jet",    provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, hot: true,  players: 2103, new: true, externalUrl: "/games/fuz-jet/",    emoji: "✈️" },
  { id: 103, name: "Fuz Rocket", provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, players: 1887, new: true, externalUrl: "/games/fuz-rocket/",  emoji: "🛸" },
  { id: 104, name: "Fuz Rush",   provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, players: 1542, new: true, externalUrl: "/games/fuz-rush/",    emoji: "⚡" },
  { id: 105, name: "Fuz Rider",  provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, players: 1230, new: true, externalUrl: "/games/fuz-rider/",   emoji: "🏍️" },
  { id: 106, name: "Fuz Naira",  provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, hot: true,  players: 3104, new: true, externalUrl: "/games/fuz-naira/",  emoji: "💰" },
  { id: 107, name: "Fuz Bird",   provider: "FuzGames", category: "Crash", minBet: 100, multiplier: "1x–1000x+", featured: true, african: true, provablyFair: true, players: 987,  new: true, externalUrl: "/games/fuz-bird/",   emoji: "🦅" },

  // ── FuzGames Instant Games — LIVE ──
  { id: 201, name: "Fuz Wheel", provider: "FuzGames", category: "Spin",  minBet: 100, multiplier: "1.5x–50x", featured: true, african: true, provablyFair: true, hot: true, players: 2341, new: true, externalUrl: "/games/fuz-wheel/", emoji: "🎡" },
  { id: 202, name: "Fuz Dice",  provider: "FuzGames", category: "Dice",  minBet: 50,  multiplier: "1.02x–49x", featured: true, african: true, provablyFair: true,           players: 1654, new: true, externalUrl: "/games/fuz-dice/",  emoji: "🎲" },
  { id: 203, name: "Fuz Mines", provider: "FuzGames", category: "Mines", minBet: 50,  multiplier: "1x–???",    featured: true, african: true, provablyFair: true, hot: true, players: 1932, new: true, externalUrl: "/games/fuz-mines/", emoji: "💣" },

  // ── Traditional African Games — LIVE (real engine + Supabase) ──
  { id: 41, name: "African Draft", provider: "FuzGames", category: "Traditional", minBet: 500, multiplier: "2x–20x",  featured: true, african: true, provablyFair: true, hot: true, players: 3241, slug: "african-draft" },
  { id: 42, name: "Morabaraba",    provider: "FuzGames", category: "Traditional", minBet: 300, multiplier: "2x–15x",  featured: true, african: true, provablyFair: true,           players: 1820, slug: "morabaraba" },
  { id: 43, name: "Mancala",       provider: "FuzGames", category: "Traditional", minBet: 200, multiplier: "2x–12x",  featured: true, african: true, provablyFair: true,           players: 2105, slug: "mancala" },
];

/* ── Category config ─────────────────────────────────────── */
const CATEGORIES = [
  { id: "All",         label: "All",     icon: Shuffle,    color: "from-zinc-700 to-zinc-900" },
  { id: "Crash",       label: "Crash",   icon: TrendingUp, color: "from-red-600 to-rose-900",     emoji: "🚀" },
  { id: "Spin",        label: "Spin",    icon: TrendingUp, color: "from-yellow-500 to-amber-800", emoji: "🎡" },
  { id: "Dice",        label: "Dice",    icon: Shuffle,    color: "from-blue-600 to-blue-900",    emoji: "🎲" },
  { id: "Mines",       label: "Mines",   icon: Shuffle,    color: "from-orange-600 to-orange-900",emoji: "💣" },
  { id: "Traditional", label: "African", icon: Crown,      color: "from-yellow-600 to-amber-900", emoji: "🏺" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function formatPlayers(n?: number) {
  if (!n) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/* ── Game thumbnail ──────────────────────────────────────── */
function GameThumb({ game }: { game: Game }) {
  const cat = CAT_MAP[game.category] ?? CATEGORIES[0];
  return (
    <div className={cn(
      "w-full aspect-[4/3] bg-gradient-to-br relative overflow-hidden",
      cat.color
    )}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl select-none drop-shadow-lg">{game.emoji ?? cat.emoji ?? "🎮"}</span>
      </div>
      {/* Status badges */}
      <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
        {game.african && (
          <span className="text-[9px] bg-green-600 text-white font-bold px-1.5 py-0.5 rounded-full">🇳🇬 NG</span>
        )}
        {game.new && (
          <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">NEW</span>
        )}
      </div>
      {game.provablyFair && (
        <div className="absolute top-1.5 right-1.5 bg-black/40 rounded-full p-1" title="Provably Fair">
          <Shield className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      {game.players && (
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/50 rounded-full px-1.5 py-0.5">
          <Users className="w-2 h-2 text-green-400" />
          <span className="text-[8px] text-green-400 font-bold">{formatPlayers(game.players)}</span>
        </div>
      )}
      {game.hot && (
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-orange-500/80 rounded-full px-1.5 py-0.5">
          <Flame className="w-2 h-2 text-white" />
          <span className="text-[8px] text-white font-bold">HOT</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Play className="w-4 h-4 text-black fill-black" />
        </div>
        <span className="text-[10px] text-white font-bold bg-white/20 px-2 py-0.5 rounded-full">Play Now</span>
      </div>
    </div>
  );
}

/* ── Game card ───────────────────────────────────────────── */
function GameCard({ game, large }: { game: Game; large?: boolean }) {
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.externalUrl) { window.location.href = game.externalUrl; return; }
    if (game.slug) { navigate(`/games/${game.slug}`); return; }
  };

  return (
    <div
      className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
      onClick={handlePlay}
    >
      <GameThumb game={game} />
      <div className={cn("px-2 py-1.5", large && "px-3 py-2")}>
        <p className={cn("font-bold truncate leading-tight", large ? "text-sm" : "text-xs")}>{game.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] text-muted-foreground truncate">{game.provider}</span>
          <span className="text-[9px] text-primary font-bold shrink-0 ml-1">₦{game.minBet.toLocaleString()}+</span>
        </div>
      </div>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, count, emoji }: {
  icon: React.ElementType; label: string; count?: number; emoji?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base leading-none">{emoji}</span>
      <h2 className="text-sm font-bold text-foreground">{label}</h2>
      {count != null && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1">{count}</Badge>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
const Games = () => {
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => GAMES.filter(g => {
    const matchCat    = activeCat === "All" || g.category === activeCat;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [activeCat, search]);

  const hot      = GAMES.filter(g => g.hot);
  const fuzCrash = GAMES.filter(g => g.category === "Crash");
  const african  = GAMES.filter(g => g.category === "Traditional");

  const showSections = activeCat === "All" && !search;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* Hero banner */}
          <div className="bg-gradient-to-r from-violet-800 via-purple-900 to-indigo-900 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">FuzGames</h1>
                <p className="text-xs text-white/60 mt-0.5">Crash · African Originals · Strategy</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-white/15 text-white border-white/20 text-[9px] gap-1">
                  <Shield className="w-2.5 h-2.5" /> {GAMES.filter(g => g.provablyFair).length} Provably Fair
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[9px]">
                  🇳🇬 {GAMES.filter(g => g.african).length} Nigerian Games
                </Badge>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 md:px-4 pt-3 pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search games…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-muted border-0"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="sticky top-0 z-10 bg-background border-b border-border mt-3">
            <div className="flex overflow-x-auto scrollbar-hide px-3 md:px-4 gap-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setSearch(""); }}
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap",
                    activeCat === cat.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 md:px-4 py-4 space-y-6">

            {/* Filtered / search results */}
            {!showSections && (
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  {filtered.length} game{filtered.length !== 1 ? "s" : ""}
                  {search ? ` matching "${search}"` : ` in ${CAT_MAP[activeCat]?.label ?? activeCat}`}
                </p>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-2">
                    <span className="text-3xl">🎮</span>
                    <p className="text-sm text-muted-foreground">No games found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {filtered.map(g => <GameCard key={g.id} game={g} />)}
                  </div>
                )}
              </div>
            )}

            {/* Default sections view */}
            {showSections && (
              <>
                {/* Hot right now */}
                <section>
                  <SectionHeader icon={Flame} label="Hot Right Now" emoji="🔥" />
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {hot.slice(0, 4).map(g => <GameCard key={g.id} game={g} large />)}
                  </div>
                </section>

                {/* FuzGames Crash — 7 live games */}
                <section>
                  <SectionHeader icon={TrendingUp} label="FuzGames Crash — Live Now" count={fuzCrash.length} emoji="🚀" />
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {fuzCrash.map(g => <GameCard key={g.id} game={g} />)}
                  </div>
                </section>

                {/* Traditional African */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🏺</span>
                    <h2 className="text-sm font-bold">Traditional African Games</h2>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px]">P2P · vs AI</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {african.map(g => <GameCard key={g.id} game={g} large />)}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Games;
