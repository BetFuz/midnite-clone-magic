import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, TrendingUp, History } from 'lucide-react';
import { useKeno } from '@/hooks/useKeno';

export const KenoGame = () => {
  const {
    selectedNumbers,
    drawnNumbers,
    stake,
    setStake,
    balance,
    isDrawing,
    matchCount,
    winAmount,
    aiPattern,
    quickPick,
    isLoadingAI,
    drawHistory,
    toggleNumber,
    generateQuickPick,
    getAIQuickPick,
    getAIPattern,
    draw,
    reset,
    payoutTable
  } = useKeno();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Keno
          </h1>
          <p className="text-muted-foreground">Pick 1-10 numbers and match the draw</p>
        </div>

        {/* Balance & Stake */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-primary">₦{balance.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Stake</p>
                  <div className="flex gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant={stake === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStake(amount)}
                        disabled={isDrawing}
                      >
                        ₦{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Game Board */}
          <div className="md:col-span-2 space-y-4">
            {/* Number Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Numbers ({selectedNumbers.length}/10)</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateQuickPick(10)}
                      disabled={isDrawing}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Quick Pick
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getAIQuickPick}
                      disabled={isDrawing || isLoadingAI}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Pick
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedNumbers.includes(num);
                    const isDrawn = drawnNumbers.includes(num);
                    const isMatch = isSelected && isDrawn;

                    return (
                      <button
                        key={num}
                        onClick={() => toggleNumber(num)}
                        disabled={isDrawing}
                        className={`
                          aspect-square rounded-lg font-semibold text-sm transition-all
                          ${isMatch ? 'bg-green-500 text-white scale-110 shadow-lg' :
                            isDrawn ? 'bg-blue-500 text-white' :
                            isSelected ? 'bg-primary text-primary-foreground' :
                            'bg-muted hover:bg-muted/80'}
                          disabled:opacity-50
                        `}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Draw Controls */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={draw}
                disabled={isDrawing || selectedNumbers.length === 0}
              >
                {isDrawing ? 'Drawing...' : 'Draw Numbers'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={reset}
                disabled={isDrawing}
              >
                Reset
              </Button>
            </div>

            {/* Results */}
            {drawnNumbers.length === 20 && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold mb-2">
                    {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
                  </p>
                  {winAmount > 0 && (
                    <p className="text-3xl font-bold text-green-500">
                      Won ₦{winAmount.toLocaleString()}!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={getAIPattern}
                  disabled={isLoadingAI || drawHistory.length < 5}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Patterns
                </Button>

                {quickPick && (
                  <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-primary">AI Strategy</p>
                    <p className="text-sm text-muted-foreground">{quickPick.strategy}</p>
                  </div>
                )}

                {aiPattern && (
                  <div className="p-4 bg-accent/5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-accent">Pattern Detected</p>
                      <Badge>{Math.round(aiPattern.confidence * 100)}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{aiPattern.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {aiPattern.numbers.map(num => (
                        <Badge key={num} variant="outline">{num}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payout Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payout Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {selectedNumbers.length > 0 && payoutTable[selectedNumbers.length] && (
                    <>
                      <p className="text-xs text-muted-foreground mb-2">
                        For {selectedNumbers.length} picks:
                      </p>
                      {Object.entries(payoutTable[selectedNumbers.length]).map(([matches, payout]) => (
                        <div key={matches} className="flex justify-between">
                          <span>{matches} matches</span>
                          <span className="font-semibold">{payout}x</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {drawHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Draws
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {drawHistory.slice(0, 5).map((draw, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex flex-wrap gap-1">
                          {draw.slice(0, 10).map(num => (
                            <Badge key={num} variant="secondary" className="text-xs">
                              {num}
                            </Badge>
                          ))}
                          {draw.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{draw.length - 10}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
