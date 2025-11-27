import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import BaccaratGame from "@/components/BaccaratGame";

const Baccarat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <BaccaratGame />
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Baccarat;
