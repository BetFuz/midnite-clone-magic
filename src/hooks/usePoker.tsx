import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  folded: boolean;
  isAI: boolean;
  aiPersonality?: string;
}

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type HandRank = 'High Card' | 'Pair' | 'Two Pair' | 'Three of a Kind' | 'Straight' | 'Flush' | 'Full House' | 'Four of a Kind' | 'Straight Flush' | 'Royal Flush';

export function usePoker() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [minBet, setMinBet] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [handAnalysis, setHandAnalysis] = useState<string>('');

  const createDeck = useCallback((): Card[] => {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck: Card[] = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push({ suit, rank });
      }
    }
    
    return newDeck.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Starting poker game, creating AI opponents...');
      
      // Create AI opponents with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
      );
      
      const invokePromise = supabase.functions.invoke('ai-poker', {
        body: { action: 'create_opponents', count: 3 },
      });
      
      const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;
      
      console.log('AI opponents response:', { data, error });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      const newDeck = createDeck();
      const humanPlayer: Player = {
        id: 'human',
        name: 'You',
        chips: 10000,
        holeCards: [newDeck.pop()!, newDeck.pop()!],
        currentBet: 0,
        folded: false,
        isAI: false,
      };

      const aiPlayers: Player[] = data.opponents.map((opp: any, idx: number) => ({
        id: `ai-${idx}`,
        name: opp.name,
        chips: 10000,
        holeCards: [newDeck.pop()!, newDeck.pop()!],
        currentBet: 0,
        folded: false,
        isAI: true,
        aiPersonality: opp.personality,
      }));

      setPlayers([humanPlayer, ...aiPlayers]);
      setDeck(newDeck);
      setCommunityCards([]);
      setPot(0);
      setCurrentPlayerIndex(0);
      setPhase('preflop');
      toast({ title: 'Game Started', description: 'Good luck at the table!' });
    } catch (error) {
      console.error('Error starting game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
      toast({ 
        title: 'Error Starting Game', 
        description: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      console.log('Game setup completed, isLoading set to false');
      setIsLoading(false);
    }
  }, [createDeck]);

  const getRankValue = (rank: Rank): number => {
    const values: Record<Rank, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank];
  };

  const evaluateHand = useCallback((holeCards: Card[], community: Card[]): { rank: HandRank; value: number } => {
    const allCards = [...holeCards, ...community];
    const rankCounts = new Map<Rank, number>();
    const suitCounts = new Map<Suit, number>();
    
    allCards.forEach(card => {
      rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
      suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
    });

    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
    const isFlush = Array.from(suitCounts.values()).some(count => count >= 5);
    
    const sortedRanks = Array.from(rankCounts.keys()).sort((a, b) => getRankValue(b) - getRankValue(a));
    const isStraight = sortedRanks.length >= 5 && 
      sortedRanks.slice(0, 5).every((rank, i, arr) => 
        i === 0 || getRankValue(arr[i - 1]) - getRankValue(rank) === 1
      );

    if (isFlush && isStraight && sortedRanks[0] === 'A') return { rank: 'Royal Flush', value: 10 };
    if (isFlush && isStraight) return { rank: 'Straight Flush', value: 9 };
    if (counts[0] === 4) return { rank: 'Four of a Kind', value: 8 };
    if (counts[0] === 3 && counts[1] === 2) return { rank: 'Full House', value: 7 };
    if (isFlush) return { rank: 'Flush', value: 6 };
    if (isStraight) return { rank: 'Straight', value: 5 };
    if (counts[0] === 3) return { rank: 'Three of a Kind', value: 4 };
    if (counts[0] === 2 && counts[1] === 2) return { rank: 'Two Pair', value: 3 };
    if (counts[0] === 2) return { rank: 'Pair', value: 2 };
    return { rank: 'High Card', value: 1 };
  }, []);

  const nextPlayer = useCallback(() => {
    setCurrentPlayerIndex(prev => {
      const nextIdx = (prev + 1) % players.length;
      // Find next active player
      let idx = nextIdx;
      let attempts = 0;
      while (players[idx]?.folded && attempts < players.length) {
        idx = (idx + 1) % players.length;
        attempts++;
      }
      return idx;
    });
  }, [players]);

  const bet = useCallback((amount: number) => {
    setPlayers(prev => {
      const updated = [...prev];
      const player = updated[currentPlayerIndex];
      player.chips -= amount;
      player.currentBet += amount;
      setPot(p => p + amount);
      return updated;
    });
    setTimeout(() => nextPlayer(), 100);
  }, [currentPlayerIndex, nextPlayer]);

  const call = useCallback(() => {
    const maxBet = Math.max(...players.map(p => p.currentBet));
    const callAmount = maxBet - players[currentPlayerIndex].currentBet;
    bet(callAmount);
  }, [players, currentPlayerIndex, bet]);

  const raise = useCallback((raiseAmount: number) => {
    const maxBet = Math.max(...players.map(p => p.currentBet));
    const totalAmount = maxBet - players[currentPlayerIndex].currentBet + raiseAmount;
    bet(totalAmount);
  }, [players, currentPlayerIndex, bet]);

  const fold = useCallback(() => {
    setPlayers(prev => {
      const updated = [...prev];
      updated[currentPlayerIndex].folded = true;
      return updated;
    });
    setTimeout(() => nextPlayer(), 100);
  }, [currentPlayerIndex, nextPlayer]);

  const nextPhase = useCallback(() => {
    const newDeck = [...deck];
    
    switch (phase) {
      case 'preflop':
        setCommunityCards([newDeck.pop()!, newDeck.pop()!, newDeck.pop()!]);
        setPhase('flop');
        break;
      case 'flop':
        setCommunityCards(prev => [...prev, newDeck.pop()!]);
        setPhase('turn');
        break;
      case 'turn':
        setCommunityCards(prev => [...prev, newDeck.pop()!]);
        setPhase('river');
        break;
      case 'river':
        setPhase('showdown');
        determineWinner();
        break;
    }
    
    setDeck(newDeck);
    setCurrentPlayerIndex(0);
  }, [phase, deck]);

  const determineWinner = useCallback(() => {
    const activePlayers = players.filter(p => !p.folded);
    const evaluations = activePlayers.map(player => ({
      player,
      hand: evaluateHand(player.holeCards, communityCards),
    }));

    evaluations.sort((a, b) => b.hand.value - a.hand.value);
    const winner = evaluations[0].player;
    
    setPlayers(prev => {
      const updated = [...prev];
      const winnerIdx = updated.findIndex(p => p.id === winner.id);
      updated[winnerIdx].chips += pot;
      return updated;
    });

    toast({
      title: `${winner.name} Wins!`,
      description: `${evaluations[0].hand.rank} - ₦${pot.toLocaleString()}`,
    });
  }, [players, communityCards, pot, evaluateHand]);

  const getAIAdvice = useCallback(async () => {
    const humanPlayer = players.find(p => p.id === 'human');
    if (!humanPlayer) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-poker', {
        body: {
          action: 'advice',
          holeCards: humanPlayer.holeCards,
          communityCards,
          pot,
          phase,
          yourChips: humanPlayer.chips,
        },
      });

      if (error) throw error;
      setHandAnalysis(data.advice);
      toast({ title: 'AI Advisor', description: 'Strategy suggestion ready' });
    } catch (error) {
      console.error('AI advice error:', error);
      toast({ title: 'Error', description: 'Failed to get AI advice', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [players, communityCards, pot, phase]);

  useEffect(() => {
    if (phase !== 'waiting' && players[currentPlayerIndex]?.isAI && !players[currentPlayerIndex]?.folded) {
      const timer = setTimeout(() => {
        // Simple AI decision logic
        const random = Math.random();
        if (random < 0.3) fold();
        else if (random < 0.7) call();
        else raise(minBet);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, players, phase]);

  return {
    players,
    communityCards,
    pot,
    currentPlayerIndex,
    phase,
    minBet,
    isLoading,
    handAnalysis,
    startGame,
    bet,
    call,
    raise,
    fold,
    nextPhase,
    getAIAdvice,
    evaluateHand,
  };
}
