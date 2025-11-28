import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import LiveMatchCard from "@/components/LiveMatchCard";
import LiveScoreRibbon from "@/components/LiveScoreRibbon";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

// Inline horse racing data
const LIVE_HORSE_RACES = [
  {
    id: "hr_001",
    match_id: "hr_001",
    sport_key: "horse_racing",
    sport_title: "Horse Racing",
    league_name: "Kentucky Derby",
    home_team: "Mystic Flight",
    away_team: "Thunder Bolt",
    commence_time: "2025-06-15T18:45:00Z",
    home_odds: 4.2,
    draw_odds: null,
    away_odds: 5.1,
    status: "live",
    updated_at: "2025-06-15T18:40:00Z"
  },
  {
    id: "hr_002",
    match_id: "hr_002",
    sport_key: "horse_racing",
    sport_title: "Horse Racing",
    league_name: "Royal Ascot",
    home_team: "Golden Mane",
    away_team: "Silver Stirrup",
    commence_time: "2025-06-15T19:15:00Z",
    home_odds: 3.8,
    draw_odds: null,
    away_odds: 6.0,
    status: "live",
    updated_at: "2025-06-15T19:10:00Z"
  },
  {
    id: "hr_003",
    match_id: "hr_003",
    sport_key: "horse_racing",
    sport_title: "Horse Racing",
    league_name: "Dubai World Cup",
    home_team: "Desert Storm",
    away_team: "Sand Phoenix",
    commence_time: "2025-06-15T19:45:00Z",
    home_odds: 2.9,
    draw_odds: null,
    away_odds: 7.2,
    status: "live",
    updated_at: "2025-06-15T19:40:00Z"
  }
];

const Live = () => {
  // State for live races with minute counter
  const [liveRaces, setLiveRaces] = useState(
    LIVE_HORSE_RACES.map(race => ({
      ...race,
      minute: 0,
      homeScore: 0,
      awayScore: 0
    }))
  );

  // Increment minute counter every 60 seconds
  useEffect(() => {
    const minuteInterval = setInterval(() => {
      setLiveRaces(prev =>
        prev.map(race => ({
          ...race,
          minute: race.minute + 1
        }))
      );
    }, 60000); // 60 seconds

    return () => clearInterval(minuteInterval);
  }, []);

  // Simulate real-time odds updates every 3 seconds
  useEffect(() => {
    const oddsInterval = setInterval(() => {
      setLiveRaces(prev =>
        prev.map(race => ({
          ...race,
          home_odds: Math.max(1.5, race.home_odds + (Math.random() - 0.5) * 0.3),
          away_odds: Math.max(1.5, race.away_odds + (Math.random() - 0.5) * 0.3)
        }))
      );
    }, 3000);

    return () => clearInterval(oddsInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          {/* Live Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Live Horse Racing</h1>
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          </div>

          <p className="text-muted-foreground mb-6">
            Watch and bet on live horse races with real-time odds updates
          </p>

          <LiveScoreRibbon />

          {/* Live Horse Races */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Racing Now</h2>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                {liveRaces.length} Races
              </Badge>
            </div>
            
            <div className="grid gap-4 md:gap-6">
              {liveRaces.map((race) => (
                <LiveMatchCard
                  key={race.id}
                  id={race.id}
                  sport={race.sport_title}
                  league={race.league_name}
                  homeTeam={race.home_team}
                  awayTeam={race.away_team}
                  homeScore={race.homeScore}
                  awayScore={race.awayScore}
                  minute={`${race.minute}'`}
                  homeOdds={race.home_odds}
                  drawOdds={race.draw_odds}
                  awayOdds={race.away_odds}
                  possession={null}
                  shots={null}
                  corners={null}
                  trending={race.minute < 5}
                />
              ))}
            </div>
          </section>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Live;
