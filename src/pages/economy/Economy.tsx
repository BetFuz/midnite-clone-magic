import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EconomicMarketCard from '@/components/economy/EconomicMarketCard';
import { DollarSign, TrendingUp, Building2, Rocket, Globe2, BarChart3 } from 'lucide-react';

const Economy = () => {
  const stockMarkets = [
    {
      id: '1',
      title: 'S&P 500 Year-End Close 2024',
      category: 'Stock Index',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Above 5,500', odds: 2.20 },
        { outcome: '5,000 - 5,500', odds: 2.80 },
        { outcome: 'Below 5,000', odds: 4.50 },
      ],
    },
    {
      id: '2',
      title: 'Nigerian Stock Exchange All-Share Index',
      category: 'Stock Index',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Above 70,000', odds: 2.10 },
        { outcome: '65,000 - 70,000', odds: 3.00 },
        { outcome: 'Below 65,000', odds: 3.80 },
      ],
    },
    {
      id: '3',
      title: 'FTSE 100 Performance',
      category: 'Stock Index',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Gain >10%', odds: 2.50 },
        { outcome: 'Gain 0-10%', odds: 2.30 },
        { outcome: 'Loss', odds: 4.00 },
      ],
    },
  ];

  const cryptoMarkets = [
    {
      id: '4',
      title: 'Bitcoin Price End of 2024',
      category: 'Cryptocurrency',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Above $100,000', odds: 3.50 },
        { outcome: '$50,000 - $100,000', odds: 1.80 },
        { outcome: 'Below $50,000', odds: 4.20 },
      ],
    },
    {
      id: '5',
      title: 'Ethereum to Reach $5,000',
      category: 'Cryptocurrency',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Yes', odds: 2.80 },
        { outcome: 'No', odds: 1.55 },
      ],
    },
    {
      id: '6',
      title: 'New All-Time High for Bitcoin in 2024',
      category: 'Cryptocurrency',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Yes', odds: 2.20 },
        { outcome: 'No', odds: 1.75 },
      ],
    },
  ];

  const techLaunches = [
    {
      id: '7',
      title: 'Apple Vision Pro Sales',
      category: 'Tech Launch',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Over 5M Units', odds: 2.50 },
        { outcome: '2-5M Units', odds: 2.00 },
        { outcome: 'Under 2M Units', odds: 3.80 },
      ],
    },
    {
      id: '8',
      title: 'Tesla Model 2 Launch Date',
      category: 'Tech Launch',
      deadline: '2025-12-31T23:59:00',
      markets: [
        { outcome: 'Q1-Q2 2025', odds: 3.20 },
        { outcome: 'Q3-Q4 2025', odds: 2.10 },
        { outcome: 'Delayed to 2026', odds: 2.80 },
      ],
    },
  ];

  const africanStartups = [
    {
      id: '9',
      title: 'Next Nigerian Unicorn 2024',
      category: 'African Startup',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Fintech Startup', odds: 1.90 },
        { outcome: 'E-Commerce Platform', odds: 3.20 },
        { outcome: 'Logistics/Transport', odds: 4.50 },
        { outcome: 'Other Sector', odds: 6.00 },
      ],
    },
    {
      id: '10',
      title: 'Flutterwave Valuation by End 2024',
      category: 'African Startup',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Above $4B', odds: 2.40 },
        { outcome: '$3-4B', odds: 2.10 },
        { outcome: 'Below $3B', odds: 3.50 },
      ],
    },
  ];

  const commodities = [
    {
      id: '11',
      title: 'Gold Price End of 2024',
      category: 'Commodity',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Above $2,500/oz', odds: 2.30 },
        { outcome: '$2,000-$2,500/oz', odds: 1.90 },
        { outcome: 'Below $2,000/oz', odds: 4.20 },
      ],
    },
    {
      id: '12',
      title: 'Oil (Brent Crude) Price',
      category: 'Commodity',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Above $100/barrel', odds: 3.80 },
        { outcome: '$70-$100/barrel', odds: 1.70 },
        { outcome: 'Below $70/barrel', odds: 3.20 },
      ],
    },
  ];

  const macroEconomics = [
    {
      id: '13',
      title: 'US Inflation Rate December 2024',
      category: 'Macro Economics',
      deadline: '2025-01-15T00:00:00',
      markets: [
        { outcome: 'Above 4%', odds: 3.50 },
        { outcome: '2-4%', odds: 1.80 },
        { outcome: 'Below 2%', odds: 4.00 },
      ],
    },
    {
      id: '14',
      title: 'Nigeria GDP Growth 2024',
      category: 'Macro Economics',
      deadline: '2025-03-31T00:00:00',
      markets: [
        { outcome: 'Above 3%', odds: 2.10 },
        { outcome: '1-3%', odds: 2.30 },
        { outcome: 'Below 1%', odds: 4.50 },
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
                <DollarSign className="h-8 w-8 text-emerald-500" />
                <h1 className="text-3xl font-bold">FuzEconomy</h1>
              </div>
              <p className="text-muted-foreground">
                Bet on markets, crypto, tech launches, and economic indicators
              </p>
            </div>

            <Tabs defaultValue="stocks" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="stocks">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Stocks
                </TabsTrigger>
                <TabsTrigger value="crypto">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Crypto
                </TabsTrigger>
                <TabsTrigger value="tech">
                  <Rocket className="h-4 w-4 mr-2" />
                  Tech
                </TabsTrigger>
                <TabsTrigger value="startups">
                  <Building2 className="h-4 w-4 mr-2" />
                  Startups
                </TabsTrigger>
                <TabsTrigger value="commodities">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Commodities
                </TabsTrigger>
                <TabsTrigger value="macro">
                  <Globe2 className="h-4 w-4 mr-2" />
                  Macro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stocks" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Stock Market Indexes</h2>
                </div>
                {stockMarkets.map(market => (
                  <EconomicMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="crypto" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Cryptocurrency Markets</h2>
                </div>
                {cryptoMarkets.map(market => (
                  <EconomicMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="tech" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">Tech Product Launches</h2>
                </div>
                {techLaunches.map(market => (
                  <EconomicMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="startups" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-semibold">African Startup Valuations</h2>
                </div>
                {africanStartups.map(market => (
                  <EconomicMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="commodities" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold">Commodity Prices</h2>
                </div>
                {commodities.map(market => (
                  <EconomicMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="macro" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Globe2 className="h-5 w-5 text-cyan-500" />
                  <h2 className="text-xl font-semibold">Macroeconomic Indicators</h2>
                </div>
                {macroEconomics.map(market => (
                  <EconomicMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Economy;
