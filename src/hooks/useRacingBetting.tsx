import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RaceParticipant {
  id: string;
  name: string;
  odds: number;
  position?: number;
  stats: {
    wins: number;
    races: number;
    winRate: string;
  };
}

export interface RaceBet {
  participantId: string;
  participantName: string;
  betType: 'win' | 'place' | 'show';
  odds: number;
  stake: number;
}

interface UseRacingBettingProps {
  raceType: string;
  raceId: string;
  participants: RaceParticipant[];
}

export const useRacingBetting = ({ raceType, raceId, participants }: UseRacingBettingProps) => {
  const [raceState, setRaceState] = useState<'pre-race' | 'racing' | 'finished'>('pre-race');
  const [currentPositions, setCurrentPositions] = useState<Record<string, number>>({});
  const [winner, setWinner] = useState<string | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [activeBets, setActiveBets] = useState<RaceBet[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
    const channel = supabase
      .channel(`race_${raceId}`)
      .on('broadcast', { event: 'race_update' }, (payload) => {
        setCurrentPositions(payload.payload.positions);
        setRaceState(payload.payload.state);
        if (payload.payload.winner) {
          setWinner(payload.payload.winner);
          settleBets(payload.payload.winner);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raceId]);

  const fetchBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (data) setBalance(data.balance || 0);
  };

  const placeBet = async (bet: RaceBet) => {
    if (raceState !== 'pre-race') {
      toast({
        title: "Race Started",
        description: "Cannot place bets once race has started",
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to place bets",
        variant: "destructive"
      });
      return;
    }

    if (balance < bet.stake) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₦${bet.stake.toLocaleString()} to place this bet`,
        variant: "destructive"
      });
      return;
    }

    setIsPlacingBet(true);

    try {
      // Create game session for this race
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert([{
          game_type: 'racing',
          mode: 'betting',
          player1_id: user.id,
          stake_amount: bet.stake,
          status: 'active',
          game_state: {
            raceType,
            raceId,
            participants: JSON.parse(JSON.stringify(participants)),
            bet: JSON.parse(JSON.stringify(bet))
          } as any
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create bet record
      const { error: betError } = await supabase
        .from('game_bets')
        .insert({
          session_id: session.id,
          user_id: user.id,
          bet_type: bet.betType,
          bet_value: bet.participantId,
          odds: bet.odds,
          stake_amount: bet.stake,
          potential_win: bet.stake * bet.odds,
          status: 'active'
        });

      if (betError) throw betError;

      // Deduct stake from balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - bet.stake })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      setActiveBets([...activeBets, bet]);
      setBalance(balance - bet.stake);

      toast({
        title: "Bet Placed!",
        description: `₦${bet.stake.toLocaleString()} on ${bet.participantName} to ${bet.betType}`,
      });
    } catch (error) {
      console.error('Bet placement error:', error);
      toast({
        title: "Bet Failed",
        description: "Failed to place bet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const startRace = async () => {
    setRaceState('racing');
    
    // Simulate race with AI commentary
    const { data, error } = await supabase.functions.invoke('racing-simulation', {
      body: {
        raceType,
        raceId,
        participants
      }
    });

    if (error) {
      console.error('Race simulation error:', error);
      toast({
        title: "Race Error",
        description: "Failed to start race simulation",
        variant: "destructive"
      });
      return;
    }

    // Race simulation will broadcast updates via realtime
  };

  const settleBets = async (winnerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const bet of activeBets) {
      const won = bet.participantId === winnerId;
      
      if (won) {
        const winnings = bet.stake * bet.odds;
        
        // Update balance
        await supabase
          .from('profiles')
          .update({ balance: balance + winnings })
          .eq('id', user.id);

        toast({
          title: "🎉 You Won!",
          description: `${bet.participantName} won! You earned ₦${winnings.toLocaleString()}`,
        });
      } else {
        toast({
          title: "Better Luck Next Time",
          description: `${bet.participantName} didn't win this race`,
          variant: "destructive"
        });
      }
    }

    fetchBalance();
    setActiveBets([]);
  };

  return {
    raceState,
    currentPositions,
    winner,
    isPlacingBet,
    activeBets,
    balance,
    placeBet,
    startRace
  };
};
