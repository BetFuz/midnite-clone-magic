import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRockPaperScissors } from '@/hooks/useRockPaperScissors';
import { Hand, FileText, Brain, TrendingUp, History } from 'lucide-react';

const moves = [
  { value: 'rock', emoji: '✊', label: 'Rock' },
  { value: 'paper', emoji: '✋', label: 'Paper' },
  { value: 'scissors', emoji: '✌️', label: 'Scissors' }
] as const;

export const RockPaperScissorsGame = () => {
  const {
    balance,
    stake,
    setStake,
    rounds,
    currentRound,
    isPlaying,
    aiProfile,
    aiThinking,
    isLoadingAI,
    playRound,
    resetGame,
    generateAIProfile,
    getStats
  } = useRockPaperScissors();

  useEffect(() => {
    generateAIProfile();
  }, []);

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-scale-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            AI Rock Paper Scissors
          </h1>
          <p className="text-muted-foreground">Beat the AI's pattern recognition!</p>
        </div>

        {/* Balance & Stake */}
        <Card className="bg-card/50 backdrop-blur hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-3xl font-bold text-primary">₦{balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Stake per Round</p>
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant={stake === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStake(amount)}
                      disabled={isPlaying}
                    >
                      ₦{amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="md:col-span-2 space-y-4">
            {/* AI Profile */}
            {aiProfile && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/50 animate-scale-in hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Opponent: {aiProfile.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Style:</span>
                    <Badge variant="secondary">{aiProfile.style}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{aiProfile.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Win Rate:</span>
                    <Badge variant="outline">{(aiProfile.winRate * 100).toFixed(0)}%</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Area */}
            <Card>
              <CardContent className="p-8">
                {currentRound ? (
                  <div className="space-y-6">
                    {/* Result Display */}
                    <div className="grid grid-cols-3 gap-4 items-center animate-scale-in">
                      <div className="text-center space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">You</p>
                        <div className="text-8xl animate-bounce-in">{moves.find(m => m.value === currentRound.playerMove)?.emoji}</div>
                        <p className="font-bold">{currentRound.playerMove.toUpperCase()}</p>
                      </div>

                      <div className="text-center space-y-2">
                        <div className={`text-4xl font-bold animate-pulse drop-shadow-lg ${
                          currentRound.result === 'win' ? 'text-green-500' :
                          currentRound.result === 'lose' ? 'text-red-500' :
                          'text-yellow-500'
                        }`}>
                          {currentRound.result === 'win' ? 'YOU WIN! 🎉' :
                           currentRound.result === 'lose' ? 'AI WINS' :
                           'TIE! 🤝'}
                        </div>
                        {currentRound.winnings > 0 && (
                          <Badge variant="outline" className="text-lg animate-bounce shadow-lg shadow-green-500/50">
                            +₦{currentRound.winnings.toLocaleString()}
                          </Badge>
                        )}
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">AI</p>
                        <div className="text-8xl animate-bounce-in" style={{ animationDelay: '0.2s' }}>{moves.find(m => m.value === currentRound.aiMove)?.emoji}</div>
                        <p className="font-bold">{currentRound.aiMove.toUpperCase()}</p>
                      </div>
                    </div>

                    {/* AI Thinking */}
                    {aiThinking && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <p className="text-sm italic">{aiThinking}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button className="w-full" size="lg" onClick={resetGame}>
                      Play Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <Hand className="h-16 w-16 mx-auto text-primary" />
                      <h3 className="text-2xl font-bold">Choose Your Move</h3>
                      <p className="text-muted-foreground">Stake: ₦{stake.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {moves.map((move, idx) => (
                        <Button
                          key={move.value}
                          variant="outline"
                          className="h-32 flex-col gap-2 hover:scale-110 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 animate-scale-in"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                          onClick={() => playRound(move.value)}
                          disabled={isPlaying || isLoadingAI}
                        >
                          <span className="text-6xl">{move.emoji}</span>
                          <span className="font-bold">{move.label}</span>
                        </Button>
                      ))}
                    </div>

                    {isPlaying && (
                      <div className="text-center text-sm text-muted-foreground animate-pulse">
                        AI is analyzing your patterns...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Wins</p>
                    <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Losses</p>
                    <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ties</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.ties}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-bold">{stats.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Games</p>
                    <p className="text-xl font-bold">{stats.totalGames}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className={`text-xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₦{stats.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Round History */}
            {rounds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Rounds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rounds.slice(0, 10).map((round, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg flex items-center justify-between ${
                          round.result === 'win' ? 'bg-green-500/20' :
                          round.result === 'lose' ? 'bg-red-500/20' :
                          'bg-yellow-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{moves.find(m => m.value === round.playerMove)?.emoji}</span>
                          <span className="text-xs">vs</span>
                          <span>{moves.find(m => m.value === round.aiMove)?.emoji}</span>
                        </div>
                        <Badge
                          variant={round.result === 'win' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {round.result === 'win' ? '+' : round.result === 'lose' ? '-' : ''}
                          ₦{round.result === 'tie' ? 0 : round.stake}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Rules */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>🪨 Rock beats Scissors</p>
                <p>📄 Paper beats Rock</p>
                <p>✂️ Scissors beats Paper</p>
                <p className="text-primary font-semibold pt-2">
                  💡 The AI learns from your patterns - can you outsmart it?
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
