import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card as UICard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBaccarat, Card, BetType } from '@/hooks/useBaccarat';
import { Sparkles, TrendingUp, Crown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const BaccaratGame = () => {
  const {
    balance,
    currentBet,
    playerCards,
    bankerCards,
    playerScore,
    bankerScore,
    isDealing,
    roundHistory,
    culturalTheme,
    trendAnalysis,
    isLoadingAI,
    placeBet,
    deal,
    clearTable,
    setCulturalTheme,
    getTrendAnalysis,
    getCulturalInsight,
  } = useBaccarat();

  const [betAmount, setBetAmount] = useState(1000);

  const themes = [
    { id: 'dragon', name: 'Dragon', icon: Flame, color: 'from-red-500 to-orange-500' },
    { id: 'phoenix', name: 'Phoenix', icon: Crown, color: 'from-purple-500 to-pink-500' },
    { id: 'tiger', name: 'Tiger', icon: Sparkles, color: 'from-yellow-500 to-orange-600' },
  ];

  const renderCard = (card: Card) => {
    const suitColor = card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-foreground';
    const rankDisplay = card.rank === 1 ? 'A' : card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank;

    return (
      <div className="w-16 h-24 rounded-lg border-2 bg-card border-border shadow-lg flex flex-col items-center justify-center text-lg font-bold animate-scale-in">
        <span className={suitColor}>{rankDisplay}</span>
        <span className={cn("text-2xl", suitColor)}>{card.suit}</span>
      </div>
    );
  };

  const currentTheme = themes.find(t => t.id === culturalTheme) || themes[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <UICard className={cn("p-6 bg-gradient-to-br hover:shadow-2xl transition-all duration-500", currentTheme.color, "text-white")}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <currentTheme.icon className="h-6 w-6" />
              {currentTheme.name} Baccarat
            </h3>
            <p className="text-sm opacity-90">Traditional Asian Gaming Experience</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Balance</p>
            <p className="text-3xl font-bold">₦{balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="flex gap-2 mb-6">
          {themes.map(theme => (
            <Button
              key={theme.id}
              variant={culturalTheme === theme.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCulturalTheme(theme.id)}
              className="gap-1"
            >
              <theme.icon className="h-4 w-4" />
              {theme.name}
            </Button>
          ))}
        </div>
      </UICard>

      <UICard className="p-6 bg-gradient-to-br from-background to-accent/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500">
        {/* Playing Area */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Player Side */}
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-lg px-4 py-1">PLAYER</Badge>
            <div className="flex justify-center gap-2 min-h-[100px] items-center">
              {playerCards.length === 0 ? (
                <p className="text-muted-foreground text-sm">Waiting...</p>
              ) : (
                playerCards.map((card, idx) => (
                  <div key={idx} className="animate-scale-in hover:scale-110 hover:-translate-y-2 transition-all duration-200" style={{ animationDelay: `${idx * 0.1}s` }}>
                    {renderCard(card)}
                  </div>
                ))
              )}
            </div>
            {playerCards.length > 0 && (
              <div className="text-4xl font-bold text-primary">{playerScore}</div>
            )}
          </div>

          {/* Banker Side */}
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-lg px-4 py-1">BANKER</Badge>
            <div className="flex justify-center gap-2 min-h-[100px] items-center">
              {bankerCards.length === 0 ? (
                <p className="text-muted-foreground text-sm">Waiting...</p>
              ) : (
                bankerCards.map((card, idx) => (
                  <div key={idx} className="animate-scale-in hover:scale-110 hover:-translate-y-2 transition-all duration-200" style={{ animationDelay: `${idx * 0.1}s` }}>
                    {renderCard(card)}
                  </div>
                ))
              )}
            </div>
            {bankerCards.length > 0 && (
              <div className="text-4xl font-bold text-primary">{bankerScore}</div>
            )}
          </div>
        </div>

        {/* Betting Area */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {[500, 1000, 5000, 10000].map(amount => (
              <Button
                key={amount}
                variant={betAmount === amount ? "default" : "outline"}
                size="sm"
                onClick={() => setBetAmount(amount)}
              >
                ₦{amount}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => placeBet('player', betAmount)}
              disabled={isDealing || !!currentBet}
              variant="outline"
              className="h-20 text-lg font-bold bg-blue-500/20 hover:bg-blue-500/30"
            >
              PLAYER
              <br />
              <span className="text-sm">(1:1)</span>
            </Button>
            <Button
              onClick={() => placeBet('tie', betAmount)}
              disabled={isDealing || !!currentBet}
              variant="outline"
              className="h-20 text-lg font-bold bg-green-500/20 hover:bg-green-500/30"
            >
              TIE
              <br />
              <span className="text-sm">(8:1)</span>
            </Button>
            <Button
              onClick={() => placeBet('banker', betAmount)}
              disabled={isDealing || !!currentBet}
              variant="outline"
              className="h-20 text-lg font-bold bg-red-500/20 hover:bg-red-500/30"
            >
              BANKER
              <br />
              <span className="text-sm">(0.95:1)</span>
            </Button>
          </div>

          {currentBet && (
            <div className="text-center p-3 bg-primary/20 rounded">
              <p className="font-semibold">
                Current Bet: ₦{currentBet.amount.toLocaleString()} on {currentBet.type.toUpperCase()}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={deal} disabled={isDealing || !currentBet} className="flex-1" size="lg">
              {isDealing ? 'Dealing...' : 'Deal Cards'}
            </Button>
            <Button onClick={clearTable} variant="outline" disabled={isDealing}>
              Clear
            </Button>
          </div>
        </div>
      </UICard>

      {/* History and Analysis */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Round History</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-2">
          <UICard className="p-4">
            <h4 className="font-semibold mb-3">Recent Rounds</h4>
            <div className="flex flex-wrap gap-2">
              {roundHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rounds yet</p>
              ) : (
                roundHistory.map((round, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={cn(
                      "px-3 py-1",
                      round.result === 'player' && "bg-blue-500/20",
                      round.result === 'banker' && "bg-red-500/20",
                      round.result === 'tie' && "bg-green-500/20"
                    )}
                  >
                    {round.result === 'player' ? 'P' : round.result === 'banker' ? 'B' : 'T'}
                  </Badge>
                ))
              )}
            </div>
          </UICard>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-2">
          <UICard className="p-4">
            <Button onClick={getTrendAnalysis} disabled={isLoadingAI || roundHistory.length < 6} className="w-full mb-3">
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate Trend Analysis
            </Button>
            {trendAnalysis && (
              <div className="text-sm bg-muted/30 p-3 rounded">
                {trendAnalysis}
              </div>
            )}
          </UICard>

          <UICard className="p-4">
            <Button onClick={getCulturalInsight} disabled={isLoadingAI} variant="outline" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Cultural Insight
            </Button>
          </UICard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BaccaratGame;
