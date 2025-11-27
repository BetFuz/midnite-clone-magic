import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScratchCardTheme {
  id: string;
  name: string;
  description: string;
  price: number;
  prizes: { amount: number; probability: number }[];
  color: string;
  icon: string;
}

interface RevealedCard {
  theme: ScratchCardTheme;
  prize: number;
  symbols: string[];
}

export const useScratchCard = () => {
  const [balance, setBalance] = useState(50000);
  const [availableCards, setAvailableCards] = useState<ScratchCardTheme[]>([]);
  const [activeCard, setActiveCard] = useState<RevealedCard | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const { toast } = useToast();

  const defaultThemes: ScratchCardTheme[] = [
    {
      id: 'lucky-7',
      name: 'Lucky 7s',
      description: 'Match three 7s to win big!',
      price: 100,
      prizes: [
        { amount: 0, probability: 0.70 },
        { amount: 50, probability: 0.15 },
        { amount: 100, probability: 0.08 },
        { amount: 500, probability: 0.05 },
        { amount: 5000, probability: 0.02 }
      ],
      color: 'from-yellow-500 to-orange-500',
      icon: '7️⃣'
    },
    {
      id: 'diamond-riches',
      name: 'Diamond Riches',
      description: 'Find three diamonds for instant wealth!',
      price: 500,
      prizes: [
        { amount: 0, probability: 0.65 },
        { amount: 250, probability: 0.18 },
        { amount: 1000, probability: 0.10 },
        { amount: 5000, probability: 0.05 },
        { amount: 50000, probability: 0.02 }
      ],
      color: 'from-blue-500 to-purple-500',
      icon: '💎'
    },
    {
      id: 'gold-rush',
      name: 'Gold Rush',
      description: 'Strike gold with three matches!',
      price: 200,
      prizes: [
        { amount: 0, probability: 0.68 },
        { amount: 100, probability: 0.16 },
        { amount: 400, probability: 0.10 },
        { amount: 2000, probability: 0.04 },
        { amount: 10000, probability: 0.02 }
      ],
      color: 'from-amber-500 to-yellow-600',
      icon: '🏅'
    },
    {
      id: 'naija-vibes',
      name: 'Naija Vibes',
      description: 'Nigerian themed scratch card!',
      price: 150,
      prizes: [
        { amount: 0, probability: 0.67 },
        { amount: 75, probability: 0.18 },
        { amount: 300, probability: 0.09 },
        { amount: 1500, probability: 0.04 },
        { amount: 15000, probability: 0.02 }
      ],
      color: 'from-green-600 to-emerald-500',
      icon: '🇳🇬'
    }
  ];

  const generateAIThemes = useCallback(async () => {
    setIsLoadingThemes(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-scratch-card', {
        body: { action: 'generateThemes', count: 2 }
      });

      if (error) throw error;

      if (data?.themes) {
        setAvailableCards([...defaultThemes, ...data.themes]);
      } else {
        setAvailableCards(defaultThemes);
      }

      toast({
        title: "Cards Loaded",
        description: "AI-powered themes ready to play!"
      });
    } catch (error) {
      console.error('AI Themes error:', error);
      setAvailableCards(defaultThemes);
    } finally {
      setIsLoadingThemes(false);
    }
  }, [toast]);

  const calculatePrize = useCallback((theme: ScratchCardTheme): number => {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of theme.prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize.amount;
      }
    }

    return 0;
  }, []);

  const generateSymbols = useCallback((theme: ScratchCardTheme, prize: number): string[] => {
    const symbols = [theme.icon, '⭐', '🎰', '🍀', '💰', '🎁', '🔥', '⚡'];
    const grid: string[] = [];

    if (prize > 0) {
      // Winning card - place three matching symbols
      grid.push(theme.icon, theme.icon, theme.icon);
      
      // Fill remaining with random symbols
      for (let i = 3; i < 9; i++) {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        grid.push(randomSymbol);
      }
    } else {
      // Losing card - ensure no three matches
      const availableSymbols = symbols.filter(s => s !== theme.icon);
      for (let i = 0; i < 9; i++) {
        const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
        grid.push(randomSymbol);
      }
    }

    // Shuffle the grid
    return grid.sort(() => Math.random() - 0.5);
  }, []);

  const purchaseCard = useCallback((theme: ScratchCardTheme) => {
    if (balance < theme.price) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance to buy this card",
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev - theme.price);
    const prize = calculatePrize(theme);
    const symbols = generateSymbols(theme, prize);

    setActiveCard({ theme, prize, symbols });
    setIsScratching(false);
    setIsRevealed(false);

    toast({
      title: "Card Purchased!",
      description: `Scratch to reveal your prize`
    });
  }, [balance, calculatePrize, generateSymbols, toast]);

  const revealCard = useCallback(() => {
    if (!activeCard) return;

    setIsRevealed(true);

    if (activeCard.prize > 0) {
      setBalance(prev => prev + activeCard.prize);
      
      toast({
        title: "🎉 Winner!",
        description: `You won ₦${activeCard.prize.toLocaleString()}!`
      });
    } else {
      toast({
        title: "Better Luck Next Time",
        description: "No prize this time, try again!"
      });
    }
  }, [activeCard, toast]);

  const resetCard = useCallback(() => {
    setActiveCard(null);
    setIsScratching(false);
    setIsRevealed(false);
  }, []);

  return {
    balance,
    availableCards: availableCards.length > 0 ? availableCards : defaultThemes,
    activeCard,
    isScratching,
    setIsScratching,
    isRevealed,
    isLoadingThemes,
    generateAIThemes,
    purchaseCard,
    revealCard,
    resetCard
  };
};
