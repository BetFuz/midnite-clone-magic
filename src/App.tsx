import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Live from "./pages/Live";
import Racing from "./pages/Racing";
import Games from "./pages/Games";
import LiveCasino from "./pages/LiveCasino";
import Virtuals from "./pages/Virtuals";
import NotFound from "./pages/NotFound";

// Sports
import Football from "./pages/sports/Football";
import Tennis from "./pages/sports/Tennis";
import Basketball from "./pages/sports/Basketball";
import Cricket from "./pages/sports/Cricket";
import AmericanFootball from "./pages/sports/AmericanFootball";
import Rugby from "./pages/sports/Rugby";
import Golf from "./pages/sports/Golf";
import Boxing from "./pages/sports/Boxing";
import MMA from "./pages/sports/MMA";
import Darts from "./pages/sports/Darts";
import Snooker from "./pages/sports/Snooker";
import Volleyball from "./pages/sports/Volleyball";
import IceHockey from "./pages/sports/IceHockey";
import Baseball from "./pages/sports/Baseball";
import TableTennis from "./pages/sports/TableTennis";
import Handball from "./pages/sports/Handball";
import Badminton from "./pages/sports/Badminton";
import Futsal from "./pages/sports/Futsal";
import Cycling from "./pages/sports/Cycling";
import MotorSports from "./pages/sports/MotorSports";
import BeachVolleyball from "./pages/sports/BeachVolleyball";
import Esports from "./pages/sports/Esports";

// Football Leagues
import PremierLeague from "./pages/football/PremierLeague";
import ChampionsLeague from "./pages/football/ChampionsLeague";
import LaLiga from "./pages/football/LaLiga";
import SerieA from "./pages/football/SerieA";
import Bundesliga from "./pages/football/Bundesliga";
import WorldCup from "./pages/football/WorldCup";
import U20WorldCup from "./pages/football/U20WorldCup";
import U17WorldCup from "./pages/football/U17WorldCup";
import CAFChampionsLeague from "./pages/football/CAFChampionsLeague";
import AFCON from "./pages/football/AFCON";
import EgyptianPremierLeague from "./pages/football/EgyptianPremierLeague";
import SouthAfricanPremierLeague from "./pages/football/SouthAfricanPremierLeague";

// Racing Venues
import Ascot from "./pages/racing/Ascot";
import Cheltenham from "./pages/racing/Cheltenham";
import Kempton from "./pages/racing/Kempton";

// Basketball Leagues
import NBA from "./pages/basketball/NBA";
import EuroLeague from "./pages/basketball/EuroLeague";
import NCAABasketball from "./pages/basketball/NCAABasketball";
import WNBA from "./pages/basketball/WNBA";
import SpanishACB from "./pages/basketball/SpanishACB";

// Tennis Tournaments
import FrenchOpen from "./pages/tennis/FrenchOpen";
import Wimbledon from "./pages/tennis/Wimbledon";
import AustralianOpen from "./pages/tennis/AustralianOpen";
import USOpen from "./pages/tennis/USOpen";
import ATPMasters1000 from "./pages/tennis/ATPMasters1000";
import WTAFinals from "./pages/tennis/WTAFinals";

// Casino
import Slots from "./pages/casino/Slots";
import Roulette from "./pages/casino/Roulette";
import Blackjack from "./pages/casino/Blackjack";

// Account
import Profile from "./pages/account/Profile";
import Deposits from "./pages/account/Deposits";
import Withdrawals from "./pages/account/Withdrawals";
import Transactions from "./pages/account/Transactions";
import Statistics from "./pages/account/Statistics";
import BettingHistory from "./pages/account/BettingHistory";
import BetTickets from "./pages/account/BetTickets";
import BetTicketDetail from "./pages/account/BetTicketDetail";
import AccountSettings from "./pages/account/AccountSettings";
import Leaderboard from "./pages/account/Leaderboard";

// Account Tiers
import DiamondTier from "./pages/account/tiers/DiamondTier";
import PlatinumTier from "./pages/account/tiers/PlatinumTier";
import GoldTier from "./pages/account/tiers/GoldTier";
import SilverTier from "./pages/account/tiers/SilverTier";
import BronzeTier from "./pages/account/tiers/BronzeTier";
import RookieTier from "./pages/account/tiers/RookieTier";

// Promotions
import Promotions from "./pages/promotions/Promotions";
import Welcome from "./pages/promotions/Welcome";
import AccaBoost from "./pages/promotions/AccaBoost";
import WeekendSpecials from "./pages/promotions/WeekendSpecials";
import Cashback from "./pages/promotions/Cashback";
import LoyaltyRewards from "./pages/promotions/LoyaltyRewards";
import ReferFriend from "./pages/promotions/ReferFriend";

// Info
import About from "./pages/info/About";
import HelpCenter from "./pages/info/HelpCenter";
import ResponsibleGambling from "./pages/info/ResponsibleGambling";
import Terms from "./pages/info/Terms";
import Privacy from "./pages/info/Privacy";
import Contact from "./pages/info/Contact";
import FAQ from "./pages/info/FAQ";

// Admin
import WebhookSettings from "./pages/admin/WebhookSettings";

import MobileBetSlip from "./components/MobileBetSlip";

// Match & Live Casino
import MatchDetail from "./pages/matches/MatchDetail";
import LightningRoulette from "./pages/live-casino/LightningRoulette";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BetSlipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/live" element={<Live />} />
          <Route path="/racing" element={<Racing />} />
          <Route path="/games" element={<Games />} />
          <Route path="/live-casino" element={<LiveCasino />} />
          <Route path="/virtuals" element={<Virtuals />} />
          
          {/* Sports */}
          <Route path="/sports/football" element={<Football />} />
          <Route path="/sports/tennis" element={<Tennis />} />
          <Route path="/sports/basketball" element={<Basketball />} />
          <Route path="/sports/cricket" element={<Cricket />} />
          <Route path="/sports/american-football" element={<AmericanFootball />} />
          <Route path="/sports/rugby" element={<Rugby />} />
          <Route path="/sports/golf" element={<Golf />} />
          <Route path="/sports/boxing" element={<Boxing />} />
          <Route path="/sports/mma" element={<MMA />} />
          <Route path="/sports/darts" element={<Darts />} />
          <Route path="/sports/snooker" element={<Snooker />} />
          <Route path="/sports/volleyball" element={<Volleyball />} />
          <Route path="/sports/ice-hockey" element={<IceHockey />} />
          <Route path="/sports/baseball" element={<Baseball />} />
          <Route path="/sports/table-tennis" element={<TableTennis />} />
          <Route path="/sports/handball" element={<Handball />} />
          <Route path="/sports/badminton" element={<Badminton />} />
          <Route path="/sports/futsal" element={<Futsal />} />
          <Route path="/sports/cycling" element={<Cycling />} />
          <Route path="/sports/motor-sports" element={<MotorSports />} />
          <Route path="/sports/beach-volleyball" element={<BeachVolleyball />} />
          <Route path="/sports/esports" element={<Esports />} />
          
          {/* Football Leagues */}
          <Route path="/football/premier-league" element={<PremierLeague />} />
          <Route path="/football/champions-league" element={<ChampionsLeague />} />
          <Route path="/football/la-liga" element={<LaLiga />} />
          <Route path="/football/serie-a" element={<SerieA />} />
          <Route path="/football/bundesliga" element={<Bundesliga />} />
          <Route path="/football/world-cup" element={<WorldCup />} />
          <Route path="/football/u20-world-cup" element={<U20WorldCup />} />
          <Route path="/football/u17-world-cup" element={<U17WorldCup />} />
          <Route path="/football/caf-champions-league" element={<CAFChampionsLeague />} />
          <Route path="/football/african-cup-of-nations" element={<AFCON />} />
          <Route path="/football/egyptian-premier-league" element={<EgyptianPremierLeague />} />
          <Route path="/football/south-african-premier-league" element={<SouthAfricanPremierLeague />} />
          {/* Uppercase path aliases -> redirect to canonical lowercase routes */}
          <Route path="/Football/premier-league" element={<Navigate to="/football/premier-league" replace />} />
          <Route path="/Football/champions-league" element={<Navigate to="/football/champions-league" replace />} />
          <Route path="/Sports/American-football" element={<Navigate to="/sports/american-football" replace />} />
          <Route path="/Sports/basketball" element={<Navigate to="/sports/basketball" replace />} />
          
          {/* Basketball Leagues */}
          <Route path="/basketball/nba" element={<NBA />} />
          <Route path="/basketball/euroleague" element={<EuroLeague />} />
          <Route path="/basketball/ncaa-basketball" element={<NCAABasketball />} />
          <Route path="/basketball/wnba" element={<WNBA />} />
          <Route path="/basketball/spanish-acb" element={<SpanishACB />} />
          
          {/* Tennis Tournaments */}
          <Route path="/tennis/french-open" element={<FrenchOpen />} />
          <Route path="/tennis/wimbledon" element={<Wimbledon />} />
          <Route path="/tennis/australian-open" element={<AustralianOpen />} />
          <Route path="/tennis/us-open" element={<USOpen />} />
          <Route path="/tennis/atp-masters-1000" element={<ATPMasters1000 />} />
          <Route path="/tennis/wta-finals" element={<WTAFinals />} />
          
          {/* Racing */}
          <Route path="/racing/ascot" element={<Ascot />} />
          <Route path="/racing/cheltenham" element={<Cheltenham />} />
          <Route path="/racing/kempton" element={<Kempton />} />
          
          {/* Casino */}
          <Route path="/casino/slots" element={<Slots />} />
          <Route path="/casino/roulette" element={<Roulette />} />
          <Route path="/casino/blackjack" element={<Blackjack />} />
          
          {/* Account */}
          <Route path="/account/profile" element={<Profile />} />
          <Route path="/account/deposits" element={<Deposits />} />
          <Route path="/account/withdrawals" element={<Withdrawals />} />
          <Route path="/account/transactions" element={<Transactions />} />
          <Route path="/account/statistics" element={<Statistics />} />
          <Route path="/account/leaderboard" element={<Leaderboard />} />
          <Route path="/account/history" element={<BettingHistory />} />
          <Route path="/account/bet-tickets" element={<BetTickets />} />
          <Route path="/bet-ticket/:ticketId" element={<BetTicketDetail />} />
          <Route path="/account/settings" element={<AccountSettings />} />
          
          {/* Account Tiers */}
          <Route path="/account/tiers/diamond" element={<DiamondTier />} />
          <Route path="/account/tiers/platinum" element={<PlatinumTier />} />
          <Route path="/account/tiers/gold" element={<GoldTier />} />
          <Route path="/account/tiers/silver" element={<SilverTier />} />
          <Route path="/account/tiers/bronze" element={<BronzeTier />} />
          <Route path="/account/tiers/rookie" element={<RookieTier />} />
          
          {/* Promotions */}
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/promotions/welcome" element={<Welcome />} />
          <Route path="/promotions/acca-boost" element={<AccaBoost />} />
          <Route path="/promotions/weekend-specials" element={<WeekendSpecials />} />
          <Route path="/promotions/cashback" element={<Cashback />} />
          <Route path="/promotions/loyalty-rewards" element={<LoyaltyRewards />} />
          <Route path="/promotions/refer-friend" element={<ReferFriend />} />
          
          {/* Info */}
          <Route path="/info/about" element={<About />} />
          <Route path="/info/help" element={<HelpCenter />} />
          <Route path="/info/responsible-gambling" element={<ResponsibleGambling />} />
          <Route path="/info/terms" element={<Terms />} />
          <Route path="/info/privacy" element={<Privacy />} />
          <Route path="/info/contact" element={<Contact />} />
          <Route path="/info/faq" element={<FAQ />} />

          {/* Admin */}
          <Route path="/admin/webhooks" element={<WebhookSettings />} />
          
          {/* Match & Live Tables */}
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/live-table/lightning-roulette" element={<LightningRoulette />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileBetSlip />
      </BrowserRouter>
    </BetSlipProvider>
  </QueryClientProvider>
);

export default App;
