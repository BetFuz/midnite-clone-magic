import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { BurstGameInterface } from '@/components/BurstGameInterface';

const BurstGames = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64">
          <BurstGameInterface />
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default BurstGames;
