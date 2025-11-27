import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBurstGames } from '@/hooks/useBurstGames';
import { Zap, Rocket, DollarSign, Flame } from 'lucide-react';

export const BurstGameInterface = () => {
  const {
    games,
    balance,
    activeGame,
    setActiveGame,
    stake,
    setStake,
    gameState,
    cashedOut,
    winAmount,
    result,
    selectGame,
    playGame,
    cashOut
  } = useBurstGames();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse-glow">
          💥 Burst Games
        </h1>
        <p className="text-muted-foreground">Lightning-fast 30-second wins!</p>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Balance: ₦{balance.toLocaleString()}
        </Badge>
      </div>

      {/* Game Selection */}
      {!activeGame && (
        <div className="grid md:grid-cols-4 gap-4">
          {games.map((game) => (
            <Card 
              key={game.id} 
              className="hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => selectGame(game)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-4xl">{game.icon}</span>
                  <span className="text-lg">{game.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Min Stake</p>
                    <p className="font-bold">₦{game.minStake}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Win</p>
                    <p className="font-bold text-primary">₦{game.maxWin.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-bold">{game.duration}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RTP</p>
                    <p className="font-bold text-green-500">{game.rtp}%</p>
                  </div>
                </div>
                <Button className="w-full">Play Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Game */}
      {activeGame && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <span className="text-8xl">{activeGame.icon}</span>
                  <h2 className="text-3xl font-bold mt-4">{activeGame.name}</h2>
                </div>

                {!gameState && !result && (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <label className="text-sm text-muted-foreground">Stake Amount</label>
                      <Input 
                        type="number" 
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value))}
                        min={activeGame.minStake}
                        className="text-center text-2xl font-bold h-16"
                      />
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full h-16 text-xl"
                      onClick={playGame}
                    >
                      <Zap className="h-6 w-6 mr-2" />
                      Play ₦{stake.toLocaleString()}
                    </Button>
                  </div>
                )}

                {gameState && gameState.isRunning && !cashedOut && (
                  <div className="space-y-4">
                    <div className="text-8xl font-bold text-primary animate-scale-in">
                      {gameState.multiplier.toFixed(2)}x
                    </div>
                    <div className="text-2xl text-muted-foreground">
                      Potential Win: ₦{(stake * gameState.multiplier).toLocaleString()}
                    </div>
                    <Button
                      size="lg"
                      className="w-full h-16 text-xl"
                      onClick={cashOut}
                      disabled={gameState.crashed}
                    >
                      💰 Cash Out
                    </Button>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className={`text-6xl font-bold ${result.won ? 'text-green-500' : 'text-red-500'}`}>
                      {result.won ? '🎉 WIN!' : '💥 BURST!'}
                    </div>
                    {result.won && (
                      <div className="text-4xl font-bold text-primary">
                        ₦{result.amount.toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-4 justify-center">
                      <Button onClick={playGame} size="lg">
                        Play Again
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setActiveGame(null)}>
                        Choose Game
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm">RTP</p>
                <p className="text-2xl font-bold text-green-500">{activeGame.rtp}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Max Win</p>
                <p className="text-2xl font-bold text-primary">₦{activeGame.maxWin.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Duration</p>
                <p className="text-2xl font-bold">{activeGame.duration}s</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Min Stake</p>
                <p className="text-2xl font-bold">₦{activeGame.minStake}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
