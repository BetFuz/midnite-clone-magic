import { Home, Trophy, CircleDot, Flame, Hammer, Target, TrendingUp, Dumbbell, Volleyball, Table2, TicketCheck, BarChart3, History, CreditCard, Vote, LayoutGrid, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";

interface SidebarProps {
  className?: string;
  showOnMobile?: boolean;
}

const Sidebar = ({ className, showOnMobile = false }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Home", url: "/" },
    { icon: LayoutGrid, label: "Betting Hub", url: "/betting-hub", badge: "NEW" },
    { icon: Flame, label: "In-Play", url: "/live", badge: "LIVE" },
    { icon: TicketCheck, label: "My Bets", url: "/account/bet-tickets" },
    { icon: History, label: "History", url: "/account/history" },
    { icon: BarChart3, label: "Statistics", url: "/account/statistics" },
    { icon: CreditCard, label: "Transactions", url: "/account/transactions" },
    { icon: Trophy, label: "Rewards", url: "/promotions/welcome" },
    { icon: Hammer, label: "Acca Builder", url: "/promotions/acca-boost" },
    { icon: Vote, label: "FuzPolitics", url: "/politics" },
    { icon: DollarSign, label: "FuzEconomy", url: "/economy", badge: "NEW" },
    { icon: TrendingUp, label: "Racing", url: "/racing" },
    { icon: CircleDot, label: "Games", url: "/games" },
    { icon: Target, label: "Live Casino", url: "/live-casino" },
    { icon: Dumbbell, label: "Virtuals", url: "/virtuals" },
  ];

  const sportsCategories = [
    { icon: CircleDot, label: "Football", url: "/sports/football" },
    { icon: Dumbbell, label: "Basketball", url: "/sports/basketball" },
    { icon: Volleyball, label: "Tennis", url: "/sports/tennis" },
    { icon: Table2, label: "Cricket", url: "/sports/cricket" },
    { icon: CircleDot, label: "Rugby", url: "/sports/rugby" },
    { icon: CircleDot, label: "Volleyball", url: "/sports/volleyball" },
    { icon: CircleDot, label: "Ice Hockey", url: "/sports/ice-hockey" },
    { icon: CircleDot, label: "Baseball", url: "/sports/baseball" },
    { icon: CircleDot, label: "American Football", url: "/sports/american-football" },
    { icon: Target, label: "Table Tennis", url: "/sports/table-tennis" },
    { icon: Target, label: "Handball", url: "/sports/handball" },
    { icon: Target, label: "Darts", url: "/sports/darts" },
    { icon: Target, label: "Snooker", url: "/sports/snooker" },
    { icon: Target, label: "Badminton", url: "/sports/badminton" },
    { icon: Target, label: "Golf", url: "/sports/golf" },
    { icon: CircleDot, label: "Futsal", url: "/sports/futsal" },
    { icon: CircleDot, label: "Cycling", url: "/sports/cycling" },
    { icon: CircleDot, label: "Motor Sports", url: "/sports/motor-sports" },
    { icon: CircleDot, label: "Beach Volleyball", url: "/sports/beach-volleyball" },
    { icon: Target, label: "Boxing", url: "/sports/boxing" },
    { icon: Target, label: "MMA", url: "/sports/mma" },
    { icon: CircleDot, label: "eSports", url: "/sports/esports" },
    { icon: TrendingUp, label: "Horse Racing", url: "/racing" },
  ];

  return (
    <aside className={cn(showOnMobile ? "flex" : "hidden md:flex", "w-64 border-r border-border bg-sidebar h-[calc(100vh-4rem)] overflow-y-auto flex-col", className)}>
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.url}
              className="w-full"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <div
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded">
                    {item.badge}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </div>

        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sports
          </h3>
          <div className="space-y-1">
            {sportsCategories.map((item) => (
              <NavLink
                key={item.label}
                to={item.url}
                className="w-full"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
