import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ScratchCardProps {
  symbols: string[];
  prize: number;
  isRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
  color: string;
}

export const ScratchCard = ({
  symbols,
  prize,
  isRevealed,
  onReveal,
  onReset,
  color
}: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isScratching, setIsScratching] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Draw scratch-off layer
    if (!isRevealed) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#94a3b8');
      gradient.addColorStop(1, '#64748b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add texture pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 100; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 20,
          Math.random() * 20
        );
      }

      // Add "Scratch Here" text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isRevealed]);

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale coordinates
    x = (x / rect.width) * canvas.width;
    y = (y / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    // Auto-reveal if 60% scratched
    if (percentage > 60 && !isRevealed) {
      onReveal();
    }
  };

  return (
    <div className="relative animate-fade-in">
      {/* Prize Grid Background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-8 h-full">
          {symbols.map((symbol, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-center text-6xl bg-gradient-to-br ${color} rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300 animate-scale-in`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">{symbol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scratch Layer */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair rounded-lg"
          onMouseDown={() => setIsScratching(true)}
          onMouseUp={() => setIsScratching(false)}
          onMouseMove={(e) => isScratching && scratch(e)}
          onMouseLeave={() => setIsScratching(false)}
          onTouchStart={() => setIsScratching(true)}
          onTouchEnd={() => setIsScratching(false)}
          onTouchMove={(e) => isScratching && scratch(e)}
        />
      )}

      {/* Card Frame */}
      <div className="relative w-full h-[400px] rounded-lg border-4 border-border shadow-2xl" />

      {/* Progress */}
      {!isRevealed && scratchPercentage > 0 && (
        <div className="absolute top-4 left-4 right-4">
          <Badge variant="secondary" className="w-full justify-center">
            {Math.round(scratchPercentage)}% Revealed
          </Badge>
        </div>
      )}

      {/* Result */}
      {isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center animate-bounce-in">
          <Card className="bg-background/95 backdrop-blur m-8 shadow-2xl border-2 border-primary/50">
            <CardContent className="p-6 text-center space-y-4">
              {prize > 0 ? (
                <>
                  <div className="text-6xl animate-bounce">🎉</div>
                  <h3 className="text-2xl font-bold text-green-500 drop-shadow-lg">Winner!</h3>
                  <p className="text-4xl font-bold text-primary animate-pulse drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]">
                    ₦{prize.toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl animate-scale-in">😔</div>
                  <h3 className="text-2xl font-bold text-muted-foreground">No Prize</h3>
                  <p className="text-sm text-muted-foreground">Better luck next time!</p>
                </>
              )}
              <Button onClick={onReset} className="w-full hover:scale-105 transition-transform">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Another Card
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Reveal */}
      {!isRevealed && scratchPercentage > 20 && (
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={onReveal}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Quick Reveal
          </Button>
        </div>
      )}
    </div>
  );
};
