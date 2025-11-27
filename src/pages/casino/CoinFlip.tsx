import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { CoinFlipGame } from '@/components/CoinFlipGame';

const CoinFlip = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Coin Flip</h1>
              <p className="text-muted-foreground">
                Experience dramatic coin flips with AI-generated narratives
              </p>
            </div>
            
            <CoinFlipGame />
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default CoinFlip;
