import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { LedgerService } from './ledger.service';

@Injectable()
export class LedgerCron {
  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService
  ) {}

  /**
   * Runs every 5 minutes to check for settled bets with win ≥ ₦1M
   * Processes bets that haven't been recorded on blockchain yet
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processSettledBets() {
    console.log('[LEDGER CRON] Checking for big wins...');

    try {
      // Find settled winning bets with win amount ≥ ₦1M
      // that haven't been recorded on blockchain
      const bigWins = await this.prisma.$queryRaw`
        SELECT bs.id, bs.potential_win
        FROM bet_slips bs
        LEFT JOIN ledger_entries le ON bs.id = le.bet_slip_id
        WHERE bs.status = 'won'
          AND bs.potential_win >= 1000000
          AND bs.settled_at IS NOT NULL
          AND le.id IS NULL
        ORDER BY bs.settled_at DESC
        LIMIT 10
      `;

      if (!Array.isArray(bigWins) || bigWins.length === 0) {
        console.log('[LEDGER CRON] No big wins to process');
        return;
      }

      console.log(`[LEDGER CRON] Found ${bigWins.length} big wins to record`);

      // Process each bet sequentially (to avoid gas issues)
      for (const bet of bigWins) {
        try {
          await this.ledgerService.processBigWin(
            (bet as any).id,
            parseFloat((bet as any).potential_win)
          );
        } catch (error: any) {
          console.error(`[LEDGER CRON] Failed to process bet ${(bet as any).id}:`, error.message);
          // Continue with next bet
        }
      }

      console.log('[LEDGER CRON] Big wins processing completed');
    } catch (error: any) {
      console.error('[LEDGER CRON] Error in cron job:', error);
    }
  }
}
