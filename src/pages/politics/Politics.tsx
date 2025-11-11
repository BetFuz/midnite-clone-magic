import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PoliticalMarketCard from '@/components/politics/PoliticalMarketCard';
import { Vote, Building2, Globe2, Scale, Trophy } from 'lucide-react';

const Politics = () => {
  const elections = [
    {
      id: '1',
      title: '2024 US Presidential Election',
      category: 'Presidential Election',
      deadline: '2024-11-05T00:00:00',
      markets: [
        { outcome: 'Democrat Win', odds: 1.85 },
        { outcome: 'Republican Win', odds: 2.10 },
        { outcome: 'Independent Win', odds: 15.00 },
      ],
    },
    {
      id: '2',
      title: 'Nigerian Presidential Election 2027',
      category: 'Presidential Election',
      deadline: '2027-02-25T00:00:00',
      markets: [
        { outcome: 'APC Victory', odds: 2.20 },
        { outcome: 'PDP Victory', odds: 2.50 },
        { outcome: 'Labour Party Victory', odds: 4.50 },
        { outcome: 'Other Party', odds: 12.00 },
      ],
    },
    {
      id: '3',
      title: 'UK General Election 2024',
      category: 'Parliamentary Election',
      deadline: '2024-12-31T00:00:00',
      markets: [
        { outcome: 'Labour Majority', odds: 1.55 },
        { outcome: 'Conservative Majority', odds: 4.20 },
        { outcome: 'Coalition Government', odds: 3.80 },
      ],
    },
  ];

  const globalEvents = [
    {
      id: '4',
      title: 'UN Security Council Reform 2025',
      category: 'UN Resolution',
      deadline: '2025-06-30T00:00:00',
      markets: [
        { outcome: 'Reform Passes', odds: 3.50 },
        { outcome: 'Reform Rejected', odds: 1.40 },
      ],
    },
    {
      id: '5',
      title: 'African Union Summit Outcome',
      category: 'AU Resolution',
      deadline: '2024-07-15T00:00:00',
      markets: [
        { outcome: 'New Peace Agreement', odds: 2.10 },
        { outcome: 'No Agreement', odds: 1.95 },
      ],
    },
  ];

  const governance = [
    {
      id: '6',
      title: 'Federal Reserve Interest Rate Decision',
      category: 'Policy Decision',
      deadline: '2024-03-20T00:00:00',
      markets: [
        { outcome: 'Rate Cut 0.25%', odds: 2.30 },
        { outcome: 'Rate Hold', odds: 1.80 },
        { outcome: 'Rate Increase', odds: 5.50 },
      ],
    },
    {
      id: '7',
      title: 'UK Supreme Court Ruling on Brexit Deal',
      category: 'Court Ruling',
      deadline: '2024-05-10T00:00:00',
      markets: [
        { outcome: 'Ruling in Favor', odds: 1.65 },
        { outcome: 'Ruling Against', odds: 2.40 },
      ],
    },
  ];

  const leadership = [
    {
      id: '8',
      title: 'Next AU Chairperson 2025',
      category: 'Political Leadership',
      deadline: '2025-02-01T00:00:00',
      markets: [
        { outcome: 'East Africa Candidate', odds: 2.00 },
        { outcome: 'West Africa Candidate', odds: 2.20 },
        { outcome: 'North Africa Candidate', odds: 3.50 },
        { outcome: 'Southern Africa Candidate', odds: 4.00 },
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
                <Vote className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">FuzPolitics</h1>
              </div>
              <p className="text-muted-foreground">
                Bet on global political events, elections, and governance decisions
              </p>
            </div>

            <Tabs defaultValue="elections" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="elections">
                  <Vote className="h-4 w-4 mr-2" />
                  Elections
                </TabsTrigger>
                <TabsTrigger value="global">
                  <Globe2 className="h-4 w-4 mr-2" />
                  Global Events
                </TabsTrigger>
                <TabsTrigger value="governance">
                  <Building2 className="h-4 w-4 mr-2" />
                  Governance
                </TabsTrigger>
                <TabsTrigger value="leadership">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leadership
                </TabsTrigger>
              </TabsList>

              <TabsContent value="elections" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Elections & Referendums</h2>
                </div>
                {elections.map(market => (
                  <PoliticalMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="global" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Globe2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Global Political Events</h2>
                </div>
                {globalEvents.map(market => (
                  <PoliticalMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Policy & Court Decisions</h2>
                </div>
                {governance.map(market => (
                  <PoliticalMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="leadership" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Political Leadership</h2>
                </div>
                {leadership.map(market => (
                  <PoliticalMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Politics;
