import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FlashOdds from '@/components/FlashOdds';
import BetBuilder from '@/components/BetBuilder';
import PlayerMarkets from '@/components/PlayerMarkets';
import OddsMovementTracker from '@/components/OddsMovementTracker';
import BetAlerts from '@/components/BetAlerts';
import MatchIntelligence from '@/components/MatchIntelligence';
import LiveBetTracker from '@/components/LiveBetTracker';

const BetFeatures = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Advanced Betting Features</h1>
              <p className="text-muted-foreground">
                Explore all the advanced tools and features to enhance your betting experience
              </p>
            </div>

            <Tabs defaultValue="flash" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
                <TabsTrigger value="flash">Flash Odds</TabsTrigger>
                <TabsTrigger value="builder">Bet Builder</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
                <TabsTrigger value="movement">Movement</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
                <TabsTrigger value="tracker">Live Tracker</TabsTrigger>
              </TabsList>

              <TabsContent value="flash" className="space-y-6">
                <FlashOdds />
              </TabsContent>

              <TabsContent value="builder" className="space-y-6">
                <BetBuilder />
              </TabsContent>

              <TabsContent value="players" className="space-y-6">
                <PlayerMarkets />
              </TabsContent>

              <TabsContent value="movement" className="space-y-6">
                <OddsMovementTracker />
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <BetAlerts />
              </TabsContent>

              <TabsContent value="intelligence" className="space-y-6">
                <MatchIntelligence />
              </TabsContent>

              <TabsContent value="tracker" className="space-y-6">
                <LiveBetTracker />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BetFeatures;
