import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";

const MatchDetail = () => {
  const { id } = useParams();

  const toTitle = (str: string) =>
    str
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const slug = id || "manchester-united-vs-liverpool";
  const [leftSlug = "manchester-united", rightSlug = "liverpool"] = slug.split("-vs-");
  const leftTeam = toTitle(leftSlug);
  const rightTeam = toTitle(rightSlug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <Card className="p-6 bg-gradient-hero border-border/50 mb-6">
            <Badge className="mb-2">Match</Badge>
            <div className="flex items-center justify-between text-white mb-2 gap-2">
              <div className="text-center flex-1 min-w-0">
                <h2 className="font-extrabold leading-tight break-words text-2xl md:text-4xl">
                  {leftTeam}
                </h2>
              </div>
              <div className="text-center px-4 md:px-8 shrink-0">
                <div className="text-xs md:text-sm mb-1">Saturday 15:00</div>
                <div className="text-3xl md:text-4xl font-black">VS</div>
              </div>
              <div className="text-center flex-1 min-w-0">
                <h2 className="font-extrabold leading-tight break-words text-2xl md:text-4xl">
                  {rightTeam}
                </h2>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button className="h-20 flex flex-col bg-card hover:bg-primary/20 border border-border">
              <span className="text-xs text-muted-foreground">Home</span>
              <span className="text-2xl font-bold text-odds">3.60</span>
            </Button>
            <Button className="h-20 flex flex-col bg-card hover:bg-primary/20 border border-border">
              <span className="text-xs text-muted-foreground">Draw</span>
              <span className="text-2xl font-bold text-odds">3.30</span>
            </Button>
            <Button className="h-20 flex flex-col bg-card hover:bg-primary/20 border border-border">
              <span className="text-xs text-muted-foreground">Away</span>
              <span className="text-2xl font-bold text-odds">2.00</span>
            </Button>
          </div>

          <Card className="p-5 bg-card border-border mb-4">
            <h3 className="font-bold text-foreground mb-4">Match Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Form (Last 5)</span>
                <div className="flex gap-1">
                  <Badge className="bg-success">W</Badge>
                  <Badge className="bg-success">W</Badge>
                  <Badge variant="secondary">D</Badge>
                  <Badge className="bg-destructive">L</Badge>
                  <Badge className="bg-success">W</Badge>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Head to Head</span>
                <span className="text-foreground">Last 5: 2W - 1D - 2L</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <h3 className="font-bold text-foreground mb-4">More Markets</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                <span>Both Teams To Score</span>
                <span className="text-odds font-bold">1.85</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Over 2.5 Goals</span>
                <span className="text-odds font-bold">1.75</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>First Goal Scorer</span>
                <span className="text-primary">View</span>
              </Button>
            </div>
          </Card>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default MatchDetail;
