import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const Slots = () => {
  const slots = [
    { name: "Starburst", provider: "NetEnt", rtp: "96.09%" },
    { name: "Book of Dead", provider: "Play'n GO", rtp: "96.21%" },
    { name: "Gonzo's Quest", provider: "NetEnt", rtp: "95.97%" },
    { name: "Immortal Romance", provider: "Microgaming", rtp: "96.86%" },
    { name: "Bonanza Megaways", provider: "Big Time Gaming", rtp: "96%" },
    { name: "Dead or Alive 2", provider: "NetEnt", rtp: "96.80%" },
    { name: "Reactoonz", provider: "Play'n GO", rtp: "96.51%" },
    { name: "Wolf Gold", provider: "Pragmatic Play", rtp: "96.01%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Slot Games</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <Card key={slot.name} className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                <div className="aspect-square bg-gradient-card relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="lg" className="rounded-full w-16 h-16 p-0">
                      <Play className="h-6 w-6" fill="currentColor" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{slot.name}</h3>
                  <p className="text-xs text-muted-foreground">{slot.provider}</p>
                  <p className="text-xs text-success mt-1">RTP: {slot.rtp}</p>
                </div>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Slots;
