import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { SlotMachine } from "@/components/SlotMachine";

const Slots = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-2 text-center">🎰 AI Slot Machine 🎰</h1>
            <p className="text-muted-foreground text-center mb-8">
              Powered by Lovable AI • Dynamic Themes • Real-time Gaming
            </p>
            <SlotMachine />
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Slots;
