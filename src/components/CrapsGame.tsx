import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCraps } from '@/hooks/useCraps';
import { Dices, TrendingUp, Volume2, History } from 'lucide-react';

export const CrapsGame = () => {
  const {
    balance,
    phase,
    point,
    currentBets,
    diceResult,
    isRolling,
    rollHistory,
    stickmanCall,
    isLoadingAI,
    betPayouts,
    placeBet,
    clearBets,
    rollDice,
    getTotalBetAmount
  } = useCraps();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !diceResult) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 300;

    // Draw table background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e7e34');
    gradient.addColorStop(1, '#155d27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dice
    const drawDie = (x: number, y: number, value: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Die shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-45, -45, 90, 90);

      // Die body
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.fillRect(-40, -40, 80, 80);
      ctx.strokeRect(-40, -40, 80, 80);

      // Draw pips
      ctx.fillStyle = '#000';
      const pipSize = 8;

      const pipPositions: Record<number, [number, number][]> = {
        1: [[0, 0]],
        2: [[-15, -15], [15, 15]],
        3: [[-15, -15], [0, 0], [15, 15]],
        4: [[-15, -15], [15, -15], [-15, 15], [15, 15]],
        5: [[-15, -15], [15, -15], [0, 0], [-15, 15], [15, 15]],
        6: [[-15, -15], [15, -15], [-15, 0], [15, 0], [-15, 15], [15, 15]]
      };

      pipPositions[value]?.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, pipSize, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.restore();
    };

    // Animate dice
    const die1X = canvas.width * 0.35;
    const die1Y = canvas.height * 0.5;
    const die2X = canvas.width * 0.65;
    const die2Y = canvas.height * 0.5;

    drawDie(die1X, die1Y, diceResult.die1, Math.random() * Math.PI);
    drawDie(die2X, die2Y, diceResult.die2, Math.random() * Math.PI);

    // Draw total
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Total: ${diceResult.total}`, canvas.width / 2, 40);

  }, [diceResult]);

  const betOptions: Array<{ type: 'pass' | 'dont-pass' | 'field' | 'any-craps' | 'seven' | 'eleven', label: string }> = [
    { type: 'pass', label: 'Pass Line' },
    { type: 'dont-pass', label: "Don't Pass" },
    { type: 'field', label: 'Field' },
    { type: 'any-craps', label: 'Any Craps' },
    { type: 'seven', label: 'Seven' },
    { type: 'eleven', label: 'Eleven' }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-scale-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">
            AI Craps
          </h1>
          <p className="text-muted-foreground">Roll the dice and test your luck!</p>
        </div>

        {/* Balance & Game State */}
        <Card className="bg-card/50 backdrop-blur hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-primary">₦{balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phase</p>
                <Badge variant={phase === 'come-out' ? 'default' : 'secondary'} className="text-lg">
                  {phase === 'come-out' ? 'Come Out Roll' : `Point: ${point}`}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-2xl font-bold">₦{getTotalBetAmount().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Craps Table */}
          <div className="md:col-span-2 space-y-4">
            {/* Dice Canvas */}
            <Card>
              <CardContent className="p-0">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              </CardContent>
            </Card>

            {/* Stickman Call */}
            {stickmanCall && (
              <Card className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500 animate-bounce-in shadow-2xl shadow-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-6 w-6 text-amber-500 animate-pulse" />
                    <p className="text-lg font-bold drop-shadow-lg">{stickmanCall}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Betting Options */}
            <Card>
              <CardHeader>
                <CardTitle>Place Your Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {betOptions.map(({ type, label }) => (
                    <div key={type} className="space-y-2">
                      <div className="text-sm font-semibold text-center">
                        {label}
                        <Badge variant="outline" className="ml-2">
                          {betPayouts[type]}:1
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {[100, 500, 1000].map(amount => (
                          <Button
                            key={amount}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => placeBet(type, amount)}
                            disabled={isRolling}
                          >
                            ₦{amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={rollDice}
                disabled={isRolling || currentBets.length === 0}
              >
                <Dices className="h-5 w-5 mr-2" />
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={clearBets}
                disabled={isRolling || currentBets.length === 0}
              >
                Clear Bets
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Bets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Active Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentBets.length > 0 ? (
                  <div className="space-y-2">
                    {currentBets.map((bet, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm font-semibold">{bet.type.toUpperCase()}</span>
                        <Badge>₦{bet.amount.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active bets</p>
                )}
              </CardContent>
            </Card>

            {/* Roll History */}
            {rollHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Rolls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {rollHistory.slice(0, 10).map((roll, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {roll.die1} + {roll.die2}
                        </span>
                        <Badge variant="secondary">{roll.total}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Rules */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Quick Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p><strong>Come Out Roll:</strong> 7 or 11 wins Pass, 2/3/12 wins Don't Pass</p>
                <p><strong>Point Phase:</strong> Roll the point to win Pass, 7 loses</p>
                <p><strong>Field:</strong> Wins on 2, 3, 4, 9, 10, 11, 12</p>
                <p><strong>Any Craps:</strong> Wins on 2, 3, or 12</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
