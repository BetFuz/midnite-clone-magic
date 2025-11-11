import { NavLink } from "@/components/NavLink";
import { Card } from "@/components/ui/card";
import { User, Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard, TicketCheck, History, BarChart3, Trophy, Settings } from "lucide-react";

export const AccountNav = () => {
  const accountLinks = [
    { icon: User, label: "Profile", url: "/account/profile" },
    { icon: ArrowDownToLine, label: "Deposits", url: "/account/deposits" },
    { icon: ArrowUpFromLine, label: "Withdrawals", url: "/account/withdrawals" },
    { icon: CreditCard, label: "Transactions", url: "/account/transactions" },
    { icon: TicketCheck, label: "Bet Tickets", url: "/account/bet-tickets" },
    { icon: History, label: "Betting History", url: "/account/history" },
    { icon: BarChart3, label: "Statistics", url: "/account/statistics" },
    { icon: Trophy, label: "Leaderboard", url: "/account/leaderboard" },
    { icon: Settings, label: "Settings", url: "/account/settings" },
  ];

  const iconColors = [
    "text-primary bg-primary/10 hover:bg-primary/20",
    "text-success bg-success/10 hover:bg-success/20",
    "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
    "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20",
    "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20",
    "text-pink-500 bg-pink-500/10 hover:bg-pink-500/20",
    "text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20",
    "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20",
    "text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20",
  ];

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-border mb-6">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
        Account Menu
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {accountLinks.map((link, index) => (
          <NavLink
            key={link.url}
            to={link.url}
            className="w-full"
            activeClassName="bg-primary/10 border-primary/30"
          >
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group">
              <div className={`p-2 rounded-lg transition-all ${iconColors[index % iconColors.length]}`}>
                <link.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground text-center group-hover:text-primary transition-colors">{link.label}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </Card>
  );
};
