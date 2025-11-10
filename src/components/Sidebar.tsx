import { Home, Trophy, CircleDot, Flame, Hammer, Target, TrendingUp, Dumbbell, Volleyball, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Trophy, label: "Rewards" },
    { icon: Flame, label: "In-Play", badge: "54" },
    { icon: Hammer, label: "Acca Builder" },
  ];

  const sportsCategories = [
    { icon: CircleDot, label: "Football" },
    { icon: TrendingUp, label: "Horse Racing" },
    { icon: CircleDot, label: "American Football" },
    { icon: Target, label: "Darts" },
    { icon: Volleyball, label: "Tennis" },
    { icon: Dumbbell, label: "Basketball" },
    { icon: Table2, label: "Table Tennis" },
  ];

  return (
    <aside className={cn("w-64 border-r border-border bg-sidebar h-[calc(100vh-4rem)] overflow-y-auto", className)}>
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div>
          <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sports
          </h3>
          <div className="space-y-1">
            {sportsCategories.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
