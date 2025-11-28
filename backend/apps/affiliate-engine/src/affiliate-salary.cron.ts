import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class AffiliateSalaryCron {
  private readonly logger = new Logger(AffiliateSalaryCron.name);
  private isCronPaused = false;

  constructor(private prisma: PrismaService) {}

  /**
   * Process Gold-tier daily salaries at 08:00 WAT (UTC+1)
   * Cron runs at 07:00 UTC = 08:00 WAT
   * 
   * Pauses if threshold (≥200 active referrals) is missed
   */
  @Cron('0 7 * * *', {
    name: 'gold-affiliate-salary',
    timeZone: 'UTC',
  })
  async handleGoldSalary() {
    if (this.isCronPaused) {
      this.logger.warn('Gold salary cron is paused');
      return;
    }

    this.logger.log('Starting Gold-tier daily salary processing at 08:00 WAT');

    try {
      const goldAffiliates = await this.prisma.affiliateLink.findMany({
        where: {
          tier: 'GOLD',
          isActive: true,
        },
      });

      let processed = 0;
      let skipped = 0;
      let failed = 0;
      let totalPaid = 0;

      for (const affiliate of goldAffiliates) {
        try {
          // Check threshold: ≥200 active referrals
          if (affiliate.activeReferrals < 200) {
            this.logger.warn(
              `Affiliate ${affiliate.id} below threshold: ${affiliate.activeReferrals}/200 actives`,
            );
            skipped++;
            continue;
          }

          // Check if salary already paid today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (
            affiliate.lastSalaryPaidAt &&
            new Date(affiliate.lastSalaryPaidAt) >= today
          ) {
            this.logger.debug(`Affiliate ${affiliate.id} already paid today`);
            skipped++;
            continue;
          }

          const dailySalary = 5000; // ₦5,000

          // Update user balance
          await this.prisma.user.update({
            where: { id: affiliate.userId },
            data: {
              balance: {
                increment: dailySalary,
              },
            },
          });

          // Update affiliate record
          await this.prisma.affiliateLink.update({
            where: { id: affiliate.id },
            data: {
              dailySalary: {
                increment: dailySalary,
              },
              lastSalaryPaidAt: new Date(),
            },
          });

          // Create transaction record
          await this.prisma.transaction.create({
            data: {
              userId: affiliate.userId,
              type: 'COMMISSION',
              amount: dailySalary,
              status: 'COMPLETED',
              reference: `SALARY-${Date.now()}-${affiliate.id.slice(0, 8)}`,
              metadata: {
                type: 'daily_salary',
                affiliateId: affiliate.id,
                activeReferrals: affiliate.activeReferrals,
                tier: affiliate.tier,
                paidAt: new Date().toISOString(),
              },
            },
          });

          processed++;
          totalPaid += dailySalary;

          this.logger.log(
            `Paid ₦${dailySalary} to affiliate ${affiliate.id} (${affiliate.activeReferrals} actives)`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process salary for affiliate ${affiliate.id}:`,
            error,
          );
          failed++;
        }
      }

      this.logger.log(
        `Gold salary cron completed: ${processed} processed, ${skipped} skipped, ${failed} failed, ₦${totalPaid} total paid`,
      );

      // Auto-pause if no affiliates meet threshold
      if (processed === 0 && goldAffiliates.length > 0) {
        this.logger.warn('No Gold affiliates met ≥200 actives threshold. Pausing cron.');
        this.pauseCron();
      }
    } catch (error) {
      this.logger.error('Gold salary cron failed:', error);
      this.pauseCron(); // Pause on critical errors
    }
  }

  /**
   * Pause the cron job (e.g., when threshold is consistently missed)
   */
  pauseCron() {
    this.isCronPaused = true;
    this.logger.warn('Gold salary cron has been paused');
  }

  /**
   * Resume the cron job
   */
  resumeCron() {
    this.isCronPaused = false;
    this.logger.log('Gold salary cron has been resumed');
  }

  /**
   * Check cron status
   */
  getCronStatus(): { paused: boolean } {
    return { paused: this.isCronPaused };
  }
}
