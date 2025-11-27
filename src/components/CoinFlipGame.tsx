import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCoinFlip } from '@/hooks/useCoinFlip';

export const CoinFlipGame = () => {
  const {
    balance,
    stake,
    isFlipping,
    lastResult,
    prediction,
    narrative,
    wins,
    losses,
    totalFlips,
    setStake,
    setPrediction,
    flipCoin,
    reset,
  } = useCoinFlip();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCoin = (rotation: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;

      // Simulate 3D rotation
      const scale = Math.abs(Math.cos(rotation));
      
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Draw coin
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * scale, radius, 0, 0, Math.PI * 2);
      ctx.fillStyle = scale > 0.5 ? '#FFD700' : '#C0C0C0';
      ctx.fill();
      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (isFlipping) {
        ctx.fillText('?', 0, 0);
      } else if (lastResult) {
        const text = lastResult === 'heads' ? 'H' : 'T';
        ctx.fillText(text, 0, 0);
      } else {
        ctx.fillText('₦', 0, 0);
      }

      ctx.restore();
    };

    let animationFrame: number;
    let rotation = 0;

    const animate = () => {
      if (isFlipping) {
        rotation += 0.2;
        drawCoin(rotation);
        animationFrame = requestAnimationFrame(animate);
      } else {
        drawCoin(lastResult === 'heads' ? 0 : Math.PI);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [isFlipping, lastResult]);

  const winRate = totalFlips > 0 ? ((wins / totalFlips) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in">
        <Card className="hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">₦{balance.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">{winRate}%</p>
            <p className="text-sm text-muted-foreground">{wins}W / {losses}L</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm">Total Flips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{totalFlips}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500">
        <CardHeader>
          <CardTitle>Coin Flip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="border-2 border-border rounded-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300"
            />
          </div>

          <div className="p-4 bg-muted rounded-lg animate-fade-in border border-border/50">
            <p className="text-center text-sm italic">{narrative}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stake Amount</label>
              <Input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                min={100}
                step={100}
                disabled={isFlipping}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={prediction === 'heads' ? 'default' : 'outline'}
                onClick={() => setPrediction('heads')}
                disabled={isFlipping}
                className="flex-1 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300"
              >
                🪙 Heads
              </Button>
              <Button
                variant={prediction === 'tails' ? 'default' : 'outline'}
                onClick={() => setPrediction('tails')}
                disabled={isFlipping}
                className="flex-1 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300"
              >
                🪙 Tails
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={flipCoin}
                disabled={isFlipping || !prediction}
                className="flex-1 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
              >
                {isFlipping ? 'Flipping...' : 'Flip Coin'}
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                disabled={isFlipping}
                className="hover:scale-105 transition-transform"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
