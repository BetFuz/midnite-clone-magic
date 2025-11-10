import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Racing = () => {
  const [selectedTab, setSelectedTab] = useState("All Races");
  
  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    toast({
      title: "Filter Applied",
      description: `Showing ${tab}`,
    });
  };
  
  const handleViewRaceCard = (venue: string) => {
    toast({
      title: "Race Card",
      description: `Viewing ${venue} race card`,
    });
  };
  
  const handleFormGuide = (venue: string) => {
    toast({
      title: "Form Guide",
      description: `Opening ${venue} form guide`,
    });
  };
  
  const handleHorseClick = (horseName: string) => {
    toast({
      title: "Horse Selected",
      description: `Viewing details for ${horseName}`,
    });
  };

  const races = [
    {
      venue: "Ascot",
      country: "UK",
      time: "14:10",
      distance: "1m 4f",
      class: "Class 2",
      runners: 8,
      going: "Good to Firm",
    },
    {
      venue: "Cheltenham",
      country: "UK",
      time: "14:45",
      distance: "2m 3f",
      class: "Class 1",
      runners: 12,
      going: "Soft",
    },
    {
      venue: "Kempton",
      country: "UK",
      time: "15:20",
      distance: "6f",
      class: "Class 3",
      runners: 10,
      going: "Standard",
    },
    {
      venue: "Leopardstown",
      country: "IRE",
      time: "15:55",
      distance: "1m 2f",
      class: "Grade 1",
      runners: 7,
      going: "Yielding",
    },
  ];

  const featuredHorses = [
    { name: "Thunder Strike", odds: "5/2", trainer: "J. Smith" },
    { name: "Golden Arrow", odds: "3/1", trainer: "M. Williams" },
    { name: "Midnight Runner", odds: "7/2", trainer: "P. Johnson" },
    { name: "Silver Bullet", odds: "4/1", trainer: "R. Brown" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Horse Racing</h1>
            <p className="text-muted-foreground">Today's racing from top venues</p>
          </div>

          <div className="grid gap-2 mb-6">
            {["All Races", "UK", "Ireland", "Antepost", "Results"].map((tab) => (
              <Button
                key={tab}
                variant={selectedTab === tab ? "default" : "secondary"}
                size="sm"
                className="justify-start"
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Today's Race Cards</h2>
            <div className="grid gap-4">
              {races.map((race, index) => (
                <Card key={index} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{race.venue}</h3>
                        <span className="px-2 py-0.5 bg-secondary text-xs font-medium rounded">
                          {race.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{race.time}</span>
                        </div>
                        <span>{race.distance}</span>
                        <span>{race.class}</span>
                        <span>{race.runners} runners</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Going</div>
                      <div className="text-sm font-medium text-foreground">{race.going}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleViewRaceCard(race.venue)}>
                      View Race Card
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleFormGuide(race.venue)}>
                      Form Guide
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">Featured Runners</h2>
            <div className="grid grid-cols-2 gap-4">
              {featuredHorses.map((horse, index) => (
                <Card key={index} className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleHorseClick(horse.name)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{horse.name}</h3>
                      <p className="text-xs text-muted-foreground">{horse.trainer}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-odds">{horse.odds}</div>
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

export default Racing;
