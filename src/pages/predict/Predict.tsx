import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PredictMarketCard from '@/components/predict/PredictMarketCard';
import { Sparkles, Users, Globe2, Zap, TrendingUp, Clock } from 'lucide-react';

const Predict = () => {
  const communityPolls = [
    {
      id: '1',
      title: 'Will Fuel Price Exceed ₦1000/Litre in 2024?',
      category: 'Community Poll',
      deadline: '2024-12-31T23:59:00',
      totalVotes: 45234,
      markets: [
        { outcome: 'Yes', odds: 1.75, votes: 28500 },
        { outcome: 'No', odds: 2.20, votes: 16734 },
      ],
    },
    {
      id: '2',
      title: 'Next Big Tech Layoff Announcement',
      category: 'Community Poll',
      deadline: '2024-06-30T23:59:00',
      totalVotes: 32100,
      markets: [
        { outcome: 'Meta', odds: 3.20, votes: 8000 },
        { outcome: 'Google', odds: 3.50, votes: 7200 },
        { outcome: 'Amazon', odds: 3.80, votes: 6500 },
        { outcome: 'Microsoft', odds: 4.00, votes: 5900 },
        { outcome: 'Other Company', odds: 2.50, votes: 4500 },
      ],
    },
  ];

  const sentimentBets = [
    {
      id: '3',
      title: 'Will Twitter/X Change Its Name Again?',
      category: 'Public Sentiment',
      deadline: '2025-12-31T23:59:00',
      totalVotes: 28900,
      markets: [
        { outcome: 'Yes', odds: 4.50, votes: 5800 },
        { outcome: 'No', odds: 1.30, votes: 23100 },
      ],
    },
    {
      id: '4',
      title: 'Lagos-Ibadan Expressway Completion',
      category: 'Public Sentiment',
      deadline: '2024-12-31T23:59:00',
      totalVotes: 52300,
      markets: [
        { outcome: 'Completed in 2024', odds: 5.00, votes: 8400 },
        { outcome: 'Delayed to 2025', odds: 1.60, votes: 32000 },
        { outcome: 'Delayed Beyond 2025', odds: 2.80, votes: 11900 },
      ],
    },
  ];

  const trendPredictions = [
    {
      id: '5',
      title: 'Most Downloaded App of 2024',
      category: 'Trend Prediction',
      deadline: '2025-01-31T23:59:00',
      totalVotes: 38700,
      markets: [
        { outcome: 'TikTok', odds: 2.10, votes: 15800 },
        { outcome: 'Instagram', odds: 3.20, votes: 9500 },
        { outcome: 'WhatsApp', odds: 3.80, votes: 7200 },
        { outcome: 'New AI App', odds: 4.50, votes: 6200 },
      ],
    },
    {
      id: '6',
      title: 'Will ChatGPT-5 Launch in 2024?',
      category: 'Trend Prediction',
      deadline: '2024-12-31T23:59:00',
      totalVotes: 41200,
      markets: [
        { outcome: 'Yes', odds: 2.30, votes: 18000 },
        { outcome: 'No', odds: 1.75, votes: 23200 },
      ],
    },
  ];

  const quickPolls = [
    {
      id: '7',
      title: 'Next Nigerian State to Ban Okada',
      category: 'Quick Poll',
      deadline: '2024-09-30T23:59:00',
      totalVotes: 25600,
      markets: [
        { outcome: 'Ogun State', odds: 3.00, votes: 7800 },
        { outcome: 'Oyo State', odds: 3.50, votes: 6400 },
        { outcome: 'Rivers State', odds: 4.20, votes: 5100 },
        { outcome: 'Other State', odds: 2.80, votes: 6300 },
      ],
    },
    {
      id: '8',
      title: 'Will Elon Musk Buy Another Company in 2024?',
      category: 'Quick Poll',
      deadline: '2024-12-31T23:59:00',
      totalVotes: 34800,
      markets: [
        { outcome: 'Yes', odds: 2.50, votes: 12900 },
        { outcome: 'No', odds: 1.65, votes: 21900 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8 text-violet-500" />
                <h1 className="text-3xl font-bold">FuzPredict</h1>
              </div>
              <p className="text-muted-foreground">
                Community-driven predictions powered by collective intelligence
              </p>
            </div>

            <Tabs defaultValue="community" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="community">
                  <Users className="h-4 w-4 mr-2" />
                  Community
                </TabsTrigger>
                <TabsTrigger value="sentiment">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sentiment
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <Zap className="h-4 w-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="quick">
                  <Clock className="h-4 w-4 mr-2" />
                  Quick Polls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">Community Polls</h2>
                </div>
                {communityPolls.map(market => (
                  <PredictMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="sentiment" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Public Sentiment Bets</h2>
                </div>
                {sentimentBets.map(market => (
                  <PredictMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Trend Predictions</h2>
                </div>
                {trendPredictions.map(market => (
                  <PredictMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="quick" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-semibold">Quick Polls</h2>
                </div>
                {quickPolls.map(market => (
                  <PredictMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Predict;
