import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ethers } from 'ethers';
import { createHash } from 'crypto';

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
const LEDGER_PRIVATE_KEY = process.env.LEDGER_PRIVATE_KEY || '';
const LEDGER_CONTRACT_ADDRESS = process.env.LEDGER_CONTRACT_ADDRESS || '';

// ABI for BetLedger smart contract
const LEDGER_ABI = [
  'function recordBet(bytes32 betHash, uint256 winAmount) external returns (uint256)',
  'function getBetRecord(bytes32 betHash) external view returns (uint256, uint256, address)',
  'event BetRecorded(bytes32 indexed betHash, uint256 winAmount, uint256 timestamp, address recorder)',
];

@Injectable()
export class LedgerService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private prisma: PrismaService) {
    // Initialize Web3 provider and contract
    this.provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    this.wallet = new ethers.Wallet(LEDGER_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(LEDGER_CONTRACT_ADDRESS, LEDGER_ABI, this.wallet);
  }

  /**
   * Listen to bet.settled events with win ≥ ₦1M
   * Hash betId and post to Polygon testnet
   */
  async processBigWin(betSlipId: string, winAmount: number): Promise<void> {
    // Only process wins ≥ ₦1,000,000
    if (winAmount < 1_000_000) {
      return;
    }

    // Check if already recorded
    const existing = await this.prisma.ledgerEntry.findUnique({
      where: { betSlipId },
    });

    if (existing) {
      console.log(`Bet already recorded on blockchain: ${betSlipId}`);
      return;
    }

    try {
      // Hash bet ID using SHA-256
      const betHash = this.hashBetId(betSlipId);
      const betHashBytes32 = ethers.encodeBytes32String(betHash);

      console.log(`Recording big win on Polygon: ₦${winAmount.toLocaleString()} (${betSlipId})`);

      // Submit transaction to Polygon testnet
      const tx = await this.contract.recordBet(betHashBytes32, ethers.parseUnits(winAmount.toString(), 0));

      console.log(`Transaction submitted: ${tx.hash}`);

      // Wait for confirmation (1 block)
      const receipt = await tx.wait(1);

      console.log(`Transaction confirmed: ${receipt.hash} (Block ${receipt.blockNumber})`);

      // Store in database
      await this.prisma.ledgerEntry.create({
        data: {
          betSlipId,
          betHash,
          winAmount,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          network: 'polygon-mumbai',
          status: 'confirmed',
        },
      });

      console.log(`Ledger entry created for bet ${betSlipId}`);
    } catch (error: any) {
      console.error('Blockchain recording failed:', error);

      // Store failed attempt
      await this.prisma.ledgerEntry.create({
        data: {
          betSlipId,
          betHash: this.hashBetId(betSlipId),
          winAmount,
          status: 'failed',
          errorMessage: error.message,
        },
      });
    }
  }

  /**
   * Export ledger as CSV
   * Format: betSlipId,betHash,winAmount,txHash,blockNumber,timestamp
   */
  async exportCsv(): Promise<string> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { status: 'confirmed' },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'betSlipId,betHash,winAmount,txHash,blockNumber,timestamp\n';

    for (const entry of entries) {
      csv += `${entry.betSlipId},${entry.betHash},${entry.winAmount},${entry.txHash},${entry.blockNumber},${entry.createdAt.toISOString()}\n`;
    }

    return csv;
  }

  /**
   * Get ledger entry by bet ID
   */
  async getLedgerEntry(betSlipId: string): Promise<any> {
    return this.prisma.ledgerEntry.findUnique({
      where: { betSlipId },
    });
  }

  /**
   * Get recent ledger entries
   */
  async getRecentEntries(limit = 100): Promise<any[]> {
    return this.prisma.ledgerEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        betSlipId: true,
        betHash: true,
        winAmount: true,
        txHash: true,
        blockNumber: true,
        network: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Hash bet ID using SHA-256
   */
  private hashBetId(betSlipId: string): string {
    return createHash('sha256').update(betSlipId).digest('hex');
  }
}
