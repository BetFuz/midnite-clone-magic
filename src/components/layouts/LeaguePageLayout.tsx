import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { LeagueMatchSchedule } from "@/components/LeagueMatchSchedule";
import LeagueTable from "@/components/LeagueTable";
import { Badge } from "@/components/ui/badge";
import { useLeagueMatchCounts } from "@/hooks/useLeagueMatchCounts";
import { LEAGUE_LOGOS } from "@/utils/teamLogos";

interface LeaguePageLayoutProps {
  title: string;
  description?: string;
  leagueName: string;
  emoji?: string;
  logoUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
  daysAhead?: number;
  hasTable?: boolean;
}

const TABS = ["Fixtures", "Table", "Outrights"] as const;
type Tab = typeof TABS[number];

const LeaguePageLayout = ({
  title,
  leagueName,
  emoji = "⚽",
  logoUrl,
  gradientFrom = "from-green-700",
  gradientTo = "to-emerald-900",
  daysAhead = 14,
  hasTable = true,
}: LeaguePageLayoutProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Fixtures");
  const [logoError, setLogoError] = useState(false);
  const { data: counts } = useLeagueMatchCounts([leagueName], 14);
  const matchCount = counts?.[leagueName] ?? 0;
  const resolvedLogoUrl = LEAGUE_LOGOS[leagueName] ?? logoUrl;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-4 md:px-6 py-4`}>
            <div className="flex items-center gap-3">
              {resolvedLogoUrl && !logoError ? (
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src={resolvedLogoUrl}
                    alt={title}
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <span className="text-3xl">{emoji}</span>
              )}
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
                {matchCount > 0 && (
                  <Badge className="mt-0.5 bg-white/20 text-white border-white/30 text-[10px] px-1.5">
                    {matchCount} upcoming
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-0 border-b border-border bg-card">
            {TABS.filter(t => t !== "Table" || hasTable).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-4 md:px-6 py-3">
            {activeTab === "Fixtures" && (
              <LeagueMatchSchedule leagueName={leagueName} daysAhead={daysAhead} />
            )}
            {activeTab === "Table" && hasTable && (
              <LeagueTable leagueName={leagueName} />
            )}
            {activeTab === "Outrights" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">Outright markets coming soon</p>
              </div>
            )}
          </div>
        </main>

        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default LeaguePageLayout;
