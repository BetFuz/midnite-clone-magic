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

// Import team logos
import manUnitedLogo from "@/assets/teams/man-united.png";
import liverpoolLogo from "@/assets/teams/liverpool.png";
import barcelonaLogo from "@/assets/teams/barcelona.png";
import realMadridLogo from "@/assets/teams/real-madrid.png";
import chelseaLogo from "@/assets/teams/chelsea.png";
import arsenalLogo from "@/assets/teams/arsenal.png";
import bayernLogo from "@/assets/teams/bayern.png";
import psgLogo from "@/assets/teams/psg.png";

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

  const teams = [
    { name: "Man United", url: "/football/premier-league", logo: manUnitedLogo },
    { name: "Liverpool", url: "/football/premier-league", logo: liverpoolLogo },
    { name: "Barcelona", url: "/football/la-liga", logo: barcelonaLogo },
    { name: "Real Madrid", url: "/football/la-liga", logo: realMadridLogo },
    { name: "Chelsea", url: "/football/premier-league", logo: chelseaLogo },
    { name: "Arsenal", url: "/football/premier-league", logo: arsenalLogo },
    { name: "Bayern Munich", url: "/football/bundesliga", logo: bayernLogo },
    { name: "PSG", url: "/football/la-liga", logo: psgLogo },
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

          {/* Quick Sports Navigation - Fanatics Style: Clean & Streamlined */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.label}
                to={category.url}
                className={buttonVariants({ 
                  variant: "outline", 
                  size: "sm",
                  className: "whitespace-nowrap font-medium hover:bg-primary hover:text-primary-foreground transition-all" 
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

          {/* Live Matches Banner - Midnite Style: Real-time Emphasis */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-semibold text-foreground">LIVE NOW</h3>
              <span className="text-xs text-muted-foreground ml-auto">3 matches in play</span>
            </div>
            <p className="text-xs text-muted-foreground">Bet in-play with live odds updates</p>
          </div>

          {/* Popular Leagues - SportyBet Style: Mobile-first horizontal scroll */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Popular Leagues</h2>
              <Link to="/sports/football" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {leagues.map((league) => (
                <Link
                  key={league.name}
                  to={league.url}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all group min-w-[85px] flex-shrink-0"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={league.logo} 
                      alt={league.name} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" 
                    />
                  </div>
                  <p className="text-[10px] font-medium text-foreground text-center leading-tight w-full truncate px-1">{league.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Teams - SportyBet Style: Mobile-first horizontal scroll */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Popular Teams</h2>
              <Link to="/sports/football" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {teams.map((team) => (
                <Link
                  key={team.name}
                  to={team.url}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all group min-w-[85px] flex-shrink-0"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" 
                    />
                  </div>
                  <p className="text-[10px] font-medium text-foreground text-center leading-tight w-full truncate px-1">{team.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Matches - Fanatics Style: Clean section headers */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Featured Matches</h2>
            
            {/* Football Matches */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground mb-2.5">⚽ Football</h3>
              <div className="grid gap-3">
                {featuredMatches.filter(m => m.sport === "Football").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>

            {/* Basketball Matches */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground mb-2.5">🏀 Basketball</h3>
              <div className="grid gap-3">
                {featuredMatches.filter(m => m.sport === "Basketball").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>

            {/* NFL Matches */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground mb-2.5">🏈 American Football</h3>
              <div className="grid gap-3">
                {featuredMatches.filter(m => m.sport === "American Football").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>

            {/* Tennis Matches */}
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground mb-2.5">🎾 Tennis</h3>
              <div className="grid gap-3">
                {featuredMatches.filter(m => m.sport === "Tennis").map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </div>
          </section>

          {/* Boosts Section - Betano Style: Electrifying promotions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 p-1.5">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Odds Boosts</h2>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Hot 🔥</span>
            </div>
            <div className="grid gap-3">
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
