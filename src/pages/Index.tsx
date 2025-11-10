import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import HeroBanner from "@/components/HeroBanner";
import MatchCard from "@/components/MatchCard";
import BoostCard from "@/components/BoostCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const categories = [
    { label: "Today's Football", url: "/sports/football" },
    { label: "Premier League", url: "/football/premier-league" },
    { label: "Champions League", url: "/football/champions-league" },
    { label: "NFL", url: "/sports/american-football" },
    { label: "NBA", url: "/sports/basketball" },
  ];

  const featuredMatches = [
    // Football
    {
      sport: "Football",
      league: "Premier League",
      time: "Today 15:00",
      homeTeam: "Manchester United",
      awayTeam: "Liverpool FC",
      homeOdds: "3.60",
      drawOdds: "3.30",
      awayOdds: "2.00",
    },
    {
      sport: "Football",
      league: "La Liga",
      time: "Today 17:30",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeOdds: "2.15",
      drawOdds: "3.40",
      awayOdds: "3.20",
    },
    // NBA
    {
      sport: "Basketball",
      league: "NBA",
      time: "Today 19:00",
      homeTeam: "LA Lakers",
      awayTeam: "Golden State Warriors",
      homeOdds: "1.85",
      drawOdds: null,
      awayOdds: "1.95",
    },
    {
      sport: "Basketball",
      league: "NBA",
      time: "Today 21:30",
      homeTeam: "Boston Celtics",
      awayTeam: "Miami Heat",
      homeOdds: "1.70",
      drawOdds: null,
      awayOdds: "2.20",
    },
    // NFL
    {
      sport: "American Football",
      league: "NFL",
      time: "Today 18:00",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      homeOdds: "1.90",
      drawOdds: null,
      awayOdds: "1.90",
    },
    // Tennis
    {
      sport: "Tennis",
      league: "ATP Masters",
      time: "Today 16:00",
      homeTeam: "Novak Djokovic",
      awayTeam: "Carlos Alcaraz",
      homeOdds: "2.10",
      drawOdds: null,
      awayOdds: "1.75",
    },
  ];

  const boosts = [
    {
      title: "Triple Treble Boost",
      description: "Featured Bet Builder - Premier League • Today 15:00",
      wasOdds: "3/1",
      nowOdds: "4/1",
    },
    {
      title: "Champions League Special",
      description: "Featured Acca - Champions League • Tomorrow 20:45",
      wasOdds: "5/2",
      nowOdds: "3/1",
    },
    {
      title: "Weekend Accumulator",
      description: "Featured Double - Top Leagues • Tomorrow 14:45",
      wasOdds: "6/4",
      nowOdds: "2/1",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <HeroBanner />

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 pr-20">
            {categories.map((category) => (
              <Button
                key={category.label}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
                asChild
              >
                <Link to={category.url}>{category.label}</Link>
              </Button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Featured Matches</h2>
            
            {/* Football Matches */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>⚽</span> Football
              </h3>
              <div className="grid gap-4">
                {featuredMatches.filter(m => m.sport === "Football").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>

            {/* Basketball Matches */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🏀</span> Basketball
              </h3>
              <div className="grid gap-4">
                {featuredMatches.filter(m => m.sport === "Basketball").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>

            {/* NFL Matches */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🏈</span> American Football
              </h3>
              <div className="grid gap-4">
                {featuredMatches.filter(m => m.sport === "American Football").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>

            {/* Tennis Matches */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🎾</span> Tennis
              </h3>
              <div className="grid gap-4">
                {featuredMatches.filter(m => m.sport === "Tennis").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-full bg-primary/20 p-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Boosts</h2>
            </div>
            <div className="grid gap-4">
              {boosts.map((boost, index) => (
                <BoostCard key={index} {...boost} />
              ))}
            </div>
          </section>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Index;

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
