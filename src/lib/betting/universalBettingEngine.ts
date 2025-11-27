// Universal Betting Engine for Traditional African Games
// Supports P2P, Human vs AI, and AI vs AI betting modes

import { supabase } from '@/integrations/supabase/client';

export interface BettingConfig {
  gameId: string | null;
  gameType: 'mancala' | 'morabaraba' | 'african_draft';
  mode: 'p2p' | 'human-ai' | 'ai-ai' | 'cultural';
  stakeAmount: number;
  userId: string | null;
  difficulty?: string;
  culturalMode?: boolean;
}

export interface BetType {
  id: string;
  name: string;
  culturalName?: string;
  odds: number;
}

export interface GameBet {
  id?: string;
  user_id: string;
  session_id: string;
  bet_type: string;
  bet_value: string;
  stake_amount: number;
  odds: number;
  potential_win: number;
  status: string;
  created_at?: string;
  settled_at?: string | null;
}

export interface BetResult {
  success: boolean;
  betId?: string;
  error?: string;
  potentialWin?: number;
}

export class UniversalBettingEngine {
  private config: BettingConfig;
  private betTypes: BetType[] = [];

  constructor(config: BettingConfig) {
    this.config = config;
    this.initializeBetTypes();
  }

  private initializeBetTypes() {
    // Game-specific bet types
    switch (this.config.gameType) {
      case 'mancala':
        this.betTypes = [
          { id: 'winner', name: 'Game Winner', culturalName: 'Seed Master', odds: 1.8 },
          { id: 'seeds_captured', name: 'Seeds Captured', culturalName: 'Harvest Count', odds: 2.5 },
          { id: 'grand_slam', name: 'Grand Slam', culturalName: 'Bountiful Harvest', odds: 8.0 },
          { id: 'perfect_game', name: 'Perfect Game', culturalName: 'Ancestral Blessing', odds: 15.0 },
        ];
        break;
      case 'morabaraba':
        this.betTypes = [
          { id: 'winner', name: 'Game Winner', culturalName: 'Chief of Cows', odds: 1.8 },
          { id: 'cows_captured', name: 'Cows Captured', culturalName: 'Cattle Count', odds: 2.5 },
          { id: 'first_mill', name: 'First Mill', culturalName: 'First Kraal', odds: 3.5 },
          { id: 'total_mills', name: 'Total Mills', culturalName: 'Village Count', odds: 4.0 },
        ];
        break;
      case 'african_draft':
        this.betTypes = [
          { id: 'winner', name: 'Game Winner', culturalName: 'Battle Chief', odds: 1.8 },
          { id: 'pieces_captured', name: 'Pieces Captured', culturalName: 'Warriors Claimed', odds: 2.5 },
          { id: 'king_promotion', name: 'King Promotion', culturalName: 'Crown Blessing', odds: 3.0 },
          { id: 'perfect_victory', name: 'Perfect Victory', culturalName: 'Tribal Glory', odds: 12.0 },
        ];
        break;
    }
  }

  // Get available bet types for current game and mode
  getBetTypes(): BetType[] {
    return this.betTypes;
  }

  // Calculate odds based on mode and difficulty
  calculateOdds(betType: string, difficulty?: string): number {
    const baseBet = this.betTypes.find(bt => bt.id === betType);
    if (!baseBet) return 1.0;

    let odds = baseBet.odds;

    // Adjust odds for AI difficulty in human-ai mode
    if (this.config.mode === 'human-ai' && difficulty) {
      const difficultyMultiplier = {
        'Novice': 1.8,
        'Skilled': 3.5,
        'Expert': 7.0,
        'Master': 12.0,
      }[difficulty] || 1.0;
      
      odds = odds * (difficultyMultiplier / 2);
    }

    // Adjust for P2P mode (balanced odds)
    if (this.config.mode === 'p2p') {
      odds = odds * 0.9;
    }

    // Adjust for AI vs AI (higher odds due to unpredictability)
    if (this.config.mode === 'ai-ai') {
      odds = odds * 1.2;
    }

    return Math.round(odds * 100) / 100;
  }

  // Place a bet
  async placeBet(
    sessionId: string,
    betType: string,
    betValue: string,
    customStake?: number
  ): Promise<BetResult> {
    if (!this.config.userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const stake = customStake || this.config.stakeAmount;
    const odds = this.calculateOdds(betType, this.config.difficulty);
    const potentialWin = stake * odds;

    try {
      const { data, error } = await supabase
        .from('game_bets')
        .insert({
          user_id: this.config.userId,
          session_id: sessionId,
          bet_type: betType,
          bet_value: betValue,
          stake_amount: stake,
          odds: odds,
          potential_win: potentialWin,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        betId: data.id,
        potentialWin: potentialWin,
      };
    } catch (error) {
      console.error('Error placing bet:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to place bet' 
      };
    }
  }

  // Get active bets for a session
  async getSessionBets(sessionId: string): Promise<GameBet[]> {
    if (!this.config.userId) return [];

    try {
      const { data, error } = await supabase
        .from('game_bets')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', this.config.userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bets:', error);
      return [];
    }
  }

  // Settle bets based on game result
  async settleBets(
    sessionId: string,
    gameResult: {
      winner: string | null;
      player1Stats?: any;
      player2Stats?: any;
      gameStats?: any;
    }
  ): Promise<void> {
    if (!this.config.userId) return;

    try {
      const bets = await this.getSessionBets(sessionId);

      for (const bet of bets) {
        let won = false;

        // Check if bet won based on bet type
        switch (bet.bet_type) {
          case 'winner':
            // For human-ai mode, check if player won
            if (this.config.mode === 'human-ai') {
              won = gameResult.winner === 'player1' && bet.bet_value === 'player1';
            }
            // For p2p and ai-ai, check predicted winner
            else {
              won = gameResult.winner === bet.bet_value;
            }
            break;

          case 'seeds_captured':
          case 'cows_captured':
          case 'pieces_captured':
            // Check if predicted capture count matches
            const captureCount = gameResult.player1Stats?.captured || 0;
            won = captureCount >= parseInt(bet.bet_value);
            break;

          case 'grand_slam':
          case 'perfect_victory':
            // Perfect game conditions
            const isPerfect = gameResult.gameStats?.perfect === true;
            won = isPerfect && bet.bet_value === 'yes';
            break;

          default:
            won = false;
        }

        // Update bet status
        await supabase
          .from('game_bets')
          .update({ 
            status: won ? 'won' : 'lost',
            settled_at: new Date().toISOString(),
          })
          .eq('id', bet.id);

        // If won, update user balance
        if (won) {
          await this.creditWinnings(bet.potential_win);
        }
      }
    } catch (error) {
      console.error('Error settling bets:', error);
    }
  }

  // Credit winnings to user balance
  private async creditWinnings(amount: number): Promise<void> {
    if (!this.config.userId) return;

    try {
      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', this.config.userId)
        .single();

      if (profile) {
        const newBalance = (profile.balance || 0) + amount;
        
        await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', this.config.userId);
      }
    } catch (error) {
      console.error('Error crediting winnings:', error);
    }
  }

  // Get cultural celebration message
  getCulturalCelebration(won: boolean): string {
    if (!this.config.culturalMode) return '';

    const celebrations = {
      mancala: {
        won: '🌱 Bountiful Harvest! The ancestors smile upon you!',
        lost: '🌾 The seeds will grow again. Learn from this planting.',
      },
      morabaraba: {
        won: '🐄 The Chief of Cows! Your kraal is full and prosperous!',
        lost: '🌾 The herd will return. Patience brings wisdom.',
      },
      african_draft: {
        won: '👑 Victory! The tribe celebrates your strategic mastery!',
        lost: '⚔️ Honor in battle. Return stronger, warrior.',
      },
    };

    return won 
      ? celebrations[this.config.gameType].won 
      : celebrations[this.config.gameType].lost;
  }
}
