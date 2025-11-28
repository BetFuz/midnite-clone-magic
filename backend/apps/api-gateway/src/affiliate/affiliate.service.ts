import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AffiliateTier, Prisma } from '@prisma/client';

interface CommissionCalculation {
  baseCommission: number;
  overrideCommission: number;
  totalCommission: number;
  tier: AffiliateTier;
  dailySalaryEligible: boolean;
}

@Injectable()
export class AffiliateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate commission based on affiliate tier
   * Bronze: 20% base
   * Silver: 25% base + 5% override on sub-affiliates
   * Gold: 30% base + 10% override on sub-affiliates + ₦5,000 daily salary (≥200 actives)
   */
  async calculateCommission(
    affiliateId: string,
    revenueAmount: number,
  ): Promise<CommissionCalculation> {
    const affiliate = await this.prisma.affiliateLink.findUnique({
      where: { id: affiliateId },
      include: {
        children: {
          where: { isActive: true },
        },
      },
    });

    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    let baseRate = 0;
    let overrideRate = 0;
    let dailySalaryEligible = false;

    switch (affiliate.tier) {
      case 'BRONZE':
        baseRate = 0.2; // 20%
        overrideRate = 0;
        break;
      case 'SILVER':
        baseRate = 0.25; // 25%
        overrideRate = 0.05; // 5%
        break;
      case 'GOLD':
        baseRate = 0.3; // 30%
        overrideRate = 0.1; // 10%
        dailySalaryEligible = affiliate.activeReferrals >= 200;
        break;
    }

    const baseCommission = revenueAmount * baseRate;
    const overrideCommission = revenueAmount * overrideRate * affiliate.children.length;
    const totalCommission = baseCommission + overrideCommission;

    // Update affiliate commission
    await this.prisma.affiliateLink.update({
      where: { id: affiliateId },
      data: {
        commission: {
          increment: totalCommission,
        },
        commissionRate: baseRate,
        overrideRate,
      },
    });

    // Create commission transaction
    await this.prisma.transaction.create({
      data: {
        userId: affiliate.userId,
        type: 'COMMISSION',
        amount: totalCommission,
        status: 'COMPLETED',
        reference: `COMM-${Date.now()}-${affiliateId.slice(0, 8)}`,
        metadata: {
          affiliateId,
          baseCommission,
          overrideCommission,
          tier: affiliate.tier,
          activeReferrals: affiliate.activeReferrals,
        },
      },
    });

    return {
      baseCommission,
      overrideCommission,
      totalCommission,
      tier: affiliate.tier,
      dailySalaryEligible,
    };
  }

  /**
   * Process daily salary for Gold-tier affiliates with ≥200 active referrals
   * Called by cron at 08:00 WAT
   */
  async processDailySalaries(): Promise<{
    processed: number;
    failed: number;
    totalPaid: number;
  }> {
    const goldAffiliates = await this.prisma.affiliateLink.findMany({
      where: {
        tier: 'GOLD',
        activeReferrals: {
          gte: 200,
        },
        isActive: true,
      },
    });

    let processed = 0;
    let failed = 0;
    let totalPaid = 0;

    for (const affiliate of goldAffiliates) {
      try {
        // Check if salary already paid today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (
          affiliate.lastSalaryPaidAt &&
          new Date(affiliate.lastSalaryPaidAt) >= today
        ) {
          continue; // Already paid today
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
            },
          },
        });

        processed++;
        totalPaid += dailySalary;
      } catch (error) {
        console.error(`Failed to process salary for affiliate ${affiliate.id}:`, error);
        failed++;
      }
    }

    return { processed, failed, totalPaid };
  }

  /**
   * Get affiliate tree (depth 3) for visualization
   */
  async getAffiliateTree(affiliateId: string, depth: number = 3) {
    const buildTree = async (id: string, currentDepth: number): Promise<any> => {
      if (currentDepth > depth) return null;

      const affiliate = await this.prisma.affiliateLink.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          children: {
            where: { isActive: true },
          },
        },
      });

      if (!affiliate) return null;

      const children =
        currentDepth < depth
          ? await Promise.all(
              affiliate.children.map((child) => buildTree(child.id, currentDepth + 1)),
            )
          : [];

      return {
        id: affiliate.id,
        userId: affiliate.userId,
        name: affiliate.user.fullName || affiliate.user.email,
        email: affiliate.user.email,
        tier: affiliate.tier,
        code: affiliate.code,
        activeReferrals: affiliate.activeReferrals,
        commission: affiliate.commission.toNumber(),
        conversions: affiliate.conversions,
        isActive: affiliate.isActive,
        children: children.filter((c) => c !== null),
      };
    };

    return buildTree(affiliateId, 0);
  }

  /**
   * Upgrade affiliate tier based on performance
   */
  async upgradeTier(affiliateId: string): Promise<AffiliateTier> {
    const affiliate = await this.prisma.affiliateLink.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    let newTier = affiliate.tier;

    // Upgrade logic: Bronze → Silver at 50 actives, Silver → Gold at 150 actives
    if (affiliate.tier === 'BRONZE' && affiliate.activeReferrals >= 50) {
      newTier = 'SILVER';
    } else if (affiliate.tier === 'SILVER' && affiliate.activeReferrals >= 150) {
      newTier = 'GOLD';
    }

    if (newTier !== affiliate.tier) {
      await this.prisma.affiliateLink.update({
        where: { id: affiliateId },
        data: { tier: newTier },
      });
    }

    return newTier;
  }
}
