import { describe, it, expect } from 'vitest';

/**
 * Dead-heat and Rule-4 Unit Tests
 * Tests for racing payout calculations to prevent margin bleed
 */

// Dead-heat reduction service
class DeadHeatService {
  /**
   * Apply dead-heat reduction when multiple winners tie
   * Formula: (stake × odds) ÷ number_of_tied_positions
   */
  static applyReduction(stake: number, odds: number, tiedPositions: number): number {
    if (tiedPositions <= 1) return stake * odds;
    return (stake * odds) / tiedPositions;
  }

  /**
   * Apply Rule-4 deduction when odds-on selection is withdrawn
   * Formula: stake × (1 - deduction_rate) × remaining_odds
   */
  static applyRule4(stake: number, odds: number, withdrawnOdds: number): number {
    // Calculate Rule-4 deduction percentage based on withdrawn horse odds
    let deductionRate = 0;
    
    if (withdrawnOdds <= 1.11) deductionRate = 0.90;      // 90p in £
    else if (withdrawnOdds <= 1.14) deductionRate = 0.85; // 85p in £
    else if (withdrawnOdds <= 1.22) deductionRate = 0.80; // 80p in £
    else if (withdrawnOdds <= 1.28) deductionRate = 0.75; // 75p in £
    else if (withdrawnOdds <= 1.40) deductionRate = 0.70; // 70p in £
    else if (withdrawnOdds <= 1.57) deductionRate = 0.65; // 65p in £
    else if (withdrawnOdds <= 1.80) deductionRate = 0.60; // 60p in £
    else if (withdrawnOdds <= 2.00) deductionRate = 0.55; // 55p in £
    else if (withdrawnOdds <= 2.20) deductionRate = 0.50; // 50p in £
    else if (withdrawnOdds <= 2.60) deductionRate = 0.45; // 45p in £
    else if (withdrawnOdds <= 3.00) deductionRate = 0.40; // 40p in £
    else if (withdrawnOdds <= 4.00) deductionRate = 0.35; // 35p in £
    else if (withdrawnOdds <= 5.00) deductionRate = 0.30; // 30p in £
    else if (withdrawnOdds <= 6.00) deductionRate = 0.25; // 25p in £
    else if (withdrawnOdds <= 9.00) deductionRate = 0.20; // 20p in £
    else if (withdrawnOdds <= 14.00) deductionRate = 0.15; // 15p in £
    else if (withdrawnOdds <= 20.00) deductionRate = 0.10; // 10p in £
    else deductionRate = 0.05; // 5p in £ for longer odds

    const adjustedStake = stake * (1 - deductionRate);
    return adjustedStake * odds;
  }
}

describe('DeadHeatService', () => {
  describe('applyReduction', () => {
    it('should return full payout when only 1 winner (no tie)', () => {
      const stake = 1000;
      const odds = 3.5;
      const tiedPositions = 1;
      
      const payout = DeadHeatService.applyReduction(stake, odds, tiedPositions);
      
      expect(payout).toBe(3500); // Full payout: 1000 × 3.5
    });

    it('should apply 2-way dead-heat reduction (divide by 2)', () => {
      const stake = 1000;
      const odds = 3.5;
      const tiedPositions = 2;
      
      const payout = DeadHeatService.applyReduction(stake, odds, tiedPositions);
      
      expect(payout).toBe(1750); // (1000 × 3.5) ÷ 2 = 1750
    });

    it('should apply 3-way dead-heat reduction (divide by 3)', () => {
      const stake = 1500;
      const odds = 4.0;
      const tiedPositions = 3;
      
      const payout = DeadHeatService.applyReduction(stake, odds, tiedPositions);
      
      expect(payout).toBe(2000); // (1500 × 4.0) ÷ 3 = 2000
    });

    it('should handle 4-way dead-heat correctly', () => {
      const stake = 2000;
      const odds = 5.0;
      const tiedPositions = 4;
      
      const payout = DeadHeatService.applyReduction(stake, odds, tiedPositions);
      
      expect(payout).toBe(2500); // (2000 × 5.0) ÷ 4 = 2500
    });

    it('should prevent overpayment in dead-heat scenarios', () => {
      const stake = 1000;
      const odds = 2.0;
      const fullPayout = stake * odds; // 2000 without dead-heat
      
      const twoWayPayout = DeadHeatService.applyReduction(stake, odds, 2);
      const threeWayPayout = DeadHeatService.applyReduction(stake, odds, 3);
      
      expect(twoWayPayout).toBeLessThan(fullPayout);
      expect(threeWayPayout).toBeLessThan(twoWayPayout);
      expect(threeWayPayout).toBeLessThan(fullPayout);
    });
  });

  describe('applyRule4', () => {
    it('should apply no deduction when withdrawn horse odds are very long (>20.0)', () => {
      const stake = 1000;
      const odds = 3.0;
      const withdrawnOdds = 25.0; // Long odds = 5% deduction
      
      const payout = DeadHeatService.applyRule4(stake, odds, withdrawnOdds);
      
      expect(payout).toBe(2850); // 1000 × 0.95 × 3.0 = 2850 (5% deduction)
    });

    it('should apply 90% deduction when favorite (1.11 odds) is withdrawn', () => {
      const stake = 1000;
      const odds = 3.0;
      const withdrawnOdds = 1.11; // Heavy favorite
      
      const payout = DeadHeatService.applyRule4(stake, odds, withdrawnOdds);
      
      expect(payout).toBe(300); // 1000 × 0.10 × 3.0 = 300 (90% deduction)
    });

    it('should apply 50% deduction for mid-range withdrawn odds (2.20)', () => {
      const stake = 1000;
      const odds = 4.0;
      const withdrawnOdds = 2.20;
      
      const payout = DeadHeatService.applyRule4(stake, odds, withdrawnOdds);
      
      expect(payout).toBe(2000); // 1000 × 0.50 × 4.0 = 2000 (50% deduction)
    });

    it('should apply 25% deduction for longer withdrawn odds (6.00)', () => {
      const stake = 2000;
      const odds = 2.5;
      const withdrawnOdds = 6.00;
      
      const payout = DeadHeatService.applyRule4(stake, odds, withdrawnOdds);
      
      expect(payout).toBe(3750); // 2000 × 0.75 × 2.5 = 3750 (25% deduction)
    });

    it('should prevent margin bleed when odds-on favorite is withdrawn', () => {
      const stake = 1000;
      const odds = 3.5;
      const fullPayout = stake * odds; // 3500 without Rule-4
      
      const payoutWithRule4 = DeadHeatService.applyRule4(stake, odds, 1.11);
      
      expect(payoutWithRule4).toBeLessThan(fullPayout);
      expect(payoutWithRule4).toBe(350); // Massive reduction for withdrawn favorite
    });

    it('should scale deductions based on withdrawn horse odds', () => {
      const stake = 1000;
      const odds = 2.0;
      
      const deductionFavorite = DeadHeatService.applyRule4(stake, odds, 1.11); // 90%
      const deductionMid = DeadHeatService.applyRule4(stake, odds, 3.00); // 40%
      const deductionLong = DeadHeatService.applyRule4(stake, odds, 15.00); // 15%
      
      expect(deductionFavorite).toBeLessThan(deductionMid);
      expect(deductionMid).toBeLessThan(deductionLong);
    });
  });

  describe('Combined scenarios', () => {
    it('should handle dead-heat + Rule-4 in same race', () => {
      const stake = 1000;
      const odds = 4.0;
      const withdrawnOdds = 2.00; // 55% deduction (Rule-4)
      const tiedPositions = 2; // Dead-heat

      // Apply Rule-4 first
      const afterRule4 = DeadHeatService.applyRule4(stake, odds, withdrawnOdds);
      
      // Then apply dead-heat reduction
      const finalPayout = afterRule4 / tiedPositions;
      
      expect(finalPayout).toBe(900); // (1000 × 0.45 × 4.0) ÷ 2 = 900
    });

    it('should prevent double overpayment in complex scenarios', () => {
      const stake = 5000;
      const odds = 3.0;
      const fullPayout = stake * odds; // 15000
      
      // Scenario: Favorite withdrawn (Rule-4) + 3-way dead-heat
      const afterRule4 = DeadHeatService.applyRule4(stake, odds, 1.14); // 85% deduction
      const finalPayout = afterRule4 / 3; // 3-way tie
      
      expect(finalPayout).toBeLessThan(fullPayout);
      expect(finalPayout).toBe(750); // Heavily reduced to prevent margin bleed
    });
  });
});

export { DeadHeatService };
