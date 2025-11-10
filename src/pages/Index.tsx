import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import HeroBanner from "@/components/HeroBanner";
import MatchCard from "@/components/MatchCard";
import BoostCard from "@/components/BoostCard";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Import league logos
import premierLeagueLogo from "@/assets/leagues/premier-league.png";
import championsLeagueLogo from "@/assets/leagues/champions-league.png";
import laLigaLogo from "@/assets/leagues/la-liga.png";
import serieALogo from "@/assets/leagues/serie-a.png";
import bundesligaLogo from "@/assets/leagues/bundesliga.png";
import nbaLogo from "@/assets/leagues/nba.png";
import nflLogo from "@/assets/leagues/nfl.png";
import atpLogo from "@/assets/leagues/atp.png";

const Index = () => {
  const categories = [
    { label: "⚽ Today's Football", url: "/sports/football", gradient: "from-emerald-500 to-teal-600" },
    { label: "🏆 Premier League", url: "/football/premier-league", gradient: "from-purple-500 to-pink-600" },
    { label: "⭐ Champions League", url: "/football/champions-league", gradient: "from-blue-500 to-indigo-600" },
    { label: "🏈 NFL", url: "/sports/american-football", gradient: "from-orange-500 to-red-600" },
    { label: "🏀 NBA", url: "/sports/basketball", gradient: "from-amber-500 to-orange-600" },
  ];

  const leagues = [
    { name: "Premier League", url: "/football/premier-league", logo: premierLeagueLogo, matches: 10 },
    { name: "Champions League", url: "/football/champions-league", logo: championsLeagueLogo, matches: 8 },
    { name: "La Liga", url: "/football/la-liga", logo: laLigaLogo, matches: 10 },
    { name: "Serie A", url: "/football/serie-a", logo: serieALogo, matches: 10 },
    { name: "Bundesliga", url: "/football/bundesliga", logo: bundesligaLogo, matches: 9 },
    { name: "NBA", url: "/basketball/nba", logo: nbaLogo, matches: 12 },
    { name: "NFL", url: "/sports/american-football", logo: nflLogo, matches: 16 },
    { name: "ATP Tennis", url: "/tennis/atp-masters-1000", logo: atpLogo, matches: 8 },
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

          {/* Sophisticated Category Pills */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 pr-24 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.label}
                to={category.url}
                className="group relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 whitespace-nowrap"
                role="link"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <span className="relative z-10 flex items-center gap-2">
                  {category.label}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>

          {/* All Leagues Section with Crests */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">All Leagues</h2>
              <Link to="/sports/football" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league.name}
                  to={league.url}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-background/50 p-2 group-hover:scale-110 transition-transform">
                      <img src={league.logo} alt={league.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center w-full">
                      <h3 className="text-xs font-semibold text-foreground truncate">{league.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{league.matches} matches</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </section>

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
