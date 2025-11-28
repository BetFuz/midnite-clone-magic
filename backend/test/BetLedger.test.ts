import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BetLedger } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('BetLedger', function () {
  let betLedger: BetLedger;
  let owner: SignerWithAddress;
  let recorder: SignerWithAddress;

  const betHash1 = ethers.encodeBytes32String('abc123');
  const betHash2 = ethers.encodeBytes32String('def456');
  const winAmount1 = 5_000_000; // ₦5M
  const winAmount2 = 10_000_000; // ₦10M

  beforeEach(async function () {
    [owner, recorder] = await ethers.getSigners();

    const BetLedgerFactory = await ethers.getContractFactory('BetLedger');
    betLedger = await BetLedgerFactory.deploy();
    await betLedger.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should initialize with zero bets and zero total amount', async function () {
      const [totalBets, totalAmount] = await betLedger.getStats();
      expect(totalBets).to.equal(0);
      expect(totalAmount).to.equal(0);
    });
  });

  describe('recordBet', function () {
    it('Should record a bet with valid win amount', async function () {
      const tx = await betLedger.connect(recorder).recordBet(betHash1, winAmount1);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;

      const [winAmount, timestamp, recordedBy] = await betLedger.getBetRecord(betHash1);
      expect(winAmount).to.equal(winAmount1);
      expect(timestamp).to.be.greaterThan(0);
      expect(recordedBy).to.equal(recorder.address);
    });

    it('Should emit BetRecorded event', async function () {
      await expect(betLedger.connect(recorder).recordBet(betHash1, winAmount1))
        .to.emit(betLedger, 'BetRecorded')
        .withArgs(betHash1, winAmount1, anyValue, recorder.address);
    });

    it('Should revert if win amount < 1M naira', async function () {
      await expect(betLedger.recordBet(betHash1, 500_000)).to.be.revertedWith(
        'Win amount must be >= 1M naira'
      );
    });

    it('Should revert if bet already recorded', async function () {
      await betLedger.recordBet(betHash1, winAmount1);

      await expect(betLedger.recordBet(betHash1, winAmount1)).to.be.revertedWith(
        'Bet already recorded'
      );
    });

    it('Should update totalBets and totalWinAmount', async function () {
      await betLedger.recordBet(betHash1, winAmount1);
      await betLedger.recordBet(betHash2, winAmount2);

      const [totalBets, totalAmount] = await betLedger.getStats();
      expect(totalBets).to.equal(2);
      expect(totalAmount).to.equal(winAmount1 + winAmount2);
    });
  });

  describe('getBetRecord', function () {
    it('Should return correct bet details', async function () {
      await betLedger.connect(recorder).recordBet(betHash1, winAmount1);

      const [winAmount, timestamp, recordedBy] = await betLedger.getBetRecord(betHash1);
      expect(winAmount).to.equal(winAmount1);
      expect(timestamp).to.be.greaterThan(0);
      expect(recordedBy).to.equal(recorder.address);
    });

    it('Should return zero values for non-existent bet', async function () {
      const [winAmount, timestamp, recordedBy] = await betLedger.getBetRecord(betHash1);
      expect(winAmount).to.equal(0);
      expect(timestamp).to.equal(0);
      expect(recordedBy).to.equal(ethers.ZeroAddress);
    });
  });

  describe('betExists', function () {
    it('Should return true for recorded bet', async function () {
      await betLedger.recordBet(betHash1, winAmount1);
      expect(await betLedger.betExists(betHash1)).to.be.true;
    });

    it('Should return false for non-existent bet', async function () {
      expect(await betLedger.betExists(betHash1)).to.be.false;
    });
  });

  describe('getStats', function () {
    it('Should return correct statistics after multiple bets', async function () {
      await betLedger.recordBet(betHash1, winAmount1);
      await betLedger.recordBet(betHash2, winAmount2);

      const [totalBets, totalAmount] = await betLedger.getStats();
      expect(totalBets).to.equal(2);
      expect(totalAmount).to.equal(winAmount1 + winAmount2);
    });
  });
});

// Helper function for matching any value in event assertions
function anyValue() {
  return expect.anything;
}
