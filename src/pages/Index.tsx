import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import HeroBanner from "@/components/HeroBanner";
import MatchCard from "@/components/MatchCard";
import BoostCard from "@/components/BoostCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const categories = [
    "Today's Football",
    "Premier League",
    "Champions League",
    "NFL",
    "NBA",
  ];

  const featuredMatches = [
    {
      time: "Today 15:00",
      homeTeam: "Manchester United",
      awayTeam: "Liverpool FC",
      homeOdds: "3.60",
      drawOdds: "3.30",
      awayOdds: "2.00",
    },
    {
      time: "Today 17:30",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      homeOdds: "1.97",
      drawOdds: "3.80",
      awayOdds: "5.00",
    },
    {
      time: "Today 20:00",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeOdds: "3.50",
      drawOdds: "2.88",
      awayOdds: "2.15",
    },
  ];

  const boosts = [
    {
      title: "Triple Treble Boost",
      description: "Featured Bet Builder - Premier League • Today 15:00",
      wasOdds: "3/1",
      nowOdds: "4/1",
    },
    {
      title: "Champions League Special",
      description: "Featured Acca - Champions League • Tomorrow 20:45",
      wasOdds: "5/2",
      nowOdds: "3/1",
    },
    {
      title: "Weekend Accumulator",
      description: "Featured Double - Top Leagues • Tomorrow 14:45",
      wasOdds: "6/4",
      nowOdds: "2/1",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <HeroBanner />

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Featured Matches</h2>
            <div className="grid gap-4">
              {featuredMatches.map((match, index) => (
                <MatchCard key={index} {...match} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-full bg-primary/20 p-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Boosts</h2>
            </div>
            <div className="grid gap-4">
              {boosts.map((boost, index) => (
                <BoostCard key={index} {...boost} />
              ))}
            </div>
          </section>
        </main>

        <BetSlip />
      </div>
    </div>
  );
};

export default Index;

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
