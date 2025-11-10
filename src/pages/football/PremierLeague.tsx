import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";
import { Card } from "@/components/ui/card";

const PremierLeague = () => {
  const matches = [
    { 
      time: "Sat 12:30", 
      homeTeam: "Manchester United", 
      awayTeam: "Liverpool", 
      homeOdds: "3.60", 
      drawOdds: "3.30", 
      awayOdds: "2.00",
      homeForm: "WDLWL",
      awayForm: "WWWDW",
      popularBet: "Liverpool",
      popularBetPercentage: 58
    },
    { 
      time: "Sat 15:00", 
      homeTeam: "Arsenal", 
      awayTeam: "Chelsea", 
      homeOdds: "1.97", 
      drawOdds: "3.80", 
      awayOdds: "5.00",
      homeForm: "WWLWD",
      awayForm: "WLDWL",
      popularBet: "Arsenal",
      popularBetPercentage: 67
    },
    { 
      time: "Sat 15:00", 
      homeTeam: "Manchester City", 
      awayTeam: "Tottenham", 
      homeOdds: "1.45", 
      drawOdds: "4.50", 
      awayOdds: "7.00",
      homeForm: "WWDWW",
      awayForm: "WDLDD",
      popularBet: "Man City",
      popularBetPercentage: 82
    },
    { 
      time: "Sat 17:30", 
      homeTeam: "Newcastle", 
      awayTeam: "Brighton", 
      homeOdds: "2.10", 
      drawOdds: "3.40", 
      awayOdds: "3.60",
      homeForm: "DWWLD",
      awayForm: "WDWLL",
      popularBet: "Newcastle",
      popularBetPercentage: 52
    },
    { 
      time: "Sun 14:00", 
      homeTeam: "Aston Villa", 
      awayTeam: "West Ham", 
      homeOdds: "2.30", 
      drawOdds: "3.30", 
      awayOdds: "3.20",
      homeForm: "WWLDW",
      awayForm: "LDWDL",
      popularBet: "Aston Villa",
      popularBetPercentage: 48
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          <h1 className="text-3xl font-bold text-foreground mb-2">Premier League</h1>
          <p className="text-muted-foreground mb-6">England's top football division</p>
          <Card className="p-4 bg-gradient-card border-border mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Current Leader</div>
                <div className="text-2xl font-bold text-foreground">Manchester City</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top Scorer</div>
                <div className="text-2xl font-bold text-foreground">E. Haaland (25)</div>
              </div>
            </div>
          </Card>
          <div className="grid gap-4">
            {matches.map((match, i) => <MatchCard key={i} {...match} />)}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default PremierLeague;
