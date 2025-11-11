import { Home, TrendingUp, Trophy, User, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const BottomNav = () => {
  const { selections } = useBetSlip();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainNavItems = [
    { icon: Home, label: "Home", url: "/" },
    { icon: TrendingUp, label: "Live", url: "/live" },
    { icon: Trophy, label: "Stats", url: "/account/statistics" },
    { icon: User, label: "Account", url: "/account/profile" },
  ];

  const menuItems = [
    { label: "Trading", items: [
      { label: "Betting Hub", url: "/betting-hub" },
      { label: "Bet Features", url: "/bet-features" },
    ]},
    { label: "Sports", items: [
      { label: "Football", url: "/sports/football" },
      { label: "Basketball", url: "/sports/basketball" },
      { label: "Tennis", url: "/sports/tennis" },
      { label: "Cricket", url: "/sports/cricket" },
    ]},
    { label: "Features", items: [
      { label: "FuzPolitics", url: "/politics" },
      { label: "Promotions", url: "/promotions" },
      { label: "Leaderboard", url: "/account/leaderboard" },
      { label: "History", url: "/account/history" },
    ]},
    { label: "Account", items: [
      { label: "Deposits", url: "/account/deposits" },
      { label: "Withdrawals", url: "/account/withdrawals" },
      { label: "Transactions", url: "/account/transactions" },
      { label: "Settings", url: "/account/settings" },
    ]},
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-card to-card/95 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex flex-col items-center justify-center p-3 rounded-xl transition-all active:scale-95"
            activeClassName="bg-primary/10 text-primary"
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "relative",
                  isActive && "animate-bounce"
                )}>
                  <item.icon className={cn(
                    "h-6 w-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {item.label === "Stats" && selections.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {selections.length}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center p-3 rounded-xl transition-all active:scale-95 hover:bg-muted/50">
              <Menu className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium mt-1 text-muted-foreground">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <div className="py-6 space-y-6 overflow-y-auto h-full">
              <h2 className="text-2xl font-bold text-foreground px-4">Menu</h2>
              {menuItems.map((section) => (
                <div key={section.label} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4">
                    {section.label}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg mx-2 transition-colors hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-semibold"
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
