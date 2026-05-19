import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  Home, Tv2, Ticket, LayoutGrid, User, X, ChevronRight,
  ShieldCheck, Gamepad2, Gift, Trophy, Flame,
  TrendingUp, DollarSign, History, Settings, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import BetSlip from "@/components/BetSlip";

/* ── "More" drawer sections ─────────────────────────────── */
const MORE_SECTIONS = [
  {
    label: "Sports",
    items: [
      { icon: "⚽", label: "Football",        url: "/sports/football" },
      { icon: "🏀", label: "Basketball",      url: "/sports/basketball" },
      { icon: "🎾", label: "Tennis",          url: "/sports/tennis" },
      { icon: "🏏", label: "Cricket",         url: "/sports/cricket" },
      { icon: "🏉", label: "Rugby",           url: "/sports/rugby" },
      { icon: "🥊", label: "MMA / Boxing",    url: "/sports/mma" },
      { icon: "🏇", label: "Horse Racing",    url: "/racing/horse" },
      { icon: "🏎️", label: "F1 Racing",      url: "/racing/f1" },
      { icon: "🏈", label: "American Football", url: "/sports/american-football" },
      { icon: "🎱", label: "Snooker",         url: "/sports/snooker" },
      { icon: "🎯", label: "Darts",           url: "/sports/darts" },
      { icon: "⛳", label: "Golf",            url: "/sports/golf" },
    ],
  },
  {
    label: "Top Competitions",
    items: [
      { icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "Premier League",     url: "/football/premier-league" },
      { icon: "⭐", label: "Champions League",    url: "/football/champions-league" },
      { icon: "🇪🇸", label: "La Liga",           url: "/football/la-liga" },
      { icon: "🇩🇪", label: "Bundesliga",        url: "/football/bundesliga" },
      { icon: "🇮🇹", label: "Serie A",           url: "/football/serie-a" },
      { icon: "🇫🇷", label: "Ligue 1",           url: "/football/ligue-1" },
      { icon: "🌍", label: "AFCON",              url: "/football/african-cup-of-nations" },
      { icon: "🌍", label: "CAF Champions League", url: "/football/caf-champions-league" },
      { icon: "🌍", label: "World Cup 2026",     url: "/football/world-cup" },
      { icon: "🇳🇬", label: "NPFL Nigeria",      url: "/sports/football" },
      { icon: "🇿🇦", label: "PSL South Africa",  url: "/football/south-african-premier-league" },
      { icon: "🇪🇬", label: "Egyptian Premier",  url: "/football/egyptian-premier-league" },
    ],
  },
  {
    label: "Casino & Games",
    items: [
      { icon: "🎮", label: "FuzGames",        url: "/games" },
      { icon: "🎰", label: "Casino",          url: "/casino-lobby" },
      { icon: "🃏", label: "Live Casino",     url: "/live-casino" },
      { icon: "⚡", label: "Virtual Sports",  url: "/virtuals" },
      { icon: "🚀", label: "Aviator",         url: "/games" },
      { icon: "💣", label: "Mines",           url: "/games" },
    ],
  },
  {
    label: "Betting Features",
    items: [
      { icon: "⚡", label: "Flash Odds",      url: "/bet-features" },
      { icon: "🎯", label: "FuzJackpot",      url: "/jackpot" },
      { icon: "🎁", label: "Promotions",      url: "/promotions" },
      { icon: "🔮", label: "AI Predictions",  url: "/ai-predictions" },
      { icon: "📊", label: "Betting Hub",     url: "/betting-hub" },
      { icon: "🏆", label: "Fantasy Sports",  url: "/fantasy-sports" },
    ],
  },
  {
    label: "Specials",
    items: [
      { icon: "🗳️", label: "FuzPolitics",    url: "/politics" },
      { icon: "💹", label: "FuzEconomy",      url: "/economy" },
      { icon: "👥", label: "Social Betting",  url: "/social-betting" },
      { icon: "🔮", label: "FuzPredict",      url: "/predict" },
    ],
  },
  {
    label: "My Account",
    items: [
      { icon: "👤", label: "Profile",         url: "/account/profile" },
      { icon: "💳", label: "Deposit",         url: "/account/deposits" },
      { icon: "📤", label: "Withdraw",        url: "/account/withdrawals" },
      { icon: "📋", label: "Transactions",    url: "/account/transactions" },
      { icon: "🎟️", label: "My Bets",        url: "/account/bet-tickets" },
      { icon: "👑", label: "VIP Club",        url: "/account/vip" },
      { icon: "🎁", label: "Bonuses",         url: "/account/bonuses" },
      { icon: "🤝", label: "Refer & Earn",    url: "/account/referral" },
      { icon: "🛡️", label: "Verification",   url: "/account/kyc" },
      { icon: "📈", label: "Statistics",      url: "/account/statistics" },
      { icon: "🎮", label: "Resp. Gaming",    url: "/account/limits" },
      { icon: "⚙️", label: "Settings",       url: "/account/settings" },
    ],
  },
];

function isActive(url: string, pathname: string) {
  return url === "/" ? pathname === "/" : pathname.startsWith(url);
}

export const BottomNav = () => {
  const { selections } = useBetSlip();
  const location = useLocation();
  const navigate = useNavigate();
  const [betSlipOpen, setBetSlipOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── 5 tabs: Home · Live · Bet Slip · Games · More ──── */
  const TABS = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      url: "/",
      action: () => navigate("/"),
    },
    {
      id: "live",
      icon: Tv2,
      label: "Live",
      url: "/live",
      action: () => navigate("/live"),
      pulse: true,
    },
    {
      id: "betslip",
      icon: Ticket,
      label: "My Bets",
      url: null,
      action: () => setBetSlipOpen(true),
      accent: true,
    },
    {
      id: "games",
      icon: Gamepad2,
      label: "Games",
      url: "/games",
      action: () => navigate("/games"),
    },
    {
      id: "more",
      icon: LayoutGrid,
      label: "More",
      url: null,
      action: () => setMenuOpen(true),
    },
  ];

  return (
    <>
      {/* ── Fixed bottom bar ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-[56px]">
          {TABS.map(tab => {
            const active = tab.url ? isActive(tab.url, location.pathname) : false;
            const isBetSlip = tab.id === "betslip";
            const hasSelections = selections.length > 0;

            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all active:scale-95",
                  isBetSlip ? "" : active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active top indicator */}
                {active && !isBetSlip && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-primary" />
                )}

                {isBetSlip ? (
                  /* Bet Slip — prominent center button */
                  <>
                    <div className={cn(
                      "relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all",
                      hasSelections
                        ? "bg-green-600 shadow-[0_2px_12px_rgba(22,163,74,0.4)]"
                        : "bg-muted"
                    )}>
                      <Ticket className={cn("w-4.5 h-4.5", hasSelections ? "text-white" : "text-muted-foreground")} />
                      {hasSelections && (
                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white px-1 leading-none shadow-sm">
                          {selections.length > 9 ? "9+" : selections.length}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold leading-none mt-0.5",
                      hasSelections ? "text-green-500" : "text-muted-foreground"
                    )}>
                      My Bets
                    </span>
                  </>
                ) : (
                  /* Regular tab */
                  <>
                    <div className="relative">
                      <tab.icon className={cn("w-[22px] h-[22px]", active ? "text-primary" : "")} />
                      {/* Live pulse dot */}
                      {tab.pulse && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
                      {/* More dot when menu sections have items */}
                      {tab.id === "more" && !menuOpen && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary/60" />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold leading-none mt-0.5",
                      active ? "text-primary" : ""
                    )}>
                      {tab.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Bet Slip sheet ────────────────────────────── */}
      <Sheet open={betSlipOpen} onOpenChange={setBetSlipOpen}>
        <SheetContent side="right" className="p-0 w-full sm:w-80">
          <SheetTitle className="sr-only">Bet Slip</SheetTitle>
          <SheetDescription className="sr-only">Review and place your bets</SheetDescription>
          <BetSlip showOnMobile />
        </SheetContent>
      </Sheet>

      {/* ── More menu — full-height bottom sheet ─────── */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="h-[92vh] p-0 rounded-t-2xl overflow-hidden flex flex-col">
          <SheetTitle className="sr-only">All Sections</SheetTitle>
          <SheetDescription className="sr-only">Navigate to all sections of BetFuz</SheetDescription>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-primary">BetFuz</span>
              <span className="text-[10px] text-muted-foreground font-medium">All Sections</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Quick actions row */}
          <div className="px-4 py-3 flex gap-2 shrink-0 border-b border-border/50">
            {[
              { icon: "💳", label: "Deposit",  url: "/account/deposits" },
              { icon: "👑", label: "VIP Club", url: "/account/vip" },
              { icon: "🎁", label: "Bonuses",  url: "/account/bonuses" },
              { icon: "❓", label: "Help",     url: "/info/help" },
            ].map(q => (
              <button
                key={q.label}
                onClick={() => {
                  if (q.action) { q.action(); return; }
                  if (q.url) { navigate(q.url); setMenuOpen(false); }
                }}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-muted/50 border border-border hover:bg-muted active:scale-95 transition-all"
              >
                <span className="text-lg leading-none">{q.icon}</span>
                <span className="text-[9px] font-semibold text-muted-foreground">{q.label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable section list */}
          <div className="overflow-y-auto flex-1 pb-10">
            {MORE_SECTIONS.map(section => (
              <div key={section.label} className="px-4 pt-4">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">
                  {section.label}
                </p>
                <div className="grid grid-cols-3 gap-1.5 mb-1">
                  {section.items.map(item => {
                    const active = isActive(item.url, location.pathname);
                    return (
                      <button
                        key={item.url + item.label}
                        onClick={() => { navigate(item.url); setMenuOpen(false); }}
                        className={cn(
                          "flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center transition-all active:scale-95",
                          active
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted/40 border-border/50 text-foreground hover:bg-muted hover:border-border"
                        )}
                      >
                        <span className="text-xl leading-none">{item.icon}</span>
                        <span className="text-[10px] font-semibold leading-tight line-clamp-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Admin */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">Admin</p>
              <button
                onClick={() => { navigate("/admin/dashboard"); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted active:scale-95 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-semibold flex-1 text-left">Admin Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
