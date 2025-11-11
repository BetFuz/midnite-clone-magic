import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { toast } from 'sonner';

interface PlayerMarket {
  playerId: string;
  playerName: string;
  team: string;
  markets: {
    toScore: number;
    toScoreFirst: number;
    toScoreLast: number;
    toAssist: number;
    shotsOnTarget: { over: number; odds: number };
  };
}

const PlayerMarkets = () => {
  const { addSelection } = useBetSlip();

  const match = {
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
  };

  const players: PlayerMarket[] = [
    {
      playerId: 'p1',
      playerName: 'Erling Haaland',
      team: 'Man City',
      markets: {
        toScore: 1.65,
        toScoreFirst: 4.50,
        toScoreLast: 5.20,
        toAssist: 2.80,
        shotsOnTarget: { over: 2.5, odds: 1.90 },
      },
    },
    {
      playerId: 'p2',
      playerName: 'Kevin De Bruyne',
      team: 'Man City',
      markets: {
        toScore: 3.20,
        toScoreFirst: 8.50,
        toScoreLast: 9.00,
        toAssist: 2.10,
        shotsOnTarget: { over: 1.5, odds: 1.75 },
      },
    },
    {
      playerId: 'p3',
      playerName: 'Bukayo Saka',
      team: 'Arsenal',
      markets: {
        toScore: 3.00,
        toScoreFirst: 7.50,
        toScoreLast: 8.00,
        toAssist: 2.50,
        shotsOnTarget: { over: 2.5, odds: 2.20 },
      },
    },
    {
      playerId: 'p4',
      playerName: 'Gabriel Jesus',
      team: 'Arsenal',
      markets: {
        toScore: 2.80,
        toScoreFirst: 7.00,
        toScoreLast: 7.50,
        toAssist: 2.90,
        shotsOnTarget: { over: 2.5, odds: 2.10 },
      },
    },
  ];

  const handleAddPlayerMarket = (player: PlayerMarket, marketType: string, odds: number, label: string) => {
    addSelection({
      id: `${Date.now()}-${Math.random()}`,
      matchId: 'player-market-1',
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      sport: 'Football',
      league: match.league,
      selectionType: 'home',
      selectionValue: `${player.playerName} - ${label}`,
      odds: odds,
      matchTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    });

    toast.success('Player Market Added!', {
      description: `${player.playerName} - ${label}`,
    });
  };

  const homePlayers = players.filter(p => p.team === match.homeTeam);
  const awayPlayers = players.filter(p => p.team === match.awayTeam);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Player Markets</h2>
        <Badge variant="secondary" className="ml-auto">Props</Badge>
      </div>

      <Card className="p-4 bg-primary/5">
        <h3 className="font-semibold mb-1">
          {match.homeTeam} vs {match.awayTeam}
        </h3>
        <p className="text-sm text-muted-foreground">{match.league}</p>
      </Card>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="home">{match.homeTeam}</TabsTrigger>
          <TabsTrigger value="away">{match.awayTeam}</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-3 mt-4">
          {homePlayers.map(player => (
            <Card key={player.playerId} className="p-4">
              <h3 className="font-semibold mb-3">{player.playerName}</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'score', player.markets.toScore, 'To Score')}
                >
                  <span className="text-xs text-muted-foreground">To Score</span>
                  <span className="text-lg font-bold text-primary">{player.markets.toScore}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'first', player.markets.toScoreFirst, 'First Goal')}
                >
                  <span className="text-xs text-muted-foreground">First Goal</span>
                  <span className="text-lg font-bold text-primary">{player.markets.toScoreFirst}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'assist', player.markets.toAssist, 'To Assist')}
                >
                  <span className="text-xs text-muted-foreground">To Assist</span>
                  <span className="text-lg font-bold text-primary">{player.markets.toAssist}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'shots', player.markets.shotsOnTarget.odds, `Over ${player.markets.shotsOnTarget.over} Shots`)}
                >
                  <span className="text-xs text-muted-foreground">O{player.markets.shotsOnTarget.over} Shots</span>
                  <span className="text-lg font-bold text-primary">{player.markets.shotsOnTarget.odds}</span>
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="away" className="space-y-3 mt-4">
          {awayPlayers.map(player => (
            <Card key={player.playerId} className="p-4">
              <h3 className="font-semibold mb-3">{player.playerName}</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'score', player.markets.toScore, 'To Score')}
                >
                  <span className="text-xs text-muted-foreground">To Score</span>
                  <span className="text-lg font-bold text-primary">{player.markets.toScore}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'first', player.markets.toScoreFirst, 'First Goal')}
                >
                  <span className="text-xs text-muted-foreground">First Goal</span>
                  <span className="text-lg font-bold text-primary">{player.markets.toScoreFirst}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'assist', player.markets.toAssist, 'To Assist')}
                >
                  <span className="text-xs text-muted-foreground">To Assist</span>
                  <span className="text-lg font-bold text-primary">{player.markets.toAssist}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col py-3"
                  onClick={() => handleAddPlayerMarket(player, 'shots', player.markets.shotsOnTarget.odds, `Over ${player.markets.shotsOnTarget.over} Shots`)}
                >
                  <span className="text-xs text-muted-foreground">O{player.markets.shotsOnTarget.over} Shots</span>
                  <span className="text-lg font-bold text-primary">{player.markets.shotsOnTarget.odds}</span>
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center">
        Individual player performance markets • Updated live
      </p>
    </div>
  );
};

export default PlayerMarkets;
