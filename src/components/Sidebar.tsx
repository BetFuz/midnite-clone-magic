import { useState } from "react";
import {
  Home, Flame, Trophy, Star, Brain, Ticket, History, BarChart3, CreditCard,
  Shield, Users, TrendingUp, Gamepad2, Zap, Globe, Wallet,
  ChevronDown, ChevronRight, Settings, CircleDot, Activity,
  DollarSign, FileText, Database, Lock, Radio, Gift, Target, Swords,
  Award, Tv2, Coins, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface SidebarProps {
  className?: string;
  showOnMobile?: boolean;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  url: string;
  badge?: string;
  badgeColor?: string;
  emoji?: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

/* ── Live pulse dot ───────────────────────────────────── */
const LiveDot = () => (
  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
  </span>
);

/* ── Badge pill ───────────────────────────────────────── */
const BadgePill = ({ badge, color }: { badge: string; color?: string }) => (
  <span className={cn(
    "px-1.5 py-0.5 text-[9px] font-bold rounded-full leading-none flex-shrink-0",
    color === "green"  ? "bg-green-500/20 text-green-400" :
    color === "yellow" ? "bg-yellow-500/20 text-yellow-400" :
    color === "red"    ? "bg-red-500/20 text-red-400" :
    color === "purple" ? "bg-purple-500/20 text-purple-400" :
                         "bg-primary/20 text-primary"
  )}>
    {badge}
  </span>
);

/* ── Single nav row ───────────────────────────────────── */
function SidebarItem({ item }: { item: NavItem }) {
  const isLive = item.badge === "LIVE";
  return (
    <NavLink
      to={item.url}
      className="block group"
      activeClassName="[&>div]:border-l-2 [&>div]:border-primary [&>div]:bg-primary/8 [&>div]:text-primary [&>div]:pl-[10px]"
    >
      <div className={cn(
        "flex items-center gap-2.5 pl-3 pr-2 py-[7px] border-l-2 border-transparent",
        "text-[12.5px] text-sidebar-foreground rounded-r-md",
        "hover:bg-sidebar-accent/50 hover:text-foreground transition-colors cursor-pointer"
      )}>
        {item.emoji ? (
          <span className="w-4 text-center text-[13px] leading-none flex-shrink-0">{item.emoji}</span>
        ) : (
          <item.icon className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
        )}
        <span className="flex-1 truncate leading-tight">{item.label}</span>
        {isLive && <LiveDot />}
        {item.badge && !isLive && <BadgePill badge={item.badge} color={item.badgeColor} />}
      </div>
    </NavLink>
  );
}

/* ── Collapsible section ──────────────────────────────── */
function SectionGroup({ id, title, items, defaultOpen = false }: NavSection) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
      >
        <span>{title}</span>
        {open
          ? <ChevronDown className="h-3 w-3 opacity-60" />
          : <ChevronRight className="h-3 w-3 opacity-60" />
        }
      </button>
      {open && (
        <div className="mt-0.5">
          {items.map(item => (
            <SidebarItem key={item.url + item.label} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Divider ──────────────────────────────────────────── */
const Divider = () => <div className="mx-3 my-2 h-px bg-border/50" />;

/* ── Sidebar ──────────────────────────────────────────── */
const Sidebar = ({ className, showOnMobile = false }: SidebarProps) => {
  const { isAdmin, isSuperAdmin } = useAdminAuth();

  const mainNav: NavItem[] = [
    { icon: Home,    label: "Home",          url: "/" },
    { icon: Flame,   label: "In-Play / Live", url: "/live",             badge: "LIVE" },
    { icon: Layers,  label: "Betting Hub",    url: "/betting-hub" },
    { icon: Ticket,  label: "My Bets",        url: "/account/bet-tickets" },
    { icon: History, label: "Bet History",    url: "/account/history" },
  ];

  const promos: NavItem[] = [
    { icon: Trophy,     label: "FuzJackpot",       url: "/jackpot",                    badge: "₦10M+",  badgeColor: "yellow", emoji: "🏆" },
    { icon: Gift,       label: "Welcome Bonus",     url: "/promotions/welcome",         badge: "300%",   badgeColor: "green" },
    { icon: Zap,        label: "Acca Boost",        url: "/promotions/acca-boost",      badge: "50%",    badgeColor: "yellow" },
    { icon: Shield,     label: "FuzInsurance",      url: "/promotions/fuz-insurance" },
    { icon: DollarSign, label: "Cashback",          url: "/promotions/cashback" },
    { icon: Users,      label: "Refer a Friend",    url: "/promotions/refer-friend",    badge: "EARN",   badgeColor: "green" },
    { icon: Award,      label: "Loyalty Rewards",   url: "/promotions/loyalty-rewards" },
    { icon: Star,       label: "Weekend Specials",  url: "/promotions/weekend-specials" },
  ];

  const football: NavItem[] = [
    { icon: CircleDot, label: "All Football",          url: "/sports/football",                      emoji: "⚽" },
    { icon: CircleDot, label: "Premier League",         url: "/football/premier-league",              emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { icon: CircleDot, label: "Champions League",       url: "/football/champions-league",            emoji: "⭐" },
    { icon: CircleDot, label: "La Liga",                url: "/football/la-liga",                     emoji: "🇪🇸" },
    { icon: CircleDot, label: "Serie A",                url: "/football/serie-a",                     emoji: "🇮🇹" },
    { icon: CircleDot, label: "Bundesliga",             url: "/football/bundesliga",                  emoji: "🇩🇪" },
    { icon: CircleDot, label: "Ligue 1",                url: "/football/ligue-1",                     emoji: "🇫🇷" },
    { icon: CircleDot, label: "Europa League",          url: "/football/europa-league",               emoji: "🟠" },
    { icon: CircleDot, label: "Championship",           url: "/football/championship",                emoji: "🏆" },
    { icon: CircleDot, label: "CAF Champions League",   url: "/football/caf-champions-league",        emoji: "🌍" },
    { icon: CircleDot, label: "AFCON 2027",             url: "/football/african-cup-of-nations",      badge: "HOT", badgeColor: "yellow", emoji: "🌍" },
    { icon: CircleDot, label: "World Cup 2026",         url: "/football/world-cup",                   badge: "HOT", badgeColor: "red",    emoji: "🌐" },
  ];

  const otherSports: NavItem[] = [
    { icon: CircleDot, label: "Basketball / NBA",   url: "/sports/basketball",      emoji: "🏀" },
    { icon: CircleDot, label: "Tennis / ATP",        url: "/sports/tennis",          emoji: "🎾" },
    { icon: CircleDot, label: "Cricket",             url: "/sports/cricket",         emoji: "🏏" },
    { icon: CircleDot, label: "American Football",   url: "/sports/american-football", emoji: "🏈" },
    { icon: CircleDot, label: "Ice Hockey",          url: "/sports/ice-hockey",      emoji: "🏒" },
    { icon: CircleDot, label: "Rugby",               url: "/sports/rugby",           emoji: "🏉" },
    { icon: CircleDot, label: "Boxing / MMA",        url: "/sports/boxing",          emoji: "🥊" },
    { icon: CircleDot, label: "Baseball",            url: "/sports/baseball",        emoji: "⚾" },
    { icon: CircleDot, label: "Volleyball",          url: "/sports/volleyball",      emoji: "🏐" },
    { icon: CircleDot, label: "Table Tennis",        url: "/sports/table-tennis",    emoji: "🏓" },
    { icon: CircleDot, label: "Darts",               url: "/sports/darts",           emoji: "🎯" },
    { icon: CircleDot, label: "Snooker",             url: "/sports/snooker",         emoji: "🎱" },
    { icon: CircleDot, label: "Golf",                url: "/sports/golf",            emoji: "⛳" },
    { icon: CircleDot, label: "Esports",             url: "/sports/esports",         emoji: "🎮" },
  ];

  const racing: NavItem[] = [
    { icon: TrendingUp, label: "All Racing",        url: "/racing",              emoji: "🏁" },
    { icon: TrendingUp, label: "Horse Racing",      url: "/racing/horse",        emoji: "🏇" },
    { icon: TrendingUp, label: "Greyhound Racing",  url: "/racing/dog",          emoji: "🐕" },
    { icon: TrendingUp, label: "Formula 1",         url: "/racing/f1",           emoji: "🏎️" },
    { icon: TrendingUp, label: "MotoGP",            url: "/racing/motogp",       emoji: "🏍️" },
    { icon: TrendingUp, label: "Cheltenham",        url: "/racing/cheltenham",   emoji: "🐎" },
    { icon: TrendingUp, label: "Ascot",             url: "/racing/ascot",        emoji: "👑" },
  ];

  const casino: NavItem[] = [
    { icon: Gamepad2, label: "Casino Lobby",         url: "/casino-lobby",              emoji: "🎰" },
    { icon: Gamepad2, label: "Live Casino",           url: "/live-casino",         badge: "LIVE", emoji: "📺" },
    { icon: Gamepad2, label: "Slots",                 url: "/casino/slots",              emoji: "🎰" },
    { icon: Gamepad2, label: "Roulette",              url: "/casino/roulette",           emoji: "🔴" },
    { icon: Gamepad2, label: "Blackjack",             url: "/casino/blackjack",          emoji: "🃏" },
    { icon: Gamepad2, label: "Poker",                 url: "/live-casino/poker",         emoji: "♠️" },
    { icon: Gamepad2, label: "Baccarat",              url: "/live-casino/baccarat",      emoji: "🎴" },
    { icon: Gamepad2, label: "Game Show",             url: "/casino/game-show",    badge: "AI",  badgeColor: "purple", emoji: "🎪" },
    { icon: Gamepad2, label: "Crash Games",           url: "/casino/burst",        badge: "HOT", badgeColor: "red",    emoji: "🚀" },
    { icon: Gamepad2, label: "Keno",                  url: "/casino/keno",               emoji: "🔢" },
    { icon: Gamepad2, label: "Bingo",                 url: "/casino/bingo",              emoji: "📋" },
    { icon: Gamepad2, label: "Scratch Cards",         url: "/casino/scratch-cards",      emoji: "🎟️" },
    { icon: Coins,    label: "Coin Flip",             url: "/casino/coin-flip",          emoji: "🪙" },
    { icon: Gamepad2, label: "Craps",                 url: "/casino/craps",              emoji: "🎲" },
    { icon: Swords,   label: "Rock Paper Scissors",   url: "/casino/rock-paper-scissors", emoji: "✂️" },
  ];

  const virtuals: NavItem[] = [
    { icon: Radio,  label: "Virtual Sports",    url: "/virtuals",         emoji: "🤖" },
    { icon: Tv2,    label: "Virtual Stadium",   url: "/virtual-stadium",  badge: "VR",  badgeColor: "purple", emoji: "🏟️" },
  ];

  const predict: NavItem[] = [
    { icon: Target,     label: "FuzPredict",   url: "/predict",   emoji: "🎯", badge: "NEW", badgeColor: "green" },
    { icon: TrendingUp, label: "FuzPolitics",  url: "/politics",  emoji: "🏛️" },
    { icon: TrendingUp, label: "FuzEconomy",   url: "/economy",   emoji: "📈" },
    { icon: Star,       label: "FuzSocial",    url: "/social",    emoji: "🎭" },
  ];

  const specials: NavItem[] = [
    { icon: Brain,    label: "AI Predictions",   url: "/ai-predictions",  badge: "AI", badgeColor: "purple" },
    { icon: Activity, label: "AI Features",      url: "/ai-features",     badge: "AI", badgeColor: "purple" },
    { icon: Target,   label: "Pool Betting",     url: "/pool-betting" },
    { icon: Users,    label: "Social Betting",   url: "/social-betting",  badge: "P2P" },
    { icon: Trophy,   label: "Fantasy Football", url: "/fantasy/nigerian", badge: "🇳🇬" },
    { icon: Trophy,   label: "Fantasy Sports",   url: "/fantasy-sports" },
    { icon: Globe,    label: "Bet Marketplace",  url: "/bet-marketplace" },
    { icon: Wallet,   label: "Web3 Hub",         url: "/web3-hub",        badge: "NFT", badgeColor: "purple" },
  ];


  const account: NavItem[] = [
    { icon: BarChart3,  label: "Statistics",          url: "/account/statistics" },
    { icon: CreditCard, label: "Deposit",             url: "/account/deposits" },
    { icon: CreditCard, label: "Withdraw",            url: "/account/withdrawals" },
    { icon: History,    label: "Transactions",        url: "/account/transactions" },
    { icon: Shield,     label: "Responsible Gaming",  url: "/account/player-protection", badge: "NLRC" },
    { icon: Users,      label: "Affiliate Program",   url: "/affiliate",                 badge: "EARN", badgeColor: "green" },
    { icon: Settings,   label: "Settings",            url: "/account/settings" },
  ];

  const admin: NavItem[] = [
    { icon: Shield,     label: "Dashboard",         url: "/admin/dashboard" },
    { icon: Users,      label: "Users",             url: "/admin/users" },
    { icon: Ticket,     label: "Bets",              url: "/admin/bets" },
    { icon: DollarSign, label: "Treasury",          url: "/admin/treasury" },
    { icon: FileText,   label: "Ledger",            url: "/admin/ledger" },
    { icon: Shield,     label: "KYC",               url: "/admin/kyc" },
    { icon: CreditCard, label: "Withdrawals",       url: "/admin/withdrawals" },
    { icon: Activity,   label: "Operations",        url: "/admin/operations" },
    { icon: Shield,     label: "Compliance",        url: "/admin/compliance" },
    { icon: BarChart3,  label: "Reports",           url: "/admin/reports" },
    { icon: Settings,   label: "Settings",          url: "/admin/settings" },
    ...(isSuperAdmin ? [
      { icon: Database, label: "Disaster Recovery", url: "/admin/disaster-recovery" },
      { icon: Lock,     label: "Webhook Settings",  url: "/admin/webhooks" },
      { icon: Shield,   label: "Super Admin",       url: "/admin/super" },
    ] : []),
  ];

  const sections: NavSection[] = [
    { id: "promo",    title: "🎁 Promotions & Jackpot",  items: promos,       defaultOpen: true  },
    { id: "football", title: "⚽ Football",               items: football,     defaultOpen: true  },
    { id: "sports",   title: "🏆 Other Sports",           items: otherSports,  defaultOpen: false },
    { id: "racing",   title: "🏁 Racing",                 items: racing,       defaultOpen: false },
    { id: "casino",   title: "🎰 Casino",                 items: casino,       defaultOpen: false },
    { id: "virtuals", title: "🤖 Virtuals",                items: virtuals,     defaultOpen: false },
    { id: "predict",  title: "🔮 Prediction Markets",      items: predict,      defaultOpen: false },
    { id: "specials", title: "⚡ Special Features",       items: specials,     defaultOpen: false },
    { id: "account",  title: "👤 My Account",             items: account,      defaultOpen: false },
  ];

  return (
    <aside className={cn(
      showOnMobile ? "flex" : "hidden md:flex",
      "w-56 border-r border-border bg-sidebar flex-col",
      "h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide",
      className
    )}>

      {/* ── Main nav (always visible) ────────────────── */}
      <div className="pt-2 pb-1">
        {mainNav.map(item => <SidebarItem key={item.url} item={item} />)}
      </div>

      <Divider />

      {/* ── Collapsible sections ─────────────────────── */}
      <div className="pb-4 space-y-0">
        {sections.map(section => (
          <SectionGroup key={section.id} {...section} />
        ))}

        {isAdmin && (
          <>
            <Divider />
            <SectionGroup
              id="admin"
              title="🔐 Admin"
              items={admin}
              defaultOpen={false}
            />
          </>
        )}
      </div>

    </aside>
  );
};

export default Sidebar;
