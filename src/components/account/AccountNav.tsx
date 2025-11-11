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

  return (
    <Card className="p-4 bg-card border-border mb-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Account Menu
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {accountLinks.map((link) => (
          <NavLink
            key={link.url}
            to={link.url}
            className="w-full"
            activeClassName="bg-primary/10 border-primary/30"
          >
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <link.icon className="h-5 w-5 text-foreground" />
              <span className="text-xs font-medium text-foreground text-center">{link.label}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </Card>
  );
};
