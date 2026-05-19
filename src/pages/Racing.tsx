import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Clock, MapPin, ChevronRight } from "lucide-react";

const TABS = ["All Races", "UK", "Ireland", "International", "Results"];

interface Race {
  id: string;
  venue: string;
  country: string;
  startAt: Date;
  distance: string;
  raceClass: string;
  going: string;
  runners: Runner[];
}

interface Runner {
  number: number;
  name: string;
  jockey: string;
  trainer: string;
  odds: number;
}

const RACES: Race[] = [
  {
    id: "r1",
    venue: "Ascot",
    country: "UK",
    startAt: new Date(Date.now() + 4 * 60 * 1000),
    distance: "1m 4f",
    raceClass: "Class 2",
    going: "Good to Firm",
    runners: [
      { number: 1, name: "Thunder Strike",   jockey: "F. Dettori",  trainer: "J. Smith",    odds: 2.5 },
      { number: 2, name: "Golden Arrow",     jockey: "R. Moore",    trainer: "A. O'Brien",  odds: 3.0 },
      { number: 3, name: "Silver Bullet",    jockey: "P. Hanagan",  trainer: "R. Fahey",    odds: 5.0 },
      { number: 4, name: "Midnight Runner",  jockey: "W. Buick",    trainer: "C. Appleby",  odds: 4.0 },
    ],
  },
  {
    id: "r2",
    venue: "Cheltenham",
    country: "UK",
    startAt: new Date(Date.now() + 18 * 60 * 1000),
    distance: "2m 3f",
    raceClass: "Class 1",
    going: "Soft",
    runners: [
      { number: 1, name: "Desert King",     jockey: "N. Fehily",   trainer: "N. Henderson", odds: 3.5 },
      { number: 2, name: "Brave Spirit",    jockey: "D. Jacob",    trainer: "P. Nicholls",  odds: 4.5 },
      { number: 3, name: "Lucky Charm",     jockey: "A. Coleman",  trainer: "W. Mullins",   odds: 2.0 },
    ],
  },
  {
    id: "r3",
    venue: "Leopardstown",
    country: "IRE",
    startAt: new Date(Date.now() + 36 * 60 * 1000),
    distance: "1m 2f",
    raceClass: "Grade 1",
    going: "Yielding",
    runners: [
      { number: 1, name: "Irish Rose",      jockey: "R. Walsh",    trainer: "W. Mullins",   odds: 1.8 },
      { number: 2, name: "Galway Storm",    jockey: "P. Townend",  trainer: "G. Elliott",   odds: 6.0 },
      { number: 3, name: "Celtic Pride",    jockey: "D. Casey",    trainer: "J. Harrington",odds: 3.5 },
    ],
  },
];

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, targetDate.getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(Math.max(0, targetDate.getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  const m = Math.floor(timeLeft / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  return timeLeft === 0 ? "Starting" : `${m}:${s.toString().padStart(2, "0")}`;
};

interface RaceCardProps { race: Race }

const RaceCard = ({ race }: RaceCardProps) => {
  const countdown = useCountdown(race.startAt);
  const { addSelection } = useBetSlip();
  const [expanded, setExpanded] = useState(false);

  const bet = (runner: Runner) =>
    addSelection({
      id: `${race.id}-${runner.number}`,
      matchId: race.id,
      homeTeam: runner.name,
      awayTeam: "",
      league: race.venue,
      sport: "Horse Racing",
      selectionType: "home",
      selectionValue: runner.name,
      odds: runner.odds,
      matchTime: race.startAt.toISOString(),
    });

  const isLive = countdown === "Starting";

  return (
    <div className="bg-card rounded-xl border border-border mb-2 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ${isLive ? "bg-red-500 text-white animate-pulse" : "bg-primary/10 text-primary"}`}>
            {countdown}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-bold truncate">{race.venue}</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0">{race.country}</Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span>{race.raceClass}</span>
              <span>·</span>
              <span>{race.distance}</span>
              <span>·</span>
              <span>{race.going}</span>
              <span>·</span>
              <span>{race.runners.length} runners</span>
            </div>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </div>

      {expanded && (
        <div className="border-t border-border/50 px-3 pb-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold uppercase py-1.5 border-b border-border/30 mb-1">
            <span>Runner</span>
            <span>Jockey / Trainer</span>
            <span>Odds</span>
          </div>
          {race.runners.map(runner => (
            <div key={runner.number} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold flex-shrink-0">{runner.number}</span>
                <span className="text-xs font-semibold truncate">{runner.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground text-center px-2">
                <div>{runner.jockey}</div>
                <div>{runner.trainer}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-14 text-[11px] font-bold text-primary border-border hover:border-primary hover:bg-primary/10 flex-shrink-0"
                onClick={() => bet(runner)}
              >
                {runner.odds.toFixed(2)}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Racing = () => {
  const [activeTab, setActiveTab] = useState("All Races");

  const filtered = RACES.filter(r => {
    if (activeTab === "All Races") return true;
    if (activeTab === "UK") return r.country === "UK";
    if (activeTab === "Ireland") return r.country === "IRE";
    if (activeTab === "International") return !["UK", "IRE"].includes(r.country);
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 to-orange-800 px-4 md:px-6 py-3 flex items-center gap-2">
            <span className="text-xl">🏇</span>
            <div>
              <h1 className="text-sm font-bold text-white">Horse Racing</h1>
              <p className="text-[11px] text-white/70">Today's Race Cards</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-0 border-b border-border bg-card overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="px-4 md:px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{filtered.length} races today</span>
              </div>
            </div>
            {filtered.map(race => <RaceCard key={race.id} race={race} />)}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No races found for this filter</div>
            )}
          </div>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Racing;
