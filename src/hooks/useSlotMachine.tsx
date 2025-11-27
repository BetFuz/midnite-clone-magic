import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAIImageGeneration } from './useAIImageGeneration';

export interface SlotSymbol {
  id: string;
  emoji: string;
  name: string;
  multiplier: number;
}

export interface SlotTheme {
  name: string;
  symbols: SlotSymbol[];
  backgroundColor: string;
  accentColor: string;
  bonusFeatures: string[];
}

export interface SpinResult {
  reels: string[][];
  winningLines: number[];
  totalWin: number;
  isJackpot: boolean;
}

const DEFAULT_THEME: SlotTheme = {
  name: "African Treasures",
  symbols: [
    { id: '7', emoji: '7️⃣', name: 'Lucky Seven', multiplier: 100 },
    { id: 'diamond', emoji: '💎', name: 'Diamond', multiplier: 50 },
    { id: 'crown', emoji: '👑', name: 'Crown', multiplier: 30 },
    { id: 'star', emoji: '⭐', name: 'Star', multiplier: 20 },
    { id: 'bell', emoji: '🔔', name: 'Bell', multiplier: 15 },
    { id: 'cherry', emoji: '🍒', name: 'Cherry', multiplier: 10 },
    { id: 'watermelon', emoji: '🍉', name: 'Watermelon', multiplier: 8 },
    { id: 'lemon', emoji: '🍋', name: 'Lemon', multiplier: 5 },
  ],
  backgroundColor: "from-amber-900 to-orange-800",
  accentColor: "text-amber-400",
  bonusFeatures: ["Free Spins", "Multiplier Boost", "Wild Reels"]
};

export const useSlotMachine = () => {
  const [theme, setTheme] = useState<SlotTheme>(DEFAULT_THEME);
  const [reels, setReels] = useState<string[][]>([[], [], []]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [totalWin, setTotalWin] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const initializeReels = useCallback(() => {
    const initialReels = [0, 1, 2].map(() => 
      [0, 1, 2].map(() => theme.symbols[Math.floor(Math.random() * theme.symbols.length)].emoji)
    );
    setReels(initialReels);
  }, [theme]);

  useEffect(() => {
    initializeReels();
  }, [initializeReels]);

  const generateAITheme = useCallback(async (playerPreferences?: string) => {
    setIsLoadingTheme(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-slot-theme', {
        body: { preferences: playerPreferences || 'African cultural themes with vibrant colors' }
      });

      if (error) throw error;

      if (data?.theme) {
        setTheme(data.theme);
        toast({
          title: "🎰 New Theme Generated!",
          description: `Now playing: ${data.theme.name}`,
        });
      }
    } catch (error) {
      console.error('Error generating AI theme:', error);
      toast({
        title: "Using Default Theme",
        description: "AI theme generation unavailable",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTheme(false);
    }
  }, []);

  const checkWinningLines = useCallback((spinReels: string[][]): { lines: number[], win: number } => {
    const lines: number[] = [];
    let totalWinAmount = 0;

    // Check horizontal lines
    for (let row = 0; row < 3; row++) {
      if (spinReels[0][row] === spinReels[1][row] && spinReels[1][row] === spinReels[2][row]) {
        lines.push(row);
        const symbol = theme.symbols.find(s => s.emoji === spinReels[0][row]);
        if (symbol) {
          totalWinAmount += betAmount * symbol.multiplier;
        }
      }
    }

    // Check diagonal lines
    if (spinReels[0][0] === spinReels[1][1] && spinReels[1][1] === spinReels[2][2]) {
      lines.push(3);
      const symbol = theme.symbols.find(s => s.emoji === spinReels[0][0]);
      if (symbol) totalWinAmount += betAmount * symbol.multiplier;
    }

    if (spinReels[0][2] === spinReels[1][1] && spinReels[1][1] === spinReels[2][0]) {
      lines.push(4);
      const symbol = theme.symbols.find(s => s.emoji === spinReels[0][2]);
      if (symbol) totalWinAmount += betAmount * symbol.multiplier;
    }

    return { lines, win: totalWinAmount };
  }, [betAmount, theme.symbols]);

  const spin = useCallback(async () => {
    if (isSpinning || balance < betAmount) {
      toast({
        title: "Cannot Spin",
        description: balance < betAmount ? "Insufficient balance" : "Already spinning",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setWinningLines([]);
    setTotalWin(0);
    setBalance(prev => prev - betAmount);

    // Simulate spinning animation
    const spinDuration = 2000;
    const spinInterval = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      setReels(prev => prev.map(reel => 
        reel.map(() => theme.symbols[Math.floor(Math.random() * theme.symbols.length)].emoji)
      ));
      elapsed += spinInterval;

      if (elapsed >= spinDuration) {
        clearInterval(interval);

        // Final reel positions
        const finalReels = [0, 1, 2].map(() => 
          [0, 1, 2].map(() => theme.symbols[Math.floor(Math.random() * theme.symbols.length)].emoji)
        );
        setReels(finalReels);

        // Check for wins
        const { lines, win } = checkWinningLines(finalReels);
        setWinningLines(lines);
        setTotalWin(win);

        if (win > 0) {
          setBalance(prev => prev + win);
          toast({
            title: win >= betAmount * 50 ? "🎉 JACKPOT! 🎉" : "🎰 Winner!",
            description: `You won ₦${win.toFixed(2)}!`,
          });
        }

        setIsSpinning(false);
      }
    }, spinInterval);
  }, [isSpinning, balance, betAmount, theme.symbols, checkWinningLines]);

  const { generateImage } = useAIImageGeneration();
  const [themeBackground, setThemeBackground] = useState<string | null>(null);

  // Generate AI background when theme changes
  useEffect(() => {
    const generateThemeBackground = async () => {
      if (theme.name !== DEFAULT_THEME.name) {
        const cacheKey = `slot-bg-${theme.name.toLowerCase().replace(/\s/g, '-')}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          setThemeBackground(cached);
        } else {
          const bgUrl = await generateImage({
            prompt: `Slot machine theme background for ${theme.name}, vibrant colors, casino atmosphere, premium graphics, ${theme.name} themed elements`,
            type: 'casino',
            style: 'vibrant'
          });
          if (bgUrl) {
            setThemeBackground(bgUrl);
            localStorage.setItem(cacheKey, bgUrl);
          }
        }
      }
    };
    generateThemeBackground();
  }, [theme.name]);

  return {
    theme,
    reels,
    isSpinning,
    balance,
    betAmount,
    totalWin,
    winningLines,
    isLoadingTheme,
    themeBackground,
    spin,
    setBetAmount,
    generateAITheme,
    initializeReels
  };
};