import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type Card = {
  rank: number; // 1-13 (Ace to King)
  suit: '♠' | '♥' | '♦' | '♣';
};

export type BetType = 'player' | 'banker' | 'tie';
export type GameResult = 'player' | 'banker' | 'tie';

interface RoundHistory {
  result: GameResult;
  playerScore: number;
  bankerScore: number;
}

export function useBaccarat() {
  const [balance, setBalance] = useState(10000);
  const [currentBet, setCurrentBet] = useState<{ type: BetType; amount: number } | null>(null);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [bankerScore, setBankerScore] = useState(0);
  const [isDealing, setIsDealing] = useState(false);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const [culturalTheme, setCulturalTheme] = useState<string>('dragon');
  const [trendAnalysis, setTrendAnalysis] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const getCardValue = (card: Card): number => {
    if (card.rank >= 10) return 0; // 10, J, Q, K = 0
    return card.rank; // Ace = 1, 2-9 = face value
  };

  const calculateScore = (cards: Card[]): number => {
    const total = cards.reduce((sum, card) => sum + getCardValue(card), 0);
    return total % 10; // Only last digit counts
  };

  const createCard = (): Card => {
    const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
    return {
      rank: Math.floor(Math.random() * 13) + 1,
      suit: suits[Math.floor(Math.random() * 4)],
    };
  };

  const placeBet = useCallback((type: BetType, amount: number) => {
    if (amount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Not enough funds to place this bet',
        variant: 'destructive',
      });
      return;
    }

    setCurrentBet({ type, amount });
    setBalance(prev => prev - amount);
    toast({
      title: 'Bet Placed',
      description: `₦${amount.toLocaleString()} on ${type}`,
    });
  }, [balance]);

  const deal = useCallback(async () => {
    if (!currentBet) {
      toast({
        title: 'No Bet Placed',
        description: 'Place a bet before dealing',
        variant: 'destructive',
      });
      return;
    }

    setIsDealing(true);

    // Initial deal: 2 cards each
    const pCards = [createCard(), createCard()];
    const bCards = [createCard(), createCard()];

    setPlayerCards(pCards);
    setBankerCards(bCards);

    let pScore = calculateScore(pCards);
    let bScore = calculateScore(bCards);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Natural 8 or 9 ends the game
    if (pScore >= 8 || bScore >= 8) {
      finishRound(pCards, bCards, pScore, bScore);
      return;
    }

    // Player draws third card if score 0-5
    if (pScore <= 5) {
      const thirdCard = createCard();
      pCards.push(thirdCard);
      pScore = calculateScore(pCards);
      setPlayerCards([...pCards]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Banker draws based on complex rules
    const shouldBankerDraw = () => {
      if (pCards.length === 2) {
        // Player stood, banker draws on 0-5
        return bScore <= 5;
      }
      
      const playerThirdValue = getCardValue(pCards[2]);
      if (bScore <= 2) return true;
      if (bScore === 3 && playerThirdValue !== 8) return true;
      if (bScore === 4 && playerThirdValue >= 2 && playerThirdValue <= 7) return true;
      if (bScore === 5 && playerThirdValue >= 4 && playerThirdValue <= 7) return true;
      if (bScore === 6 && (playerThirdValue === 6 || playerThirdValue === 7)) return true;
      return false;
    };

    if (shouldBankerDraw()) {
      const thirdCard = createCard();
      bCards.push(thirdCard);
      bScore = calculateScore(bCards);
      setBankerCards([...bCards]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    finishRound(pCards, bCards, pScore, bScore);
  }, [currentBet]);

  const finishRound = (pCards: Card[], bCards: Card[], pScore: number, bScore: number) => {
    setPlayerScore(pScore);
    setBankerScore(bScore);

    let result: GameResult;
    if (pScore > bScore) result = 'player';
    else if (bScore > pScore) result = 'banker';
    else result = 'tie';

    setRoundHistory(prev => [{ result, playerScore: pScore, bankerScore: bScore }, ...prev.slice(0, 49)]);

    // Calculate winnings
    let winnings = 0;
    if (currentBet?.type === result) {
      if (result === 'player') winnings = currentBet.amount * 2;
      else if (result === 'banker') winnings = currentBet.amount * 1.95; // 5% commission
      else if (result === 'tie') winnings = currentBet.amount * 9;
    }

    if (winnings > 0) {
      setBalance(prev => prev + winnings);
      toast({
        title: `${result.toUpperCase()} Wins!`,
        description: `You won ₦${winnings.toLocaleString()}!`,
      });
    } else {
      toast({
        title: `${result.toUpperCase()} Wins`,
        description: 'Better luck next time!',
        variant: 'destructive',
      });
    }

    setIsDealing(false);
    setCurrentBet(null);
  };

  const clearTable = useCallback(() => {
    setPlayerCards([]);
    setBankerCards([]);
    setPlayerScore(0);
    setBankerScore(0);
    setCurrentBet(null);
  }, []);

  const getTrendAnalysis = useCallback(async () => {
    if (roundHistory.length < 6) {
      toast({
        title: 'More Rounds Needed',
        description: 'Trend analysis requires at least 6 rounds',
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-baccarat', {
        body: {
          action: 'trend',
          history: roundHistory.slice(0, 20),
        },
      });

      if (error) throw error;
      setTrendAnalysis(data.analysis);
      toast({ title: 'Trend Analysis Ready' });
    } catch (error) {
      console.error('Trend analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not generate trend analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [roundHistory]);

  const getCulturalInsight = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-baccarat', {
        body: {
          action: 'cultural',
          theme: culturalTheme,
        },
      });

      if (error) throw error;
      toast({
        title: 'Cultural Insight',
        description: data.insight,
      });
    } catch (error) {
      console.error('Cultural insight error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  }, [culturalTheme]);

  return {
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
  };
}
