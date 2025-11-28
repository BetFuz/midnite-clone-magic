import { assertEquals, assertThrows } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { DeadHeatService } from "./dead-heat-service.ts";

Deno.test("DeadHeatService - No reduction for single winner", () => {
  const result = DeadHeatService.applyReduction(10, 5.0, 1);
  
  assertEquals(result.originalStake, 10);
  assertEquals(result.originalOdds, 5.0);
  assertEquals(result.numberOfWinners, 1);
  assertEquals(result.reducedStake, 10);
  assertEquals(result.reducedPayout, 50); // Full payout: 10 × 5
  assertEquals(result.reductionFactor, 1.0);
});

Deno.test("DeadHeatService - 2-way dead-heat reduction", () => {
  const result = DeadHeatService.applyReduction(10, 5.0, 2);
  
  assertEquals(result.originalStake, 10);
  assertEquals(result.originalOdds, 5.0);
  assertEquals(result.numberOfWinners, 2);
  assertEquals(result.reducedStake, 5); // Half stake
  assertEquals(result.reducedPayout, 25); // Half payout: (10/2) × 5
  assertEquals(result.reductionFactor, 0.5);
});

Deno.test("DeadHeatService - 3-way dead-heat reduction", () => {
  const result = DeadHeatService.applyReduction(15, 4.0, 3);
  
  assertEquals(result.originalStake, 15);
  assertEquals(result.originalOdds, 4.0);
  assertEquals(result.numberOfWinners, 3);
  assertEquals(result.reducedStake, 5); // Third of stake
  assertEquals(result.reducedPayout, 20); // Third payout: (15/3) × 4
  assertEquals(result.reductionFactor, 1/3);
});

Deno.test("DeadHeatService - 4-way dead-heat reduction", () => {
  const result = DeadHeatService.applyReduction(20, 3.0, 4);
  
  assertEquals(result.originalStake, 20);
  assertEquals(result.originalOdds, 3.0);
  assertEquals(result.numberOfWinners, 4);
  assertEquals(result.reducedStake, 5); // Quarter of stake
  assertEquals(result.reducedPayout, 15); // Quarter payout: (20/4) × 3
  assertEquals(result.reductionFactor, 0.25);
});

Deno.test("DeadHeatService - Throws error for invalid positions", () => {
  assertThrows(
    () => DeadHeatService.applyReduction(10, 5.0, 0),
    Error,
    "Number of positions must be greater than 0"
  );
  
  assertThrows(
    () => DeadHeatService.applyReduction(10, 5.0, -1),
    Error,
    "Number of positions must be greater than 0"
  );
});

Deno.test("DeadHeatService - Throws error for invalid stake", () => {
  assertThrows(
    () => DeadHeatService.applyReduction(0, 5.0, 2),
    Error,
    "Stake must be greater than 0"
  );
  
  assertThrows(
    () => DeadHeatService.applyReduction(-10, 5.0, 2),
    Error,
    "Stake must be greater than 0"
  );
});

Deno.test("DeadHeatService - Throws error for invalid odds", () => {
  assertThrows(
    () => DeadHeatService.applyReduction(10, 1.0, 2),
    Error,
    "Odds must be greater than 1.0"
  );
  
  assertThrows(
    () => DeadHeatService.applyReduction(10, 0.5, 2),
    Error,
    "Odds must be greater than 1.0"
  );
});

Deno.test("DeadHeatService - Rule-4 deduction calculation", () => {
  // Test various withdrawn odds ranges
  assertEquals(DeadHeatService.calculateRule4Deduction(5.0, 1.10), 0.90); // 1/10 or shorter
  assertEquals(DeadHeatService.calculateRule4Deduction(5.0, 1.25), 0.75); // 1/4
  assertEquals(DeadHeatService.calculateRule4Deduction(5.0, 2.00), 0.50); // Evens
  assertEquals(DeadHeatService.calculateRule4Deduction(5.0, 3.00), 0.30); // 2/1
  assertEquals(DeadHeatService.calculateRule4Deduction(5.0, 6.00), 0.10); // 5/1
  assertEquals(DeadHeatService.calculateRule4Deduction(5.0, 10.00), 0); // 9/1 or bigger
});

Deno.test("DeadHeatService - Rule-4 application", () => {
  const payout = DeadHeatService.applyRule4(10, 5.0, 2.00);
  // Original odds 5.0, Rule-4 deduction 0.50 (Evens)
  // Adjusted odds: 5.0 - 0.50 = 4.50
  // Payout: 10 × 4.50 = 45
  assertEquals(payout, 45);
});

Deno.test("DeadHeatService - Sports supporting dead-heat", () => {
  assertEquals(DeadHeatService.supportsDeadHeat("horse_racing"), true);
  assertEquals(DeadHeatService.supportsDeadHeat("greyhound_racing"), true);
  assertEquals(DeadHeatService.supportsDeadHeat("golf"), true);
  assertEquals(DeadHeatService.supportsDeadHeat("virtual_horse_racing"), true);
  assertEquals(DeadHeatService.supportsDeadHeat("football"), false);
  assertEquals(DeadHeatService.supportsDeadHeat("basketball"), false);
});
