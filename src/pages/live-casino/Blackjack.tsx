import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { LiveDealerInterface } from '@/components/LiveDealerInterface';

const Blackjack = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Live Blackjack</h1>
              <p className="text-muted-foreground">
                Play with professional Nigerian dealers in real-time
              </p>
            </div>
            
            <LiveDealerInterface />
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Blackjack;
