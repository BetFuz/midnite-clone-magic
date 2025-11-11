import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SocialMarketCard from '@/components/social/SocialMarketCard';
import { Users, Trophy, Star, TrendingUp, Music, Film } from 'lucide-react';

const Social = () => {
  const awards = [
    {
      id: '1',
      title: 'AMVCA 2024 Best Actor',
      category: 'African Awards',
      deadline: '2024-05-20T00:00:00',
      markets: [
        { outcome: 'Kunle Remi', odds: 2.50 },
        { outcome: 'Stan Nze', odds: 3.00 },
        { outcome: 'Timini Egbuson', odds: 3.80 },
        { outcome: 'Ibrahim Suleiman', odds: 4.20 },
      ],
    },
    {
      id: '2',
      title: 'AMVCA 2024 Best Actress',
      category: 'African Awards',
      deadline: '2024-05-20T00:00:00',
      markets: [
        { outcome: 'Funke Akindele', odds: 2.20 },
        { outcome: 'Nancy Isime', odds: 2.80 },
        { outcome: 'Ini Dima-Okojie', odds: 3.50 },
        { outcome: 'Bimbo Ademoye', odds: 3.80 },
      ],
    },
    {
      id: '3',
      title: 'Headies 2024 Next Rated Artist',
      category: 'African Awards',
      deadline: '2024-09-15T00:00:00',
      markets: [
        { outcome: 'Seyi Vibez', odds: 2.30 },
        { outcome: 'Ruger', odds: 2.70 },
        { outcome: 'Bloody Civilian', odds: 3.20 },
        { outcome: 'Bnxn (Buju)', odds: 3.80 },
        { outcome: 'Other Artist', odds: 5.00 },
      ],
    },
    {
      id: '4',
      title: 'South African Music Awards - Artist of the Year',
      category: 'African Awards',
      deadline: '2024-11-30T00:00:00',
      markets: [
        { outcome: 'Tyla', odds: 2.00 },
        { outcome: 'Makhadzi', odds: 3.00 },
        { outcome: 'Kabza De Small', odds: 3.50 },
        { outcome: 'Uncle Waffles', odds: 4.20 },
      ],
    },
    {
      id: '5',
      title: 'Kenya Film Festival Best Film',
      category: 'African Awards',
      deadline: '2024-10-30T00:00:00',
      markets: [
        { outcome: 'Malooned', odds: 2.80 },
        { outcome: 'Disconnect', odds: 3.20 },
        { outcome: 'Sincerely Daisy', odds: 3.80 },
        { outcome: 'Other Film', odds: 4.50 },
      ],
    },
    {
      id: '6',
      title: 'Grammy 2025 Best African Music Performance',
      category: 'Global Awards',
      deadline: '2025-02-04T00:00:00',
      markets: [
        { outcome: 'Burna Boy', odds: 2.10 },
        { outcome: 'Tyla', odds: 2.50 },
        { outcome: 'Asake', odds: 3.20 },
        { outcome: 'Davido', odds: 3.80 },
        { outcome: 'Wizkid', odds: 4.00 },
      ],
    },
  ];

  const realityShows = [
    {
      id: '7',
      title: 'BBNaija 2024 Winner',
      category: 'Nigerian Reality TV',
      deadline: '2024-10-01T00:00:00',
      markets: [
        { outcome: 'Ilebaye', odds: 2.80 },
        { outcome: 'Mercy Eke', odds: 3.20 },
        { outcome: 'Ceec', odds: 3.50 },
        { outcome: 'Venita', odds: 4.00 },
        { outcome: 'Other Housemate', odds: 4.50 },
      ],
    },
    {
      id: '8',
      title: 'BBNaija 2024 - First Eviction',
      category: 'Nigerian Reality TV',
      deadline: '2024-08-15T00:00:00',
      markets: [
        { outcome: 'Male Housemate', odds: 1.80 },
        { outcome: 'Female Housemate', odds: 2.10 },
      ],
    },
    {
      id: '9',
      title: 'The Real Housewives of Lagos Season 2',
      category: 'Nigerian Reality TV',
      deadline: '2024-12-31T00:00:00',
      markets: [
        { outcome: 'Most Dramatic Episode Count', odds: 2.50 },
        { outcome: 'New Cast Member Added', odds: 1.90 },
        { outcome: 'Cast Member Exits', odds: 2.80 },
      ],
    },
    {
      id: '10',
      title: 'Nigerian Idol 2024 Winner',
      category: 'Nigerian Reality TV',
      deadline: '2024-11-30T00:00:00',
      markets: [
        { outcome: 'Male Contestant', odds: 2.00 },
        { outcome: 'Female Contestant', odds: 2.20 },
      ],
    },
    {
      id: '11',
      title: 'Big Brother Mzansi 2024 Winner',
      category: 'South African Reality TV',
      deadline: '2024-12-20T00:00:00',
      markets: [
        { outcome: 'Male Contestant', odds: 2.10 },
        { outcome: 'Female Contestant', odds: 2.00 },
      ],
    },
    {
      id: '12',
      title: 'Date My Family SA - Most Couples Still Together',
      category: 'South African Reality TV',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: '0-2 Couples', odds: 2.20 },
        { outcome: '3-5 Couples', odds: 2.80 },
        { outcome: '6+ Couples', odds: 4.50 },
      ],
    },
  ];

  const celebrity = [
    {
      id: '13',
      title: 'Next Nigerian Celebrity Wedding 2024',
      category: 'Nigerian Celebrity',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Music Artist', odds: 2.50 },
        { outcome: 'Nollywood Actor/Actress', odds: 2.80 },
        { outcome: 'Influencer/Content Creator', odds: 3.20 },
        { outcome: 'Sports Star', odds: 4.50 },
      ],
    },
    {
      id: '14',
      title: 'Davido Next Collaboration',
      category: 'Nigerian Celebrity',
      deadline: '2024-09-30T23:59:00',
      markets: [
        { outcome: 'US Artist', odds: 2.20 },
        { outcome: 'UK Artist', odds: 2.80 },
        { outcome: 'African Artist', odds: 2.50 },
        { outcome: 'Asian Artist', odds: 5.00 },
      ],
    },
    {
      id: '15',
      title: 'Burna Boy Grammy Nominations 2025',
      category: 'Nigerian Celebrity',
      deadline: '2024-11-15T00:00:00',
      markets: [
        { outcome: '3+ Nominations', odds: 2.00 },
        { outcome: '1-2 Nominations', odds: 1.80 },
        { outcome: 'No Nominations', odds: 6.00 },
      ],
    },
    {
      id: '16',
      title: 'Tyla Next Major Achievement',
      category: 'South African Celebrity',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Grammy Win', odds: 2.50 },
        { outcome: 'Billboard #1', odds: 3.00 },
        { outcome: 'Major Brand Deal', odds: 2.80 },
        { outcome: 'World Tour Announcement', odds: 3.50 },
      ],
    },
    {
      id: '17',
      title: 'Most Viral Nigerian Skit Maker 2024',
      category: 'Nigerian Viral Trends',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Broda Shaggi', odds: 3.20 },
        { outcome: 'Mr Macaroni', odds: 2.80 },
        { outcome: 'Sabinus', odds: 2.50 },
        { outcome: 'Taaooma', odds: 3.50 },
        { outcome: 'Other Creator', odds: 4.00 },
      ],
    },
    {
      id: '18',
      title: 'South African TikTok Challenge Goes Global',
      category: 'African Viral Trends',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Amapiano Dance', odds: 2.20 },
        { outcome: 'Comedy Format', odds: 2.80 },
        { outcome: 'Fashion Trend', odds: 3.50 },
        { outcome: 'Other Challenge', odds: 4.00 },
      ],
    },
    {
      id: '19',
      title: 'Kenyan Influencer to Hit 5M Followers First',
      category: 'Kenyan Celebrity',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Fashion Influencer', odds: 2.50 },
        { outcome: 'Comedy Creator', odds: 2.80 },
        { outcome: 'Lifestyle Blogger', odds: 3.20 },
        { outcome: 'Music Artist', odds: 3.80 },
      ],
    },
  ];

  const entertainment = [
    {
      id: '20',
      title: 'Highest Grossing Nollywood Film 2024',
      category: 'Nigerian Box Office',
      deadline: '2025-01-15T00:00:00',
      markets: [
        { outcome: 'A Tribe Called Judah', odds: 2.20 },
        { outcome: 'Malaika', odds: 2.80 },
        { outcome: 'Gangs of Lagos 2', odds: 3.50 },
        { outcome: 'New Release', odds: 3.00 },
      ],
    },
    {
      id: '21',
      title: 'Nigerian Movie to Get Oscar Nomination',
      category: 'Nigerian Box Office',
      deadline: '2025-01-31T00:00:00',
      markets: [
        { outcome: 'Yes', odds: 4.50 },
        { outcome: 'No', odds: 1.25 },
      ],
    },
    {
      id: '22',
      title: 'Highest Streaming Nigerian Song Dec 2024',
      category: 'Nigerian Music',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Asake Song', odds: 2.50 },
        { outcome: 'Rema Song', odds: 2.80 },
        { outcome: 'Burna Boy Song', odds: 3.00 },
        { outcome: 'Ayra Starr Song', odds: 3.50 },
        { outcome: 'New Artist', odds: 4.00 },
      ],
    },
    {
      id: '23',
      title: 'South African Amapiano Artist to Chart Billboard',
      category: 'South African Music',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Kabza De Small', odds: 2.80 },
        { outcome: 'Uncle Waffles', odds: 3.20 },
        { outcome: 'DJ Maphorisa', odds: 3.50 },
        { outcome: 'Other Artist', odds: 3.00 },
      ],
    },
    {
      id: '24',
      title: 'Kenyan Film Festival - Best Director',
      category: 'Kenyan Cinema',
      deadline: '2024-10-30T00:00:00',
      markets: [
        { outcome: 'Wanuri Kahiu', odds: 2.50 },
        { outcome: 'Jim Chuchu', odds: 3.00 },
        { outcome: 'Judy Kibinge', odds: 3.50 },
        { outcome: 'Other Director', odds: 4.00 },
      ],
    },
    {
      id: '25',
      title: 'Ghana Music Awards - Artist of the Year',
      category: 'Ghanaian Music',
      deadline: '2024-06-30T00:00:00',
      markets: [
        { outcome: 'Stonebwoy', odds: 2.20 },
        { outcome: 'Sarkodie', odds: 2.80 },
        { outcome: 'Black Sherif', odds: 3.20 },
        { outcome: 'King Promise', odds: 3.80 },
      ],
    },
    {
      id: '26',
      title: 'African Artist to Feature on US Billboard Top 10',
      category: 'African Music Global',
      deadline: '2024-12-31T23:59:00',
      markets: [
        { outcome: 'Nigerian Artist', odds: 1.90 },
        { outcome: 'South African Artist', odds: 2.50 },
        { outcome: 'Ghanaian Artist', odds: 3.80 },
        { outcome: 'Kenyan Artist', odds: 4.50 },
        { outcome: 'Other African Artist', odds: 5.00 },
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
