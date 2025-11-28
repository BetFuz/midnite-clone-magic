/**
 * Dead-Heat & Rule-4 Service
 * 
 * Handles stake reduction calculations when multiple participants tie (dead-heat)
 * Common in horse racing, golf, and virtual sports.
 * 
 * Formula: Reduced Payout = (Stake / Number of Winners) × Original Odds
 */

export interface DeadHeatResult {
  originalStake: number;
  originalOdds: number;
  numberOfWinners: number;
  reducedStake: number;
  reducedPayout: number;
  reductionFactor: number;
}

export class DeadHeatService {
  /**
   * Apply dead-heat reduction to a winning bet leg
   * 
   * @param stake - Original stake amount
   * @param odds - Original odds (decimal format)
   * @param positions - Number of winners sharing the position
   * @returns Calculated reduced payout and metadata
   * 
   * @example
   * // 2-way dead-heat: £10 at 5.0 odds
   * applyReduction(10, 5.0, 2)
   * // Returns: { reducedPayout: 25, reducedStake: 5, ... }
   * 
   * @example
   * // 3-way dead-heat: £15 at 4.0 odds
   * applyReduction(15, 4.0, 3)
   * // Returns: { reducedPayout: 20, reducedStake: 5, ... }
   */
  static applyReduction(
    stake: number,
    odds: number,
    positions: number
  ): DeadHeatResult {
    if (positions <= 0) {
      throw new Error('Number of positions must be greater than 0');
    }

    if (stake <= 0) {
      throw new Error('Stake must be greater than 0');
    }

    if (odds <= 1) {
      throw new Error('Odds must be greater than 1.0');
    }

    // No reduction if only one winner
    if (positions === 1) {
      const fullPayout = stake * odds;
      return {
        originalStake: stake,
        originalOdds: odds,
        numberOfWinners: positions,
        reducedStake: stake,
        reducedPayout: fullPayout,
        reductionFactor: 1.0,
      };
    }

    // Calculate dead-heat reduction
    const reductionFactor = 1 / positions;
    const reducedStake = stake * reductionFactor;
    const reducedPayout = reducedStake * odds;

    return {
      originalStake: stake,
      originalOdds: odds,
      numberOfWinners: positions,
      reducedStake,
      reducedPayout,
      reductionFactor,
    };
  }

  /**
   * Apply Rule-4 deduction when a runner is withdrawn
   * Used in horse racing when a horse is withdrawn before the race
   * 
   * @param odds - Original odds (decimal)
   * @param withdrawnOdds - Odds of withdrawn runner (decimal)
   * @returns Rule-4 deduction percentage (0-90%)
   */
  static calculateRule4Deduction(odds: number, withdrawnOdds: number): number {
    // Rule-4 deduction table (based on UK Tattersalls Rules)
    if (withdrawnOdds <= 1.11) return 0.90; // 1/10 or shorter
    if (withdrawnOdds <= 1.14) return 0.85; // 1/9 to 2/11
    if (withdrawnOdds <= 1.20) return 0.80; // 1/8 to 1/5
    if (withdrawnOdds <= 1.25) return 0.75; // 2/9 to 1/4
    if (withdrawnOdds <= 1.33) return 0.70; // 2/7 to 1/3
    if (withdrawnOdds <= 1.40) return 0.65; // 4/11 to 2/5
    if (withdrawnOdds <= 1.50) return 0.60; // 4/9 to 1/2
    if (withdrawnOdds <= 1.67) return 0.55; // 8/15 to 4/7
    if (withdrawnOdds <= 2.00) return 0.50; // 4/6 to Evens
    if (withdrawnOdds <= 2.20) return 0.45; // 5/4 to 6/5
    if (withdrawnOdds <= 2.50) return 0.40; // 11/8 to 6/4
    if (withdrawnOdds <= 2.75) return 0.35; // 13/8 to 7/4
    if (withdrawnOdds <= 3.00) return 0.30; // 15/8 to 2/1
    if (withdrawnOdds <= 3.50) return 0.25; // 9/4 to 5/2
    if (withdrawnOdds <= 4.00) return 0.20; // 11/4 to 3/1
    if (withdrawnOdds <= 4.50) return 0.15; // 7/2 to 7/2
    if (withdrawnOdds <= 6.00) return 0.10; // 4/1 to 5/1
    if (withdrawnOdds <= 9.00) return 0.05; // 11/2 to 8/1
    return 0; // 9/1 or bigger - no deduction
  }

  /**
   * Apply Rule-4 to a bet's winnings
   * 
   * @param stake - Original stake
   * @param odds - Original odds
   * @param withdrawnOdds - Odds of withdrawn runner
   * @returns Reduced payout after Rule-4 deduction
   */
  static applyRule4(stake: number, odds: number, withdrawnOdds: number): number {
    const deduction = this.calculateRule4Deduction(odds, withdrawnOdds);
    const adjustedOdds = Math.max(1.01, odds - deduction);
    return stake * adjustedOdds;
  }

  /**
   * Check if a sport/market type supports dead-heat rules
   */
  static supportsDeadHeat(sport: string): boolean {
    const deadHeatSports = [
      'horse_racing',
      'greyhound_racing',
      'golf',
      'virtual_horse_racing',
      'virtual_greyhounds',
      'virtual_speedway'
    ];
    return deadHeatSports.includes(sport.toLowerCase());
  }
}
