import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import LiveMatchCard from "@/components/LiveMatchCard";
import PersonalizedSuggestions from "@/components/PersonalizedSuggestions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame } from "lucide-react";

const Live = () => {
  const [liveMatches, setLiveMatches] = useState([
    {
      id: "live-1",
      sport: "Football",
      league: "Premier League",
      homeTeam: "Manchester City",
      awayTeam: "Arsenal",
      homeScore: 2,
      awayScore: 1,
      minute: "67'",
      homeOdds: 1.45,
      drawOdds: 4.20,
      awayOdds: 7.50,
      possession: { home: 58, away: 42 },
      shots: { home: 12, away: 8 },
      corners: { home: 5, away: 3 },
      trending: true,
    },
    {
      id: "live-2",
      sport: "Basketball",
      league: "NBA",
      homeTeam: "LA Lakers",
      awayTeam: "Boston Celtics",
      homeScore: 89,
      awayScore: 92,
      minute: "Q3 8:23",
      homeOdds: 2.10,
      drawOdds: null,
      awayOdds: 1.75,
      possession: null,
      shots: null,
      corners: null,
      trending: true,
    },
    {
      id: "live-3",
      sport: "Football",
      league: "La Liga",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeScore: 1,
      awayScore: 1,
      minute: "82'",
      homeOdds: 2.80,
      drawOdds: 3.10,
      awayOdds: 2.90,
      possession: { home: 52, away: 48 },
      shots: { home: 14, away: 11 },
      corners: { home: 7, away: 6 },
      trending: false,
    },
    {
      id: "live-4",
      sport: "Tennis",
      league: "ATP Masters",
      homeTeam: "Novak Djokovic",
      awayTeam: "Carlos Alcaraz",
      homeScore: 2,
      awayScore: 1,
      minute: "Set 4",
      homeOdds: 1.65,
      drawOdds: null,
      awayOdds: 2.30,
      possession: null,
      shots: null,
      corners: null,
      trending: false,
    },
    {
      id: "live-5",
      sport: "Football",
      league: "Serie A",
      homeTeam: "AC Milan",
      awayTeam: "Inter Milan",
      homeScore: 0,
      awayScore: 0,
      minute: "34'",
      homeOdds: 2.20,
      drawOdds: 3.00,
      awayOdds: 3.40,
      possession: { home: 45, away: 55 },
      shots: { home: 4, away: 6 },
      corners: { home: 2, away: 4 },
      trending: false,
    },
    {
      id: "live-6",
      sport: "American Football",
      league: "NFL",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      homeScore: 21,
      awayScore: 17,
      minute: "Q3 5:12",
      homeOdds: 1.55,
      drawOdds: null,
      awayOdds: 2.50,
      possession: null,
      shots: null,
      corners: null,
      trending: true,
    },
  ]);

  // Simulate real-time odds updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatches((prev) =>
        prev.map((match) => ({
          ...match,
          homeOdds: Math.max(1.01, match.homeOdds + (Math.random() - 0.5) * 0.1),
          drawOdds: match.drawOdds ? Math.max(1.01, match.drawOdds + (Math.random() - 0.5) * 0.15) : null,
          awayOdds: Math.max(1.01, match.awayOdds + (Math.random() - 0.5) * 0.1),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const trendingMatches = liveMatches.filter((m) => m.trending);
  const footballMatches = liveMatches.filter((m) => m.sport === "Football");
  const basketballMatches = liveMatches.filter((m) => m.sport === "Basketball");
  const otherMatches = liveMatches.filter((m) => m.sport !== "Football" && m.sport !== "Basketball");

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
            <h1 className="text-3xl font-bold text-foreground">Live Betting</h1>
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          </div>

          <p className="text-muted-foreground mb-6">
            Watch and bet on live matches with real-time odds updates
          </p>

          {/* Personalized Suggestions */}
          <section className="mb-8">
            <PersonalizedSuggestions />
          </section>

          {/* Trending Now Section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
              <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
                Hot 🔥
              </Badge>
            </div>
            <div className="grid gap-4">
              {trendingMatches.map((match) => (
                <LiveMatchCard key={match.id} {...match} />
              ))}
            </div>
          </section>

          {/* Live Matches by Sport */}
          <section>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All Live ({liveMatches.length})
                </TabsTrigger>
                <TabsTrigger value="football">
                  ⚽ Football ({footballMatches.length})
                </TabsTrigger>
                <TabsTrigger value="basketball">
                  🏀 Basketball ({basketballMatches.length})
                </TabsTrigger>
                <TabsTrigger value="other">
                  🎾 Other ({otherMatches.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {liveMatches.map((match) => (
                  <LiveMatchCard key={match.id} {...match} />
                ))}
              </TabsContent>

              <TabsContent value="football" className="space-y-4">
                {footballMatches.map((match) => (
                  <LiveMatchCard key={match.id} {...match} />
                ))}
              </TabsContent>

              <TabsContent value="basketball" className="space-y-4">
                {basketballMatches.map((match) => (
                  <LiveMatchCard key={match.id} {...match} />
                ))}
              </TabsContent>

              <TabsContent value="other" className="space-y-4">
                {otherMatches.map((match) => (
                  <LiveMatchCard key={match.id} {...match} />
                ))}
              </TabsContent>
            </Tabs>
          </section>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Live;
