import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import RouletteGame from "@/components/RouletteGame";

const Roulette = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <RouletteGame />
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Roulette;
