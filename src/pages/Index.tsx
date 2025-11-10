import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import HeroBanner from "@/components/HeroBanner";
import MatchCard from "@/components/MatchCard";
import BoostCard from "@/components/BoostCard";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Award, TrendingUp as TrendingUpIcon } from "lucide-react";

// Import league logos
import premierLeagueLogo from "@/assets/leagues/premier-league.png";
import championsLeagueLogo from "@/assets/leagues/champions-league.png";
import laLigaLogo from "@/assets/leagues/la-liga.png";
import serieALogo from "@/assets/leagues/serie-a.png";
import bundesligaLogo from "@/assets/leagues/bundesliga.png";
import nbaLogo from "@/assets/leagues/nba.png";
import nflLogo from "@/assets/leagues/nfl.png";
import atpLogo from "@/assets/leagues/atp.png";
import ligue1Logo from "@/assets/leagues/ligue-1.png";
import eredivisieLogo from "@/assets/leagues/eredivisie.png";
import mlsLogo from "@/assets/leagues/mls.png";
import wnbaLogo from "@/assets/leagues/wnba.png";
import euroleagueLogo from "@/assets/leagues/euroleague.png";
import iplLogo from "@/assets/leagues/ipl.png";

// Import team logos
import manUnitedLogo from "@/assets/teams/man-united.png";
import liverpoolLogo from "@/assets/teams/liverpool.png";
import barcelonaLogo from "@/assets/teams/barcelona.png";
import realMadridLogo from "@/assets/teams/real-madrid.png";
import chelseaLogo from "@/assets/teams/chelsea.png";
import arsenalLogo from "@/assets/teams/arsenal.png";
import bayernLogo from "@/assets/teams/bayern.png";
import psgLogo from "@/assets/teams/psg.png";
import manCityLogo from "@/assets/teams/man-city.png";
import tottenhamLogo from "@/assets/teams/tottenham.png";
import acMilanLogo from "@/assets/teams/ac-milan.png";
import interMilanLogo from "@/assets/teams/inter-milan.png";
import juventusLogo from "@/assets/teams/juventus.png";
import atleticoMadridLogo from "@/assets/teams/atletico-madrid.png";
import dortmundLogo from "@/assets/teams/dortmund.png";
import ajaxLogo from "@/assets/teams/ajax.png";

// Import promotional banners
import championsPromo from "@/assets/promos/champions-league-promo.jpg";
import nbaPromo from "@/assets/promos/nba-promo.jpg";
import betBuilderPromo from "@/assets/promos/bet-builder-promo.jpg";
import welcomePromo from "@/assets/promos/welcome-bonus-promo.jpg";

// Import sport balls
import footballBall from "@/assets/sports/football-ball.png";
import basketballBall from "@/assets/sports/basketball-ball.png";
import tennisBall from "@/assets/sports/tennis-ball.png";
import americanFootballBall from "@/assets/sports/american-football-ball.png";
import cricketBall from "@/assets/sports/cricket-ball.png";
import rugbyBall from "@/assets/sports/rugby-ball.png";
import volleyballBall from "@/assets/sports/volleyball-ball.png";
import hockeyPuck from "@/assets/sports/hockey-puck.png";
import baseballBall from "@/assets/sports/baseball-ball.png";
import tabletennisPaddle from "@/assets/sports/tabletennis-paddle.png";
import handballBall from "@/assets/sports/handball-ball.png";
import dartsBoard from "@/assets/sports/darts-board.png";
import snookerBalls from "@/assets/sports/snooker-balls.png";
import badmintonShuttlecock from "@/assets/sports/badminton-shuttlecock.png";
import golfBall from "@/assets/sports/golf-ball.png";
import futsalBall from "@/assets/sports/futsal-ball.png";
import cyclingWheel from "@/assets/sports/cycling-wheel.png";
import motorsportsHelmet from "@/assets/sports/motorsports-helmet.png";
import beachvolleyballBall from "@/assets/sports/beachvolleyball-ball.png";
import esportsController from "@/assets/sports/esports-controller.png";
import virtualSports from "@/assets/sports/virtual-sports.png";

const Index = () => {
  const promoCards = [
    { title: "UEFA Champions League", image: championsPromo, url: "/football/champions-league" },
    { title: "NBA Basketball", image: nbaPromo, url: "/basketball/nba" },
    { title: "Bet Builder", image: betBuilderPromo, url: "/promotions" },
    { title: "Welcome Bonus", image: welcomePromo, url: "/promotions/welcome" },
  ];

  const mainSports = [
    { name: "Football", image: footballBall, url: "/sports/football" },
    { name: "Basketball", image: basketballBall, url: "/sports/basketball" },
    { name: "Tennis", image: tennisBall, url: "/sports/tennis" },
    { name: "Cricket", image: cricketBall, url: "/sports/cricket" },
    { name: "Rugby", image: rugbyBall, url: "/sports/rugby" },
    { name: "Volleyball", image: volleyballBall, url: "/sports/volleyball" },
    { name: "Ice Hockey", image: hockeyPuck, url: "/sports/ice-hockey" },
    { name: "Baseball", image: baseballBall, url: "/sports/baseball" },
    { name: "NFL", image: americanFootballBall, url: "/sports/american-football" },
  ];

  const minorSports = [
    { name: "Table Tennis", image: tabletennisPaddle, url: "/sports/table-tennis" },
    { name: "Handball", image: handballBall, url: "/sports/handball" },
    { name: "Darts", image: dartsBoard, url: "/sports/darts" },
    { name: "Snooker", image: snookerBalls, url: "/sports/snooker" },
    { name: "Badminton", image: badmintonShuttlecock, url: "/sports/badminton" },
    { name: "Golf", image: golfBall, url: "/sports/golf" },
    { name: "Futsal", image: futsalBall, url: "/sports/futsal" },
    { name: "Cycling", image: cyclingWheel, url: "/sports/cycling" },
    { name: "Motor Sports", image: motorsportsHelmet, url: "/sports/motor-sports" },
    { name: "Beach Volleyball", image: beachvolleyballBall, url: "/sports/beach-volleyball" },
  ];

  const esportsVirtual = [
    { name: "eSports", image: esportsController, url: "/sports/esports" },
    { name: "Virtual Sports", image: virtualSports, url: "/virtuals" },
  ];

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
    { name: "Ligue 1", url: "/football/la-liga", logo: ligue1Logo, matches: 10, country: "France" },
    { name: "Eredivisie", url: "/football/bundesliga", logo: eredivisieLogo, matches: 9, country: "Netherlands" },
    { name: "MLS", url: "/sports/football", logo: mlsLogo, matches: 12, country: "USA" },
    { name: "NBA", url: "/basketball/nba", logo: nbaLogo, matches: 12, country: "USA" },
    { name: "WNBA", url: "/basketball/wnba", logo: wnbaLogo, matches: 10, country: "USA" },
    { name: "EuroLeague", url: "/basketball/euroleague", logo: euroleagueLogo, matches: 8, country: "Europe" },
    { name: "NFL", url: "/sports/american-football", logo: nflLogo, matches: 16, country: "USA" },
    { name: "ATP Masters", url: "/tennis/atp-masters-1000", logo: atpLogo, matches: 8, country: "International" },
    { name: "IPL", url: "/sports/cricket", logo: iplLogo, matches: 14, country: "India" },
  ];

  const teams = [
    { name: "Man United", url: "/football/premier-league", logo: manUnitedLogo },
    { name: "Man City", url: "/football/premier-league", logo: manCityLogo },
    { name: "Liverpool", url: "/football/premier-league", logo: liverpoolLogo },
    { name: "Chelsea", url: "/football/premier-league", logo: chelseaLogo },
    { name: "Arsenal", url: "/football/premier-league", logo: arsenalLogo },
    { name: "Tottenham", url: "/football/premier-league", logo: tottenhamLogo },
    { name: "Real Madrid", url: "/football/la-liga", logo: realMadridLogo },
    { name: "Barcelona", url: "/football/la-liga", logo: barcelonaLogo },
    { name: "Atletico Madrid", url: "/football/la-liga", logo: atleticoMadridLogo },
    { name: "Bayern Munich", url: "/football/bundesliga", logo: bayernLogo },
    { name: "Dortmund", url: "/football/bundesliga", logo: dortmundLogo },
    { name: "AC Milan", url: "/football/serie-a", logo: acMilanLogo },
    { name: "Inter Milan", url: "/football/serie-a", logo: interMilanLogo },
    { name: "Juventus", url: "/football/serie-a", logo: juventusLogo },
    { name: "PSG", url: "/football/la-liga", logo: psgLogo },
    { name: "Ajax", url: "/football/bundesliga", logo: ajaxLogo },
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
          {/* Promotional Carousel - SportyBet Style */}
          <section className="mb-6 -mx-4 md:mx-0">
            <div className="flex gap-3 overflow-x-auto px-4 md:px-0 pb-2 scrollbar-hide snap-x snap-mandatory">
              {promoCards.map((promo, index) => (
                <Link
                  key={index}
                  to={promo.url}
                  className="relative flex-shrink-0 w-[280px] md:w-[320px] h-[140px] md:h-[160px] rounded-xl overflow-hidden group snap-start"
                >
                  <img 
                    src={promo.image} 
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white font-bold text-sm">{promo.title}</div>
                </Link>
              ))}
            </div>
          </section>


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
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all group min-w-[85px] flex-shrink-0 cursor-pointer relative z-10"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                    <img 
                      src={league.logo} 
                      alt={league.name} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" 
                    />
                  </div>
                  <p className="text-[10px] font-medium text-foreground text-center leading-tight w-full truncate px-1 pointer-events-none">{league.name}</p>
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
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all group min-w-[85px] flex-shrink-0 cursor-pointer relative z-10"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" 
                    />
                  </div>
                  <p className="text-[10px] font-medium text-foreground text-center leading-tight w-full truncate px-1 pointer-events-none">{team.name}</p>
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
