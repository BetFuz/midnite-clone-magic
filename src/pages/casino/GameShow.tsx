import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { GameShowGame } from '@/components/GameShowGame';

const GameShow = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Game Show</h1>
              <p className="text-muted-foreground">
                Experience the thrill of a live game show with AI hosts and progressive jackpots
              </p>
            </div>
            
            <GameShowGame />
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default GameShow;
