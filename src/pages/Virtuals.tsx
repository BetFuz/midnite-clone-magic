import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Virtuals = () => {
  const navigate = useNavigate();
  
  const handlePlayVirtual = (gameName: string, path?: string) => {
    if (path) {
      navigate(path);
      return;
    }
    toast({
      title: "Loading Virtual Game",
      description: `${gameName} is starting...`,
    });
  };
  
  const handlePlaceBet = (match: string) => {
    toast({
      title: "Bet Placed",
      description: `Your bet on ${match} has been added to your bet slip`,
    });
  };
  
  const handleViewSchedule = (gameName: string) => {
    toast({
      title: "Schedule",
      description: `Viewing ${gameName} schedule`,
    });
  };

  const virtualGames = [
    {
      name: "Virtual Football League",
      nextRace: "2 mins",
      frequency: "Every 3 mins",
      description: "Fast-paced virtual football matches with realistic graphics",
    },
    {
      name: "Virtual Horse Racing",
      nextRace: "45 secs",
      frequency: "Every 2 mins",
      description: "Experience the thrill of horse racing 24/7",
    },
    {
      name: "Virtual Greyhounds",
      nextRace: "1 min",
      frequency: "Every 90 secs",
      description: "Non-stop greyhound racing action",
    },
    {
      name: "Virtual Tennis",
      nextRace: "3 mins",
      frequency: "Every 5 mins",
      description: "Watch virtual tennis matches unfold",
    },
    {
      name: "🏎️ AI-Powered F1 Racing",
      nextRace: "Now Live",
      frequency: "On Demand",
      description: "Experience Formula 1 Grand Prix with AI-generated scenarios, live commentary, and real betting",
      path: "/racing/f1",
    },
    {
      name: "Virtual Motorsports",
      nextRace: "4 mins",
      frequency: "Every 6 mins",
      description: "High-speed virtual racing excitement",
    },
    {
      name: "Virtual Basketball",
      nextRace: "2 mins",
      frequency: "Every 4 mins",
      description: "Fast-paced virtual basketball games",
    },
  ];

  const upcomingEvents = [
    { league: "Virtual Premier League", match: "City vs United", time: "2:34" },
    { league: "Virtual Champions Cup", match: "Madrid vs Bayern", time: "5:12" },
    { league: "Virtual World Series", match: "Brazil vs France", time: "8:45" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Virtual Sports</h1>
            <p className="text-muted-foreground">24/7 action with instant results</p>
          </div>

          <section className="mb-8">
            <Card className="p-6 bg-gradient-hero border-border/50 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Next Event Starting Soon</h2>
                  <p className="text-white/90 mb-4">Virtual Premier League - City vs United</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                      <Clock className="h-5 w-5 mr-2" />
                      2:34
                    </Badge>
                    <Button size="lg" className="bg-white text-primary font-bold hover:bg-white/90" onClick={() => handlePlaceBet("City vs United")}>
                      Place Bet Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <h2 className="text-xl font-bold text-foreground mb-4">Available Virtual Sports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {virtualGames.map((game, index) => (
                <Card key={index} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer" onClick={() => handlePlayVirtual(game.name, game.path)}>
                  <div className="aspect-video bg-gradient-card relative">
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-success/90 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        Next: {game.nextRace}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full w-16 h-16 p-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); handlePlayVirtual(game.name, game.path); }}>
                        <Play className="h-6 w-6" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{game.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{game.frequency}</span>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleViewSchedule(game.name); }}>
                        View Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{event.league}</div>
                      <div className="font-semibold text-foreground">{event.match}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-base font-bold">
                        {event.time}
                      </Badge>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handlePlaceBet(event.match)}>
                        Bet Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>

        <BetSlip />
      </div>
    </div>
  );
};

export default Virtuals;
