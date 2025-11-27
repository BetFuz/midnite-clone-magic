import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type Card = {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numericValue: number;
};

type GameState = 'betting' | 'playing' | 'dealer-turn' | 'finished';

interface DealerPersonality {
  name: string;
  greeting: string;
  style: string;
  catchphrase: string;
}

export const useBlackjack = (initialBalance: number = 10000) => {
  const [balance, setBalance] = useState(initialBalance);
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [result, setResult] = useState<string>('');
  const [dealerPersonality, setDealerPersonality] = useState<DealerPersonality | null>(null);
  const [strategyAdvice, setStrategyAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const createDeck = useCallback((): Card[] => {
    const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: Card[] = [];

    for (let i = 0; i < 6; i++) { // 6 decks
      suits.forEach(suit => {
        values.forEach(value => {
          let numericValue = parseInt(value);
          if (value === 'A') numericValue = 11;
          else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
          
          newDeck.push({ suit, value, numericValue });
        });
      });
    }

    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    return newDeck;
  }, []);

  const calculateHandValue = useCallback((hand: Card[]): number => {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
      if (card.value === 'A') {
        aces += 1;
        value += 11;
      } else {
        value += card.numericValue;
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }

    return value;
  }, []);

  const generateDealerPersonality = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-blackjack', {
        body: { action: 'generate_personality' }
      });

      if (error) throw error;
      setDealerPersonality(data.personality);
      toast({
        title: data.personality.name,
        description: data.personality.greeting,
      });
    } catch (error) {
      console.error('Error generating dealer personality:', error);
    }
  }, []);

  const getStrategyAdvice = useCallback(async () => {
    if (gameState !== 'playing' || playerHand.length === 0) return;

    setIsLoadingAdvice(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-blackjack', {
        body: {
          action: 'strategy_advice',
          playerHand: playerHand.map(c => `${c.value}${c.suit}`),
          dealerUpcard: dealerHand[0] ? `${dealerHand[0].value}${dealerHand[0].suit}` : '',
          playerTotal: calculateHandValue(playerHand)
        }
      });

      if (error) throw error;
      setStrategyAdvice(data.advice);
      toast({
        title: "AI Strategy Advisor",
        description: data.advice,
      });
    } catch (error) {
      console.error('Error getting strategy advice:', error);
      toast({
        title: "Strategy Unavailable",
        description: "Could not get AI advice at this time",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  }, [gameState, playerHand, dealerHand, calculateHandValue]);

  const placeBet = useCallback((amount: number) => {
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this bet",
        variant: "destructive"
      });
      return;
    }

    setBet(amount);
    setBalance(prev => prev - amount);
    
    const newDeck = createDeck();
    setDeck(newDeck);

    const newPlayerHand = [newDeck[0], newDeck[2]];
    const newDealerHand = [newDeck[1], newDeck[3]];
    
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(newDeck.slice(4));
    setGameState('playing');
    setResult('');
    setStrategyAdvice('');

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue === 21) {
      setResult('Blackjack! You win!');
      setBalance(prev => prev + amount * 2.5);
      setGameState('finished');
    }
  }, [balance, createDeck, calculateHandValue]);

  const hit = useCallback(() => {
    if (gameState !== 'playing') return;

    const newCard = deck[0];
    const newPlayerHand = [...playerHand, newCard];
    setPlayerHand(newPlayerHand);
    setDeck(deck.slice(1));

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue > 21) {
      setResult('Bust! Dealer wins');
      setGameState('finished');
    } else if (playerValue === 21) {
      dealerPlay(newPlayerHand);
    }
  }, [gameState, deck, playerHand, calculateHandValue]);

  const stand = useCallback(() => {
    if (gameState !== 'playing') return;
    dealerPlay(playerHand);
  }, [gameState, playerHand]);

  const dealerPlay = useCallback((finalPlayerHand: Card[]) => {
    setGameState('dealer-turn');
    
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    const playerValue = calculateHandValue(finalPlayerHand);
    
    setTimeout(() => {
      while (calculateHandValue(currentDealerHand) < 17) {
        currentDealerHand.push(currentDeck[0]);
        currentDeck = currentDeck.slice(1);
        setDealerHand([...currentDealerHand]);
      }

      const dealerValue = calculateHandValue(currentDealerHand);
      
      let resultMessage = '';
      let winAmount = 0;

      if (dealerValue > 21) {
        resultMessage = 'Dealer busts! You win!';
        winAmount = bet * 2;
      } else if (dealerValue > playerValue) {
        resultMessage = 'Dealer wins';
        winAmount = 0;
      } else if (playerValue > dealerValue) {
        resultMessage = 'You win!';
        winAmount = bet * 2;
      } else {
        resultMessage = 'Push - tie game';
        winAmount = bet;
      }

      setResult(resultMessage);
      setBalance(prev => prev + winAmount);
      setGameState('finished');
      setDeck(currentDeck);

      if (dealerPersonality && winAmount > 0) {
        toast({
          title: dealerPersonality.name,
          description: dealerPersonality.catchphrase,
        });
      }
    }, 1500);
  }, [dealerHand, deck, bet, calculateHandValue, dealerPersonality]);

  const doubleDown = useCallback(() => {
    if (gameState !== 'playing' || playerHand.length !== 2) return;
    if (bet > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Cannot double down with insufficient funds",
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev - bet);
    setBet(prev => prev * 2);

    const newCard = deck[0];
    const newPlayerHand = [...playerHand, newCard];
    setPlayerHand(newPlayerHand);
    setDeck(deck.slice(1));

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue > 21) {
      setResult('Bust! Dealer wins');
      setGameState('finished');
    } else {
      dealerPlay(newPlayerHand);
    }
  }, [gameState, playerHand, bet, balance, deck, calculateHandValue, dealerPlay]);

  const newGame = useCallback(() => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setBet(0);
    setResult('');
    setStrategyAdvice('');
  }, []);

  useEffect(() => {
    generateDealerPersonality();
  }, [generateDealerPersonality]);

  return {
    balance,
    bet,
    playerHand,
    dealerHand,
    gameState,
    result,
    dealerPersonality,
    strategyAdvice,
    isLoadingAdvice,
    placeBet,
    hit,
    stand,
    doubleDown,
    newGame,
    calculateHandValue,
    getStrategyAdvice
  };
};
