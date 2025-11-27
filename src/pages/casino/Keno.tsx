import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { KenoGame } from '@/components/KenoGame';

const Keno = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64">
          <KenoGame />
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default Keno;
