import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useCasinoBalance } from './useCasinoBalance';

export type Card = {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numericValue: number;
};

type GameState = 'betting' | 'playing' | 'dealer-turn' | 'finished';

export const useBlackjack = () => {
  const { balance, setBalance, playRound } = useCasinoBalance();
  const [bet, setBet] = useState(0);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [result, setResult] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // Track total stake including doubleDown without stale closure issues
  const totalStakeRef = useRef(0);

  const createDeck = useCallback((): Card[] => {
    const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: Card[] = [];

    for (let i = 0; i < 6; i++) {
      suits.forEach(suit => {
        values.forEach(value => {
          let numericValue = parseInt(value);
          if (value === 'A') numericValue = 11;
          else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
          newDeck.push({ suit, value, numericValue });
        });
      });
    }

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
      if (card.value === 'A') { aces++; value += 11; }
      else value += card.numericValue;
    });
    while (value > 21 && aces > 0) { value -= 10; aces--; }
    return value;
  }, []);

  const getStrategyAdvice = useCallback(async () => {
    if (gameState !== 'playing' || playerHand.length === 0) return;
    setIsLoadingAdvice(true);
    // Basic strategy hint based on player total vs dealer upcard
    setTimeout(() => {
      const playerTotal = calculateHandValue(playerHand);
      const dealerUp = dealerHand[0] ? calculateHandValue([dealerHand[0]]) : 10;
      let advice = '';
      if (playerTotal >= 17) advice = 'Stand — strong hand';
      else if (playerTotal >= 13 && dealerUp <= 6) advice = 'Stand — dealer likely to bust';
      else if (playerTotal === 11) advice = 'Double down if possible';
      else if (playerTotal <= 11) advice = 'Hit — low risk of busting';
      else advice = 'Hit — needs improvement';
      toast({ title: '♠ Strategy Hint', description: advice });
      setIsLoadingAdvice(false);
    }, 600);
  }, [gameState, playerHand, dealerHand, calculateHandValue]);

  const finishRound = useCallback((stake: number, payout: number, message: string) => {
    setResult(message);
    setGameState('finished');
    playRound('blackjack', stake, payout).catch(() => {
      setBalance(prev => prev + stake);
    });
    if (payout > stake) {
      toast({ title: '🃏 You Win!', description: `₦${payout.toLocaleString()} payout` });
    }
  }, [playRound, setBalance]);

  const placeBet = useCallback((amount: number) => {
    if (amount > balance) {
      toast({ title: 'Insufficient Balance', description: 'Not enough funds', variant: 'destructive' });
      return;
    }

    const newDeck = createDeck();
    const newPlayerHand = [newDeck[0], newDeck[2]];
    const newDealerHand = [newDeck[1], newDeck[3]];

    setBet(amount);
    totalStakeRef.current = amount;
    setBalance(prev => prev - amount);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDeck(newDeck.slice(4));
    setGameState('playing');
    setResult('');

    if (calculateHandValue(newPlayerHand) === 21) {
      const payout = Math.floor(amount * 2.5);
      finishRound(amount, payout, `🃏 Blackjack! ₦${payout.toLocaleString()} won!`);
    }
  }, [balance, createDeck, calculateHandValue, finishRound, setBalance]);

  const dealerPlay = useCallback((finalPlayerHand: Card[], currentDealerHand: Card[], currentDeck: Card[], stake: number) => {
    setGameState('dealer-turn');
    let dHand = [...currentDealerHand];
    let dDeck = [...currentDeck];

    setTimeout(() => {
      while (calculateHandValue(dHand) < 17) {
        dHand.push(dDeck.shift()!);
      }
      setDealerHand([...dHand]);
      setDeck(dDeck);

      const playerValue = calculateHandValue(finalPlayerHand);
      const dealerValue = calculateHandValue(dHand);

      if (dealerValue > 21) {
        finishRound(stake, stake * 2, `💥 Dealer busts! You win ₦${(stake * 2).toLocaleString()}!`);
      } else if (playerValue > dealerValue) {
        finishRound(stake, stake * 2, `✅ You win ₦${(stake * 2).toLocaleString()}!`);
      } else if (dealerValue > playerValue) {
        finishRound(stake, 0, '❌ Dealer wins');
      } else {
        finishRound(stake, stake, '🤝 Push — bet returned');
      }
    }, 1200);
  }, [calculateHandValue, finishRound]);

  const hit = useCallback(() => {
    if (gameState !== 'playing') return;
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    const newDeck = deck.slice(1);
    setPlayerHand(newHand);
    setDeck(newDeck);

    const val = calculateHandValue(newHand);
    if (val > 21) {
      finishRound(totalStakeRef.current, 0, '💥 Bust! Dealer wins');
    } else if (val === 21) {
      dealerPlay(newHand, dealerHand, newDeck, totalStakeRef.current);
    }
  }, [gameState, deck, playerHand, dealerHand, calculateHandValue, finishRound, dealerPlay]);

  const stand = useCallback(() => {
    if (gameState !== 'playing') return;
    dealerPlay(playerHand, dealerHand, deck, totalStakeRef.current);
  }, [gameState, playerHand, dealerHand, deck, dealerPlay]);

  const doubleDown = useCallback(() => {
    if (gameState !== 'playing' || playerHand.length !== 2) return;
    if (bet > balance) {
      toast({ title: 'Insufficient Balance', description: 'Cannot double down', variant: 'destructive' });
      return;
    }
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    const newDeck = deck.slice(1);
    const totalStake = bet * 2;
    totalStakeRef.current = totalStake;

    setBalance(prev => prev - bet);
    setBet(totalStake);
    setPlayerHand(newHand);
    setDeck(newDeck);

    const val = calculateHandValue(newHand);
    if (val > 21) {
      finishRound(totalStake, 0, '💥 Bust! Dealer wins');
    } else {
      dealerPlay(newHand, dealerHand, newDeck, totalStake);
    }
  }, [gameState, playerHand, dealerHand, bet, balance, deck, calculateHandValue, finishRound, dealerPlay, setBalance]);

  const newGame = useCallback(() => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setBet(0);
    setResult('');
    totalStakeRef.current = 0;
  }, []);

  return {
    balance,
    bet,
    playerHand,
    dealerHand,
    gameState,
    result,
    dealerPersonality: null,
    strategyAdvice: '',
    isLoadingAdvice,
    placeBet,
    hit,
    stand,
    doubleDown,
    newGame,
    calculateHandValue,
    getStrategyAdvice,
  };
};
