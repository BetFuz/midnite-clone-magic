import React from "react";
import { Search, LogIn, User, LogOut, Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard, History as HistoryIcon, Settings, Home, ChevronRight, ShoppingCart, Crown, Gift, Shield, Users } from "lucide-react";
import LiveTicker from "./LiveTicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import BetSlip from "./BetSlip";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LangContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selections } = useBetSlip();
  const { lang, setLang } = useLang();
  const [headerBalance, setHeaderBalance] = React.useState(0);

  React.useEffect(() => {
    if (!user) { setHeaderBalance(0); return; }
    import('@/lib/api/wallet').then(({ walletApi }) => {
      walletApi.getBalance().then(d => setHeaderBalance(d?.balance ?? 0)).catch(() => {});
    });
    const interval = setInterval(() => {
      import('@/lib/api/wallet').then(({ walletApi }) => {
        walletApi.getBalance().then(d => setHeaderBalance(d?.balance ?? 0)).catch(() => {});
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const navItems = [
    { label: "🏠 Home", path: "/", key: "home" },
    { label: "🔴 Live", path: "/live", key: "live" },
    { label: "⚽ Sports", path: "/", key: "sports" },
    { label: "🏇 Racing", path: "/racing", key: "racing" },
    { label: "🎮 Games", path: "/games", key: "games" },
    { label: "🎰 Live Casino", path: "/live-casino", key: "live-casino" },
    { label: "🎲 Virtuals", path: "/virtuals", key: "virtuals" },
  ];

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleJoin = () => {
    navigate("/auth");
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
    navigate("/");
  };

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [];
    
    const breadcrumbs = paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <LiveTicker />
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <MobileNav />

          {/* BetFuz Logo — two-tone, always visible on all screen sizes */}
          <Link to="/" className="flex items-center flex-shrink-0 select-none">
            <span className="text-xl md:text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-foreground">Bet</span><span className="text-primary">Fuz</span>
            </span>
          </Link>

          {/* Breadcrumbs — desktop only */}
          {breadcrumbs.length > 0 && (
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1">
                  <Link
                    to={crumb.href}
                    className={cn(
                      "hover:text-primary transition-colors",
                      index === breadcrumbs.length - 1 && "text-foreground font-medium"
                    )}
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Desktop home shortcut */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            <span className="font-semibold">Home</span>
          </Button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                className={cn(
                  "text-foreground hover:text-primary",
                  location.pathname === item.path && "text-primary bg-primary/10"
                )}
                asChild
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          {/* Bet Slip Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {selections.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {selections.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full sm:w-96">
              <SheetTitle className="sr-only">Bet Slip</SheetTitle>
              <SheetDescription className="sr-only">Review and place your bets</SheetDescription>
              <BetSlip showOnMobile />
            </SheetContent>
          </Sheet>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary border border-border rounded-lg px-2 py-1 transition-colors"
            title={lang === 'en' ? 'Switch to French' : 'Passer en anglais'}
          >
            {lang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
          <ThemeToggle />
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="w-64 pl-10 bg-secondary border-border"
            />
          </div>
          
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(headerBalance)}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.firstName} {user.lastName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account/deposits")}>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Deposit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/withdrawals")}>
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    Withdraw
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/transactions")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Transactions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account/bet-tickets")}>
                    <Wallet className="mr-2 h-4 w-4" />
                    My Bets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/history")}>
                    <HistoryIcon className="mr-2 h-4 w-4" />
                    Betting History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account/vip")}>
                    <Crown className="mr-2 h-4 w-4" />
                    VIP Club
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/bonuses")}>
                    <Gift className="mr-2 h-4 w-4" />
                    Bonuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/referral")}>
                    <Users className="mr-2 h-4 w-4" />
                    Refer &amp; Earn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/kyc")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Verification
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleJoin}>
                <span className="hidden sm:inline">Join Now</span>
                <span className="sm:hidden">Join</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
