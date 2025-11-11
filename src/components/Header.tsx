import { Search, LogIn, User, LogOut, Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard, History as HistoryIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
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
  const { user, profile } = useUserProfile();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-8">
          <MobileNav />
          <Link to="/" className="flex items-center gap-2">
            <div className="text-xl md:text-2xl font-bold text-primary">Betfuz</div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
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
                  {formatCurrency(profile?.balance || 0)}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{profile?.full_name || user.email?.split('@')[0]}</span>
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
