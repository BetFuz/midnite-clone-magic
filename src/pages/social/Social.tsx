import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SocialMarketCard from '@/components/social/SocialMarketCard';
import { Users, Trophy, Star, TrendingUp, Music, Film } from 'lucide-react';

const Social = () => {
  const awards = [
    {
      id: '1',
      title: 'Oscars 2025 Best Picture',
      category: 'Entertainment Awards',
      deadline: '2025-03-10T00:00:00',
      markets: [
        { outcome: 'Oppenheimer', odds: 2.20 },
        { outcome: 'Killers of the Flower Moon', odds: 3.50 },
        { outcome: 'Poor Things', odds: 4.20 },
        { outcome: 'Other Film', odds: 5.50 },
      ],
    },
    {
      id: '2',
      title: 'Grammy 2025 Album of the Year',
      category: 'Entertainment Awards',
      deadline: '2025-02-04T00:00:00',
      markets: [
        { outcome: 'Beyoncé - Renaissance', odds: 2.10 },
        { outcome: 'Taylor Swift - Midnights', odds: 2.80 },
        { outcome: 'SZA - SOS', odds: 3.20 },
        { outcome: 'Other Artist', odds: 6.00 },
      ],
    },
    {
      id: '3',
      title: 'AMVCA 2024 Best Actor',
      category: 'Entertainment Awards',
      deadline: '2024-05-20T00:00:00',
      markets: [
        { outcome: 'Kunle Remi', odds: 2.50 },
        { outcome: 'Stan Nze', odds: 3.00 },
        { outcome: 'Timini Egbuson', odds: 3.80 },
        { outcome: 'Other Actor', odds: 5.00 },
      ],
    },
  ];

  const realityShows = [
    {
      id: '4',
      title: 'BBNaija 2024 Winner',
      category: 'Reality Shows',
      deadline: '2024-10-01T00:00:00',
      markets: [
        { outcome: 'Ilebaye', odds: 2.80 },
        { outcome: 'Mercy Eke', odds: 3.20 },
        { outcome: 'Ceec', odds: 3.50 },
        { outcome: 'Other Housemate', odds: 4.00 },
      ],
    },
    {
      id: '5',
      title: 'Love Island UK 2024 Winners',
      category: 'Reality Shows',
      deadline: '2024-08-30T00:00:00',
      markets: [
        { outcome: 'Couple A', odds: 2.50 },
        { outcome: 'Couple B', odds: 2.90 },
        { outcome: 'Couple C', odds: 3.80 },
        { outcome: 'Other Couple', odds: 5.50 },
      ],
    },
  ];

  const celebrity = [
    {
      id: '6',
      title: 'Next Celebrity Engagement',
      category: 'Celebrity Events',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Wizkid', odds: 3.50 },
        { outcome: 'Davido', odds: 4.20 },
        { outcome: 'Burna Boy', odds: 3.80 },
        { outcome: 'Other Celebrity', odds: 2.10 },
      ],
    },
    {
      id: '7',
      title: 'Most Viral TikTok Trend of 2024',
      category: 'Viral Trends',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Dance Challenge', odds: 2.30 },
        { outcome: 'Comedy Skit Format', odds: 2.80 },
        { outcome: 'Music Trend', odds: 3.20 },
        { outcome: 'Other Trend Type', odds: 4.50 },
      ],
    },
  ];

  const entertainment = [
    {
      id: '8',
      title: 'Highest Grossing Film 2024',
      category: 'Box Office',
      deadline: '2025-01-15T00:00:00',
      markets: [
        { outcome: 'Deadpool 3', odds: 2.50 },
        { outcome: 'Inside Out 2', odds: 3.00 },
        { outcome: 'Dune Part 2', odds: 3.50 },
        { outcome: 'Other Film', odds: 4.00 },
      ],
    },
    {
      id: '9',
      title: 'Billboard Hot 100 #1 Christmas',
      category: 'Music Charts',
      deadline: '2024-12-25T00:00:00',
      markets: [
        { outcome: 'All I Want For Christmas', odds: 1.50 },
        { outcome: 'New Christmas Song', odds: 3.80 },
        { outcome: 'Pop Hit', odds: 4.50 },
        { outcome: 'Other Song', odds: 6.00 },
      ],
    },
    {
      id: '10',
      title: 'Nigerian Music Awards Artist of the Year',
      category: 'Music Awards',
      deadline: '2024-12-15T00:00:00',
      markets: [
        { outcome: 'Asake', odds: 2.20 },
        { outcome: 'Rema', odds: 2.80 },
        { outcome: 'Olamide', odds: 3.50 },
        { outcome: 'Ayra Starr', odds: 4.00 },
        { outcome: 'Other Artist', odds: 5.50 },
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
                <Users className="h-8 w-8 text-pink-500" />
                <h1 className="text-3xl font-bold">FuzSocial</h1>
              </div>
              <p className="text-muted-foreground">
                Bet on entertainment, celebrity events, reality shows, and viral trends
              </p>
            </div>

            <Tabs defaultValue="awards" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="awards">
                  <Trophy className="h-4 w-4 mr-2" />
                  Awards
                </TabsTrigger>
                <TabsTrigger value="reality">
                  <Star className="h-4 w-4 mr-2" />
                  Reality TV
                </TabsTrigger>
                <TabsTrigger value="celebrity">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Celebrity
                </TabsTrigger>
                <TabsTrigger value="entertainment">
                  <Film className="h-4 w-4 mr-2" />
                  Entertainment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="awards" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Entertainment Awards</h2>
                </div>
                {awards.map(market => (
                  <SocialMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="reality" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-semibold">Reality Shows</h2>
                </div>
                {realityShows.map(market => (
                  <SocialMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="celebrity" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                  <h2 className="text-xl font-semibold">Celebrity Events & Viral Trends</h2>
                </div>
                {celebrity.map(market => (
                  <SocialMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>

              <TabsContent value="entertainment" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold">Box Office & Music Charts</h2>
                </div>
                {entertainment.map(market => (
                  <SocialMarketCard key={market.id} market={market} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Social;
