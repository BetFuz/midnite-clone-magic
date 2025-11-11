import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const WeekendSpecials = () => {
  const featuredMatches = [
    { home: "Manchester United", away: "Liverpool", sport: "Football", normalOdds: 2.50, boostedOdds: 3.20, boost: "+28%" },
    { home: "Lakers", away: "Warriors", sport: "Basketball", normalOdds: 1.85, boostedOdds: 2.40, boost: "+30%" },
    { home: "Real Madrid", away: "Barcelona", sport: "Football", normalOdds: 2.10, boostedOdds: 2.75, boost: "+31%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Weekend Specials</h1>
                  <p className="text-muted-foreground">Enhanced odds on the biggest matches every weekend</p>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-orange-500/10 via-orange-600/10 to-background border-2 border-orange-500/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-foreground">This Weekend's Boosted Odds</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Get up to <span className="text-orange-500 font-bold text-xl">+35% boost</span> on selected matches
              </p>
              <Badge className="bg-orange-500 text-white">Every Friday - Sunday</Badge>
            </Card>

            <div className="space-y-4 mb-8">
              {featuredMatches.map((match, idx) => (
                <Card key={idx} className="p-6 bg-card border-border hover:border-orange-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Badge className="bg-orange-500/20 text-orange-500 mb-2">{match.sport}</Badge>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {match.home} vs {match.away}
                      </h3>
                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Normal Odds</p>
                          <p className="text-lg line-through text-muted-foreground">{match.normalOdds}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-orange-500 font-semibold">Boosted Odds</p>
                          <p className="text-2xl font-bold text-orange-500">{match.boostedOdds}</p>
                        </div>
                        <Badge className="bg-success text-white ml-2">{match.boost}</Badge>
                      </div>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Add to Bet Slip
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-muted/50 border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">How It Works</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>✓ Enhanced odds available Friday through Sunday</li>
                    <li>✓ Boost applies automatically when you add selections</li>
                    <li>✓ Maximum stake: {formatCurrency(100000)}</li>
                    <li>✓ Terms and conditions apply. 18+ BeGambleAware.org</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeekendSpecials;
