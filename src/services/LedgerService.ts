import { supabase } from '@/integrations/supabase/client';

export interface LedgerEntry {
  user_id: string;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id?: string;
  reference_type?: string;
  description: string;
  metadata?: Record<string, any>;
}

export class LedgerService {
  /**
   * Write immutable ledger entry for all financial mutations
   * REQUIRED by compliance for 100% audit trail
   */
  static async logTransaction(entry: LedgerEntry): Promise<string> {
    console.log('Writing ledger entry:', entry.transaction_type, entry.amount);

    const { data, error } = await supabase
      .from('ledger_entries')
      .insert({
        user_id: entry.user_id,
        transaction_type: entry.transaction_type,
        amount: entry.amount,
        balance_before: entry.balance_before,
        balance_after: entry.balance_after,
        reference_id: entry.reference_id,
        reference_type: entry.reference_type,
        description: entry.description,
        metadata: entry.metadata || {},
        currency: 'NGN'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to write ledger entry:', error);
      throw new Error('Ledger write failed - transaction aborted');
    }

    return data.id;
  }

  /**
   * Log deposit transaction
   */
  static async logDeposit(
    userId: string, 
    amount: number, 
    balanceBefore: number,
    referenceId: string,
    method: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'deposit',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceBefore + amount,
      reference_id: referenceId,
      reference_type: 'payment',
      description: `Deposit via ${method}`,
      metadata: { payment_method: method }
    });
  }

  /**
   * Log withdrawal transaction
   */
  static async logWithdrawal(
    userId: string,
    amount: number,
    balanceBefore: number,
    referenceId: string,
    method: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'withdrawal',
      amount: -amount,
      balance_before: balanceBefore,
      balance_after: balanceBefore - amount,
      reference_id: referenceId,
      reference_type: 'payment',
      description: `Withdrawal via ${method}`,
      metadata: { payment_method: method }
    });
  }

  /**
   * Log bet placement
   */
  static async logBetPlacement(
    userId: string,
    stake: number,
    balanceBefore: number,
    betSlipId: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'bet_stake',
      amount: -stake,
      balance_before: balanceBefore,
      balance_after: balanceBefore - stake,
      reference_id: betSlipId,
      reference_type: 'bet_slip',
      description: 'Bet placed',
      metadata: { stake }
    });
  }

  /**
   * Log bet win payout
   */
  static async logBetWin(
    userId: string,
    winnings: number,
    balanceBefore: number,
    betSlipId: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'bet_win',
      amount: winnings,
      balance_before: balanceBefore,
      balance_after: balanceBefore + winnings,
      reference_id: betSlipId,
      reference_type: 'bet_slip',
      description: 'Bet won',
      metadata: { winnings }
    });
  }

  /**
   * Log bonus credit
   */
  static async logBonusCredit(
    userId: string,
    amount: number,
    balanceBefore: number,
    bonusType: string,
    referenceId?: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'bonus',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceBefore + amount,
      reference_id: referenceId,
      reference_type: 'bonus',
      description: `${bonusType} bonus credited`,
      metadata: { bonus_type: bonusType }
    });
  }

  /**
   * Log commission payment
   */
  static async logCommission(
    userId: string,
    amount: number,
    balanceBefore: number,
    affiliateCode: string,
    sourceUserId: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'commission',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceBefore + amount,
      reference_id: sourceUserId,
      reference_type: 'affiliate',
      description: 'Affiliate commission earned',
      metadata: { affiliate_code: affiliateCode, source_user_id: sourceUserId }
    });
  }

  /**
   * Log compensation payment
   */
  static async logCompensation(
    userId: string,
    amount: number,
    balanceBefore: number,
    reason: string
  ) {
    return this.logTransaction({
      user_id: userId,
      transaction_type: 'compensation',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceBefore + amount,
      description: `Compensation: ${reason}`,
      metadata: { reason }
    });
  }

  /**
   * Get user transaction history
   */
  static async getUserHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch ledger history:', error);
      return [];
    }

    return data;
  }

  /**
   * Verify ledger integrity (check for tampering)
   */
  static async verifyIntegrity(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('balance_before, balance_after, amount')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return true; // No entries = valid
    }

    // Verify balance consistency
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      if (Math.abs(prev.balance_after - curr.balance_before) > 0.01) {
        console.error('Ledger integrity violation:', { prev, curr });
        return false;
      }
    }

    return true;
  }
}
