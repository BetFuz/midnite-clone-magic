import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { 
  TrendingUp, 
  Flame, 
  Trophy, 
  Vote, 
  DollarSign, 
  Users, 
  Sparkles,
  Gamepad2,
  CircleDot,
  Target,
  Zap,
  BarChart3,
  Ticket,
  Gift,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import FlashOdds from '@/components/FlashOdds';
import LiveMatchCard from '@/components/LiveMatchCard';

const BettingHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');

  const sportsMarkets = [
    { 
      name: 'Football', 
      icon: CircleDot, 
      url: '/sports/football', 
      live: 45, 
      upcoming: 234,
      color: 'text-green-500'
    },
    { 
      name: 'Basketball', 
      icon: CircleDot, 
      url: '/sports/basketball', 
      live: 12, 
      upcoming: 67,
      color: 'text-orange-500'
    },
    { 
      name: 'Tennis', 
      icon: CircleDot, 
      url: '/sports/tennis', 
      live: 28, 
      upcoming: 89,
      color: 'text-yellow-500'
    },
    { 
      name: 'Cricket', 
      icon: CircleDot, 
      url: '/sports/cricket', 
      live: 5, 
      upcoming: 23,
      color: 'text-blue-500'
    },
    { 
      name: 'American Football', 
      icon: CircleDot, 
      url: '/sports/american-football', 
      live: 8, 
      upcoming: 15,
      color: 'text-purple-500'
    },
    { 
      name: 'Ice Hockey', 
      icon: CircleDot, 
      url: '/sports/ice-hockey', 
      live: 6, 
      upcoming: 19,
      color: 'text-cyan-500'
    },
  ];

  const specialMarkets = [
    { 
      name: 'FuzPolitics', 
      icon: Vote, 
      url: '/politics', 
      markets: 28,
      trending: true,
      color: 'text-red-500'
    },
    { 
      name: 'FuzEconomy', 
      icon: DollarSign, 
      url: '/economy', 
      markets: 45,
      color: 'text-emerald-500'
    },
    { 
      name: 'FuzSocial', 
      icon: Users, 
      url: '/social', 
      markets: 67,
      color: 'text-pink-500'
    },
    { 
      name: 'FuzPredict', 
      icon: Sparkles, 
      url: '/predict', 
      markets: 89,
      color: 'text-violet-500'
    },
  ];

  const quickFeatures = [
    { 
      name: 'Flash Odds', 
      icon: Zap, 
      url: '/bet-features', 
      desc: 'Time-limited boosted odds',
      color: 'text-yellow-400'
    },
    { 
      name: 'Bet Builder', 
      icon: Target, 
      url: '/bet-features', 
      desc: 'Create custom bets',
      color: 'text-blue-400'
    },
    { 
      name: 'Live Tracker', 
      icon: BarChart3, 
      url: '/bet-features', 
      desc: 'Track your active bets',
      color: 'text-green-400'
    },
    { 
      name: 'My Tickets', 
      icon: Ticket, 
      url: '/account/bet-tickets', 
      desc: 'View all bet slips',
      color: 'text-purple-400'
    },
  ];

  const liveMatches = [
    {
      id: '1',
      sport: 'Football',
      league: 'Premier League',
      homeTeam: 'Man City',
      awayTeam: 'Arsenal',
      homeScore: 2,
      awayScore: 1,
      time: "67'",
      odds: { home: 1.75, draw: 3.20, away: 4.50 },
    },
    {
      id: '2',
      sport: 'Basketball',
      league: 'NBA',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeScore: 98,
      awayScore: 102,
      time: 'Q4 2:45',
      odds: { home: 2.10, draw: null, away: 1.85 },
    },
    {
      id: '3',
      sport: 'Tennis',
      league: 'ATP Masters',
      homeTeam: 'Djokovic',
      awayTeam: 'Alcaraz',
      homeScore: 1,
      awayScore: 1,
      time: 'Set 3',
      odds: { home: 1.90, draw: null, away: 1.95 },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="p-4 md:p-6 max-w-[1800px] mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Betting Hub</h1>
                <Badge variant="secondary" className="ml-2">
                  <Flame className="h-3 w-3 mr-1" />
                  234 Live
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Your complete trading terminal for all betting markets
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="live">
                  <Flame className="h-4 w-4 mr-2" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="sports">
                  <Trophy className="h-4 w-4 mr-2" />
                  Sports
                </TabsTrigger>
                <TabsTrigger value="specials">
                  <Crown className="h-4 w-4 mr-2" />
                  Specials
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Zap className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="casino">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Casino
                </TabsTrigger>
                <TabsTrigger value="promos">
                  <Gift className="h-4 w-4 mr-2" />
                  Promos
                </TabsTrigger>
              </TabsList>

              {/* LIVE TAB */}
              <TabsContent value="live" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-500" />
                      Live Matches
                    </h2>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-3 pr-4">
                        {liveMatches.map(match => (
                          <LiveMatchCard 
                            key={match.id}
                            id={match.id}
                            sport={match.sport}
                            league={match.league}
                            homeTeam={match.homeTeam}
                            awayTeam={match.awayTeam}
                            homeScore={match.homeScore}
                            awayScore={match.awayScore}
                            minute={match.time}
                            homeOdds={match.odds.home}
                            drawOdds={match.odds.draw}
                            awayOdds={match.odds.away}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Flash Odds
                    </h2>
                    <FlashOdds />
                  </div>
                </div>
              </TabsContent>

              {/* SPORTS TAB */}
              <TabsContent value="sports" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sportsMarkets.map(sport => (
                    <Card 
                      key={sport.name}
                      className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => navigate(sport.url)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <sport.icon className={`h-8 w-8 ${sport.color}`} />
                        {sport.live > 0 && (
                          <Badge variant="destructive" className="animate-pulse">
                            <Flame className="h-3 w-3 mr-1" />
                            {sport.live} Live
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {sport.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{sport.live} live</span>
                        <span>•</span>
                        <span>{sport.upcoming} upcoming</span>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">More Sports</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {['Rugby', 'Volleyball', 'Baseball', 'Table Tennis', 'Handball', 'Darts', 'Snooker', 'Badminton', 'Golf', 'Futsal', 'Cycling', 'Motor Sports'].map(sport => (
                      <Button
                        key={sport}
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/sports/${sport.toLowerCase().replace(' ', '-')}`)}
                      >
                        {sport}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* SPECIALS TAB */}
              <TabsContent value="specials" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {specialMarkets.map(market => (
                    <Card 
                      key={market.name}
                      className="p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                      onClick={() => navigate(market.url)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <market.icon className={`h-10 w-10 ${market.color}`} />
                        <div className="flex gap-2">
                          {market.trending && (
                            <Badge variant="secondary">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {market.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {market.markets} active markets
                  </p>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Explore Markets
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

              {/* FEATURES TAB */}
              <TabsContent value="features" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {quickFeatures.map(feature => (
                    <Card 
                      key={feature.name}
                      className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => navigate(feature.url)}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.desc}
                      </p>
                    </Card>
                  ))}
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">All Advanced Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      'Bet Builder',
                      'Player Markets',
                      'Odds Tracker',
                      'Bet Alerts',
                      'Match Intelligence',
                      'Cash Out',
                      'Acca Insurance',
                      'Multi-Bet Bonus',
                      'Live Streaming',
                      'Statistics',
                      'Form Guide',
                      'Head to Head'
                    ].map(feature => (
                      <Button
                        key={feature}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/bet-features')}
                      >
                        {feature}
                      </Button>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* CASINO TAB */}
              <TabsContent value="casino" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate('/casino/slots')}
                  >
                    <Gamepad2 className="h-8 w-8 text-purple-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Slots</h3>
                    <p className="text-sm text-muted-foreground">500+ games</p>
                  </Card>

                  <Card 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate('/live-casino')}
                  >
                    <Target className="h-8 w-8 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Live Casino</h3>
                    <p className="text-sm text-muted-foreground">Real dealers</p>
                  </Card>

                  <Card 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate('/virtuals')}
                  >
                    <Sparkles className="h-8 w-8 text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Virtuals</h3>
                    <p className="text-sm text-muted-foreground">24/7 action</p>
                  </Card>
                </div>
              </TabsContent>

              {/* PROMOS TAB */}
              <TabsContent value="promos" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                    onClick={() => navigate('/promotions/welcome')}
                  >
                    <Gift className="h-8 w-8 text-yellow-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Welcome Bonus</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      100% up to ₦50,000 on your first deposit
                    </p>
                    <Button className="w-full">Claim Now</Button>
                  </Card>

                  <Card 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-500/10 to-emerald-500/10"
                    onClick={() => navigate('/promotions/acca-boost')}
                  >
                    <Trophy className="h-8 w-8 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Acca Boost</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Up to 50% bonus on accumulators
                    </p>
                    <Button className="w-full">Learn More</Button>
                  </Card>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/promotions')}
                >
                  View All Promotions
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BettingHub;
