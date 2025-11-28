import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Critical pages - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// Lazy load all other pages for faster initial load
const Live = lazy(() => import("./pages/Live"));
const Racing = lazy(() => import("./pages/Racing"));
const Games = lazy(() => import("./pages/Games"));
const LiveCasino = lazy(() => import("./pages/LiveCasino"));
const Virtuals = lazy(() => import("./pages/Virtuals"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Sports
const Football = lazy(() => import("./pages/sports/Football"));
const Tennis = lazy(() => import("./pages/sports/Tennis"));
const Basketball = lazy(() => import("./pages/sports/Basketball"));
const Cricket = lazy(() => import("./pages/sports/Cricket"));
const AmericanFootball = lazy(() => import("./pages/sports/AmericanFootball"));
const Rugby = lazy(() => import("./pages/sports/Rugby"));
const Golf = lazy(() => import("./pages/sports/Golf"));
const Boxing = lazy(() => import("./pages/sports/Boxing"));
const MMA = lazy(() => import("./pages/sports/MMA"));
const Darts = lazy(() => import("./pages/sports/Darts"));
const Snooker = lazy(() => import("./pages/sports/Snooker"));
const Volleyball = lazy(() => import("./pages/sports/Volleyball"));
const IceHockey = lazy(() => import("./pages/sports/IceHockey"));
const Baseball = lazy(() => import("./pages/sports/Baseball"));
const TableTennis = lazy(() => import("./pages/sports/TableTennis"));
const Handball = lazy(() => import("./pages/sports/Handball"));
const Badminton = lazy(() => import("./pages/sports/Badminton"));
const Futsal = lazy(() => import("./pages/sports/Futsal"));
const Cycling = lazy(() => import("./pages/sports/Cycling"));
const MotorSports = lazy(() => import("./pages/sports/MotorSports"));
const BeachVolleyball = lazy(() => import("./pages/sports/BeachVolleyball"));
const Esports = lazy(() => import("./pages/sports/Esports"));

// Football Leagues
const PremierLeague = lazy(() => import("./pages/football/PremierLeague"));
const ChampionsLeague = lazy(() => import("./pages/football/ChampionsLeague"));
const LaLiga = lazy(() => import("./pages/football/LaLiga"));
const SerieA = lazy(() => import("./pages/football/SerieA"));
const Bundesliga = lazy(() => import("./pages/football/Bundesliga"));
const Ligue1 = lazy(() => import("./pages/football/Ligue1"));
const Championship = lazy(() => import("./pages/football/Championship"));
const EuropaLeague = lazy(() => import("./pages/football/EuropaLeague"));
const WorldCup = lazy(() => import("./pages/football/WorldCup"));
const U20WorldCup = lazy(() => import("./pages/football/U20WorldCup"));
const U17WorldCup = lazy(() => import("./pages/football/U17WorldCup"));
const CAFChampionsLeague = lazy(() => import("./pages/football/CAFChampionsLeague"));
const AFCON = lazy(() => import("./pages/football/AFCON"));
const EgyptianPremierLeague = lazy(() => import("./pages/football/EgyptianPremierLeague"));
const SouthAfricanPremierLeague = lazy(() => import("./pages/football/SouthAfricanPremierLeague"));

// Racing Venues
const Ascot = lazy(() => import("./pages/racing/Ascot"));
const Cheltenham = lazy(() => import("./pages/racing/Cheltenham"));
const Kempton = lazy(() => import("./pages/racing/Kempton"));

// Racing Types
const HorseRacing = lazy(() => import("./pages/racing/HorseRacing"));
const DogRacing = lazy(() => import("./pages/racing/DogRacing"));
const F1Racing = lazy(() => import("./pages/racing/F1Racing"));
const StreetRacing = lazy(() => import("./pages/racing/StreetRacing"));
const MotoGPRacing = lazy(() => import("./pages/racing/MotoGPRacing"));
const PowerboatRacing = lazy(() => import("./pages/racing/PowerboatRacing"));
const CyclingRacing = lazy(() => import("./pages/racing/CyclingRacing"));
const RobotRacing = lazy(() => import("./pages/racing/RobotRacing"));
const SpaceRacing = lazy(() => import("./pages/racing/SpaceRacing"));
const DragonBoatRacing = lazy(() => import("./pages/racing/DragonBoatRacing"));

// Basketball Leagues
const NBA = lazy(() => import("./pages/basketball/NBA"));
const EuroLeague = lazy(() => import("./pages/basketball/EuroLeague"));
const NCAABasketball = lazy(() => import("./pages/basketball/NCAABasketball"));
const WNBA = lazy(() => import("./pages/basketball/WNBA"));
const SpanishACB = lazy(() => import("./pages/basketball/SpanishACB"));

// Tennis Tournaments
const FrenchOpen = lazy(() => import("./pages/tennis/FrenchOpen"));
const Wimbledon = lazy(() => import("./pages/tennis/Wimbledon"));
const AustralianOpen = lazy(() => import("./pages/tennis/AustralianOpen"));
const USOpen = lazy(() => import("./pages/tennis/USOpen"));
const ATPMasters1000 = lazy(() => import("./pages/tennis/ATPMasters1000"));
const WTAFinals = lazy(() => import("./pages/tennis/WTAFinals"));

// Casino
const Slots = lazy(() => import("./pages/casino/Slots"));
const Roulette = lazy(() => import("./pages/casino/Roulette"));
const Blackjack = lazy(() => import("./pages/casino/Blackjack"));
const Keno = lazy(() => import("./pages/casino/Keno"));
const ScratchCards = lazy(() => import("./pages/casino/ScratchCards"));
const Craps = lazy(() => import("./pages/casino/Craps"));
const RockPaperScissors = lazy(() => import("./pages/casino/RockPaperScissors"));
const CoinFlip = lazy(() => import("./pages/casino/CoinFlip"));
const GameShow = lazy(() => import("./pages/casino/GameShow"));
const Bingo = lazy(() => import("./pages/casino/Bingo"));
const BurstGames = lazy(() => import("./pages/casino/BurstGames"));

// Account
const Profile = lazy(() => import("./pages/account/Profile"));
const Deposits = lazy(() => import("./pages/account/Deposits"));
const Withdrawals = lazy(() => import("./pages/account/Withdrawals"));
const Transactions = lazy(() => import("./pages/account/Transactions"));
const Statistics = lazy(() => import("./pages/account/Statistics"));
const BettingHistory = lazy(() => import("./pages/account/BettingHistory"));
const BetTickets = lazy(() => import("./pages/account/BetTickets"));
const BetTicketDetail = lazy(() => import("./pages/account/BetTicketDetail"));
const AccountSettings = lazy(() => import("./pages/account/AccountSettings"));
const Leaderboard = lazy(() => import("./pages/account/Leaderboard"));

// Account Tiers
const DiamondTier = lazy(() => import("./pages/account/tiers/DiamondTier"));
const PlatinumTier = lazy(() => import("./pages/account/tiers/PlatinumTier"));
const GoldTier = lazy(() => import("./pages/account/tiers/GoldTier"));
const SilverTier = lazy(() => import("./pages/account/tiers/SilverTier"));
const BronzeTier = lazy(() => import("./pages/account/tiers/BronzeTier"));
const RookieTier = lazy(() => import("./pages/account/tiers/RookieTier"));

// Promotions
const Promotions = lazy(() => import("./pages/promotions/Promotions"));
const Welcome = lazy(() => import("./pages/promotions/Welcome"));
const AccaBoost = lazy(() => import("./pages/promotions/AccaBoost"));
const WeekendSpecials = lazy(() => import("./pages/promotions/WeekendSpecials"));
const Cashback = lazy(() => import("./pages/promotions/Cashback"));
const LoyaltyRewards = lazy(() => import("./pages/promotions/LoyaltyRewards"));
const ReferFriend = lazy(() => import("./pages/promotions/ReferFriend"));

// Info
const About = lazy(() => import("./pages/info/About"));
const HelpCenter = lazy(() => import("./pages/info/HelpCenter"));
const ResponsibleGambling = lazy(() => import("./pages/info/ResponsibleGambling"));
const Terms = lazy(() => import("./pages/info/Terms"));
const Privacy = lazy(() => import("./pages/info/Privacy"));
const Contact = lazy(() => import("./pages/info/Contact"));
const FAQ = lazy(() => import("./pages/info/FAQ"));

// Admin
const AdminAuth = lazy(() => import("./pages/admin/AdminAuth"));
const WebhookSettings = lazy(() => import("./pages/admin/WebhookSettings"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSetup = lazy(() => import("./pages/admin/AdminSetup"));
const AdminAssets = lazy(() => import("./pages/admin/AIAssets"));
const SeedData = lazy(() => import("./pages/admin/SeedData"));
const DataManagement = lazy(() => import("./pages/admin/DataManagement"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminBets = lazy(() => import("./pages/admin/Bets"));
const AdminFinances = lazy(() => import("./pages/admin/Finances"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const AdminOdds = lazy(() => import("./pages/admin/Odds"));
const AdminKYC = lazy(() => import("./pages/admin/KYC"));
const AdminWithdrawals = lazy(() => import("./pages/admin/Withdrawals"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminAuditLog = lazy(() => import("./pages/admin/AuditLog"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminSecurity = lazy(() => import("./pages/admin/Security"));

const MobileBetSlip = lazy(() => import("./components/MobileBetSlip"));
const BottomNav = lazy(() => import("./components/mobile/BottomNav").then(m => ({ default: m.BottomNav })));
const NetworkStatus = lazy(() => import("./components/NetworkStatus"));

// Match & Live Casino
const MatchDetail = lazy(() => import("./pages/matches/MatchDetail"));
const LightningRoulette = lazy(() => import("./pages/live-casino/LightningRoulette"));
const LiveCasinoPoker = lazy(() => import("./pages/live-casino/Poker"));
const LiveCasinoBaccarat = lazy(() => import("./pages/live-casino/Baccarat"));
const LiveCasinoBlackjack = lazy(() => import("./pages/live-casino/Blackjack"));
const BetFeatures = lazy(() => import("./pages/BetFeatures"));
const EnhancedAccountHub = lazy(() => import("./pages/account/EnhancedAccountHub"));
const Politics = lazy(() => import("./pages/politics/Politics"));
const BettingHub = lazy(() => import("./pages/BettingHub"));
const Economy = lazy(() => import("./pages/economy/Economy"));
const Social = lazy(() => import("./pages/social/Social"));
const Predict = lazy(() => import("./pages/predict/Predict"));
const AIFeatures = lazy(() => import("./pages/AIFeatures"));
const SocialBetting = lazy(() => import("./pages/SocialBetting"));
const BetMarketplace = lazy(() => import("./pages/BetMarketplace"));
const AIPredictions = lazy(() => import("./pages/AIPredictions"));
const PoolBetting = lazy(() => import("./pages/PoolBetting"));
const FantasySports = lazy(() => import("./pages/FantasySports"));
const LiveStreaming = lazy(() => import("./pages/LiveStreaming"));
const Web3Hub = lazy(() => import("./pages/Web3Hub"));
const VirtualStadium = lazy(() => import("./pages/VirtualStadium"));
const FuzFlix = lazy(() => import("./pages/FuzFlix"));
const CasinoLobby = lazy(() => import("./pages/casino/CasinoLobby"));
const Analytics = lazy(() => import("./pages/Analytics"));
const FuzInsurance = lazy(() => import("./pages/promotions/FuzInsurance"));

// Layout components for route grouping
const GamesLayout = lazy(() => import("./pages/games/GamesLayout"));
const CasinoLayout = lazy(() => import("./pages/casino/CasinoLayout"));
const RacingLayout = lazy(() => import("./pages/racing/RacingLayout"));
const LiveCasinoLayout = lazy(() => import("./pages/live-casino/LiveCasinoLayout"));

// Traditional African Games - loaded only when games route is accessed
const AfricanDraft = lazy(() => import("./pages/games/AfricanDraft"));
const Morabaraba = lazy(() => import("./pages/games/Morabaraba"));
const Mancala = lazy(() => import("./pages/games/Mancala"));
const Tournament = lazy(() => import("./pages/games/Tournament"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BetSlipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <NetworkStatus />
        </Suspense>
        <div className="pb-20 md:pb-0">
          <Suspense fallback={<PageLoader />}>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/live" element={<Live />} />
          <Route path="/games" element={<Games />} /> {/* Games lobby/overview */}
          <Route path="/virtuals" element={<Virtuals />} />
          <Route path="/bet-features" element={<BetFeatures />} />
          <Route path="/politics" element={<Politics />} />
          <Route path="/betting-hub" element={<BettingHub />} />
          <Route path="/economy" element={<Economy />} />
          <Route path="/social" element={<Social />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/ai-features" element={<AIFeatures />} />
          <Route path="/social-betting" element={<SocialBetting />} />
          <Route path="/bet-marketplace" element={<BetMarketplace />} />
          <Route path="/ai-predictions" element={<AIPredictions />} />
          <Route path="/pool-betting" element={<PoolBetting />} />
          <Route path="/fantasy-sports" element={<FantasySports />} />
          <Route path="/live-streaming" element={<LiveStreaming />} />
          <Route path="/web3-hub" element={<Web3Hub />} />
          <Route path="/virtual-stadium" element={<VirtualStadium />} />
          <Route path="/fuzflix" element={<FuzFlix />} />
          <Route path="/casino-lobby" element={<CasinoLobby />} />
          <Route path="/analytics" element={<Analytics />} />
          
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
          <Route path="/football/ligue-1" element={<Ligue1 />} />
          <Route path="/football/championship" element={<Championship />} />
          <Route path="/football/europa-league" element={<EuropaLeague />} />
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
          <Route path="/racing/horse" element={<HorseRacing />} />
          <Route path="/racing/dog" element={<DogRacing />} />
          <Route path="/racing/f1" element={<F1Racing />} />
          <Route path="/racing/street" element={<StreetRacing />} />
          <Route path="/racing/motogp" element={<MotoGPRacing />} />
          <Route path="/racing/powerboat" element={<PowerboatRacing />} />
          <Route path="/racing/cycling" element={<CyclingRacing />} />
          <Route path="/racing/robot" element={<RobotRacing />} />
          <Route path="/racing/space" element={<SpaceRacing />} />
          <Route path="/racing/dragon-boat" element={<DragonBoatRacing />} />
          
          {/* Casino - Grouped for better code splitting */}
          <Route path="/casino" element={<CasinoLayout />}>
            <Route path="slots" element={<Slots />} />
            <Route path="roulette" element={<Roulette />} />
            <Route path="blackjack" element={<Blackjack />} />
            <Route path="keno" element={<Keno />} />
            <Route path="scratch-cards" element={<ScratchCards />} />
            <Route path="craps" element={<Craps />} />
            <Route path="rock-paper-scissors" element={<RockPaperScissors />} />
            <Route path="coin-flip" element={<CoinFlip />} />
            <Route path="game-show" element={<GameShow />} />
            <Route path="bingo" element={<Bingo />} />
            <Route path="burst" element={<BurstGames />} />
          </Route>
          
          {/* Traditional African Games - Grouped for better code splitting */}
          <Route path="/games" element={<GamesLayout />}>
            <Route path="african-draft" element={<AfricanDraft />} />
            <Route path="morabaraba" element={<Morabaraba />} />
            <Route path="mancala" element={<Mancala />} />
            <Route path="tournament" element={<Tournament />} />
          </Route>
          
          {/* Racing - Grouped for better code splitting */}
          <Route path="/racing" element={<RacingLayout />}>
            <Route index element={<Racing />} />
            <Route path="ascot" element={<Ascot />} />
            <Route path="cheltenham" element={<Cheltenham />} />
            <Route path="kempton" element={<Kempton />} />
            <Route path="horse" element={<HorseRacing />} />
            <Route path="dog" element={<DogRacing />} />
            <Route path="f1" element={<F1Racing />} />
            <Route path="street" element={<StreetRacing />} />
            <Route path="motogp" element={<MotoGPRacing />} />
            <Route path="powerboat" element={<PowerboatRacing />} />
            <Route path="cycling" element={<CyclingRacing />} />
            <Route path="robot" element={<RobotRacing />} />
            <Route path="space" element={<SpaceRacing />} />
            <Route path="dragon-boat" element={<DragonBoatRacing />} />
          </Route>
          
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
          <Route path="/account/enhanced" element={<EnhancedAccountHub />} />
          
          {/* Promotions */}
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/promotions/welcome" element={<Welcome />} />
          <Route path="/promotions/acca-boost" element={<AccaBoost />} />
          <Route path="/promotions/weekend-specials" element={<WeekendSpecials />} />
          <Route path="/promotions/cashback" element={<Cashback />} />
          <Route path="/promotions/loyalty-rewards" element={<LoyaltyRewards />} />
          <Route path="/promotions/refer-friend" element={<ReferFriend />} />
          <Route path="/promotions/fuz-insurance" element={<FuzInsurance />} />
          
          {/* Info */}
          <Route path="/info/about" element={<About />} />
          <Route path="/info/help" element={<HelpCenter />} />
          <Route path="/info/responsible-gambling" element={<ResponsibleGambling />} />
          <Route path="/info/terms" element={<Terms />} />
          <Route path="/info/privacy" element={<Privacy />} />
          <Route path="/info/contact" element={<Contact />} />
          <Route path="/info/faq" element={<FAQ />} />

          {/* Admin */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin/ai-assets" element={<AdminAssets />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/odds" element={<AdminOdds />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/bets" element={<AdminBets />} />
          <Route path="/admin/finances" element={<AdminFinances />} />
          <Route path="/admin/kyc" element={<AdminKYC />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/data" element={<DataManagement />} />
          <Route path="/admin/webhooks" element={<WebhookSettings />} />
          <Route path="/admin/audit" element={<AdminAuditLog />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
          <Route path="/admin/seed" element={<SeedData />} />
          
          {/* Match Details */}
          <Route path="/match/:id" element={<MatchDetail />} />
          
          {/* Live Casino - Grouped for better code splitting */}
          <Route path="/live-casino" element={<LiveCasinoLayout />}>
            <Route index element={<LiveCasino />} />
            <Route path="lightning-roulette" element={<LightningRoulette />} />
            <Route path="poker" element={<LiveCasinoPoker />} />
            <Route path="baccarat" element={<LiveCasinoBaccarat />} />
            <Route path="blackjack" element={<LiveCasinoBlackjack />} />
          </Route>
          
          {/* Legacy live-table routes - redirect to live-casino */}
          <Route path="/live-table/lightning-roulette" element={<Navigate to="/live-casino/lightning-roulette" replace />} />
          <Route path="/live-table/poker" element={<Navigate to="/live-casino/poker" replace />} />
          <Route path="/live-table/baccarat" element={<Navigate to="/live-casino/baccarat" replace />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <MobileBetSlip />
          <BottomNav />
        </Suspense>
      </BrowserRouter>
    </BetSlipProvider>
  </QueryClientProvider>
);

export default App;
