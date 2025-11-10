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
    { label: "Football", url: "/sports/football" },
    { label: "Premier League", url: "/football/premier-league" },
    { label: "Champions League", url: "/football/champions-league" },
    { label: "American Football", url: "/sports/american-football" },
    { label: "Basketball", url: "/sports/basketball" },
  ];

  const leagues = [
    { name: "Premier League", url: "/football/premier-league", logo: premierLeagueLogo, matches: 10, country: "England" },
    { name: "Champions League", url: "/football/champions-league", logo: championsLeagueLogo, matches: 8, country: "Europe" },
    { name: "La Liga", url: "/football/la-liga", logo: laLigaLogo, matches: 10, country: "Spain" },
    { name: "Serie A", url: "/football/serie-a", logo: serieALogo, matches: 10, country: "Italy" },
    { name: "Bundesliga", url: "/football/bundesliga", logo: bundesligaLogo, matches: 9, country: "Germany" },
    { name: "NBA", url: "/basketball/nba", logo: nbaLogo, matches: 12, country: "USA" },
    { name: "NFL", url: "/sports/american-football", logo: nflLogo, matches: 16, country: "USA" },
    { name: "ATP Masters", url: "/tennis/atp-masters-1000", logo: atpLogo, matches: 8, country: "International" },
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

          {/* Quick Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.label}
                to={category.url}
                className={buttonVariants({ 
                  variant: "outline", 
                  className: "whitespace-nowrap font-medium hover:bg-primary hover:text-primary-foreground transition-colors" 
                })}
                role="link"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {category.label}
              </Link>
            ))}
          </div>

          {/* Popular Leagues */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Popular Leagues</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {leagues.map((league) => (
                <Link
                  key={league.name}
                  to={league.url}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-accent/50 transition-all group"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={league.logo} 
                      alt={league.name} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-xs font-medium text-foreground leading-tight">{league.name}</p>
                    <p className="text-[10px] text-muted-foreground">{league.country}</p>
                  </div>
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
