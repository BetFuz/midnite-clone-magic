import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface CreateBonusDto {
  userId: string;
  depositAmount: number;
  tronAddress?: string;
}

interface ReleaseBonusDto {
  bonusId: string;
  userId: string;
}

@Injectable()
export class BonusService {
  private readonly logger = new Logger(BonusService.name);
  private readonly BONUS_PERCENTAGE = 300; // 300% bonus
  private readonly USDT_SPLIT = 0.5; // 50% USDT
  private readonly NGN_SPLIT = 0.5; // 50% NGN
  private readonly USDT_ROLLOVER = 0; // 0x rollover
  private readonly NGN_ROLLOVER = 5; // 5x rollover
  private readonly MIN_ODDS = 1.5;
  private readonly tronApiUrl = process.env.TRON_API_URL || 'https://api.trongrid.io';

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  /**
   * Create a 300% first deposit bonus (50% USDT + 50% NGN)
   */
  async createBonus(dto: CreateBonusDto) {
    this.logger.log(`Creating 300% bonus for user ${dto.userId}`);

    // Check if user already has a bonus
    const existingBonus = await this.prisma.bonus.findFirst({
      where: { userId: dto.userId },
    });

    if (existingBonus) {
      throw new BadRequestException('User already has a first deposit bonus');
    }

    const totalBonusAmount = dto.depositAmount * (this.BONUS_PERCENTAGE / 100);
    const usdtBonus = totalBonusAmount * this.USDT_SPLIT;
    const ngnBonus = totalBonusAmount * this.NGN_SPLIT;
    const rolloverRequired = ngnBonus * this.NGN_ROLLOVER;

    const bonus = await this.prisma.bonus.create({
      data: {
        userId: dto.userId,
        depositAmount: dto.depositAmount,
        usdtBonus,
        ngnBonus,
        usdtReleased: false,
        ngnLocked: true,
        rolloverRequired,
        rolloverProgress: 0,
        minOdds: this.MIN_ODDS,
        status: 'PENDING',
        tronAddress: dto.tronAddress,
      },
    });

    this.logger.log(`Bonus created: ${bonus.id} - USDT: ${usdtBonus}, NGN: ${ngnBonus}`);

    // Auto-release USDT portion (0x rollover)
    await this.releaseUsdtBonus(bonus.id, dto.userId);

    return bonus;
  }

  /**
   * Release USDT bonus instantly to user's Tron address (0x rollover)
   */
  async releaseUsdtBonus(bonusId: string, userId: string) {
    const bonus = await this.prisma.bonus.findFirst({
      where: { id: bonusId, userId },
      include: { user: true },
    });

    if (!bonus) {
      throw new NotFoundException('Bonus not found');
    }

    if (bonus.usdtReleased) {
      throw new BadRequestException('USDT bonus already released');
    }

    const tronAddress = bonus.tronAddress || bonus.user.tronAddress;

    if (!tronAddress) {
      throw new BadRequestException('Tron address not provided');
    }

    try {
      // Send USDT to Tron address
      await this.sendUsdtToTron(tronAddress, Number(bonus.usdtBonus));

      // Update bonus status
      await this.prisma.bonus.update({
        where: { id: bonusId },
        data: {
          usdtReleased: true,
          releasedAt: new Date(),
          status: 'USDT_RELEASED',
        },
      });

      this.logger.log(
        `USDT bonus released: ${bonus.usdtBonus} USDT to ${tronAddress}`
      );

      return {
        success: true,
        message: 'USDT bonus released successfully',
        amount: bonus.usdtBonus,
        address: tronAddress,
      };
    } catch (error) {
      this.logger.error('Failed to release USDT bonus', error);
      throw new BadRequestException('Failed to send USDT to Tron address');
    }
  }

  /**
   * Release NGN bonus after rollover requirements met
   */
  async releaseNgnBonus(bonusId: string, userId: string) {
    const bonus = await this.prisma.bonus.findFirst({
      where: { id: bonusId, userId },
    });

    if (!bonus) {
      throw new NotFoundException('Bonus not found');
    }

    if (!bonus.ngnLocked) {
      throw new BadRequestException('NGN bonus already released');
    }

    if (Number(bonus.rolloverProgress) < Number(bonus.rolloverRequired)) {
      throw new BadRequestException(
        `Rollover requirements not met. Progress: ${bonus.rolloverProgress}/${bonus.rolloverRequired}`
      );
    }

    // Credit NGN bonus to user balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: bonus.ngnBonus,
        },
      },
    });

    // Update bonus status
    await this.prisma.bonus.update({
      where: { id: bonusId },
      data: {
        ngnLocked: false,
        status: 'COMPLETED',
      },
    });

    this.logger.log(`NGN bonus released: ${bonus.ngnBonus} NGN to user ${userId}`);

    return {
      success: true,
      message: 'NGN bonus released successfully',
      amount: bonus.ngnBonus,
    };
  }

  /**
   * Update rollover progress based on qualifying bets
   */
  async updateRolloverProgress(userId: string, betAmount: number, odds: number) {
    const bonus = await this.prisma.bonus.findFirst({
      where: {
        userId,
        ngnLocked: true,
        status: { in: ['PENDING', 'USDT_RELEASED'] },
      },
    });

    if (!bonus) {
      return null; // No active bonus
    }

    // Check if bet qualifies (min odds 1.5)
    if (odds < this.MIN_ODDS) {
      this.logger.log(`Bet does not qualify for rollover - odds ${odds} < ${this.MIN_ODDS}`);
      return bonus;
    }

    // Update rollover progress
    const newProgress = Number(bonus.rolloverProgress) + betAmount;

    await this.prisma.bonus.update({
      where: { id: bonus.id },
      data: {
        rolloverProgress: newProgress,
      },
    });

    this.logger.log(
      `Rollover progress updated: ${newProgress}/${bonus.rolloverRequired}`
    );

    // Auto-release if requirements met
    if (newProgress >= Number(bonus.rolloverRequired)) {
      await this.releaseNgnBonus(bonus.id, userId);
    }

    return bonus;
  }

  /**
   * Send USDT to Tron address via TronGrid API
   */
  private async sendUsdtToTron(address: string, amount: number) {
    this.logger.log(`Sending ${amount} USDT to ${address}`);

    // In production, integrate with TronGrid API or Tron wallet service
    // For now, this is a mock implementation
    const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.tronApiUrl}/wallet/triggersmartcontract`, {
          owner_address: process.env.TRON_WALLET_ADDRESS,
          contract_address: usdtContractAddress,
          function_selector: 'transfer(address,uint256)',
          parameter: this.encodeTransferParameters(address, amount),
          fee_limit: 100000000,
        })
      );

      this.logger.log('USDT transfer initiated', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send USDT', error);
      throw error;
    }
  }

  /**
   * Encode transfer parameters for Tron smart contract call
   */
  private encodeTransferParameters(address: string, amount: number): string {
    // Convert address and amount to hex format for Tron smart contract
    // This is a simplified version - use tronweb library in production
    const addressHex = address.slice(2).padStart(64, '0');
    const amountHex = (amount * 1e6).toString(16).padStart(64, '0'); // USDT has 6 decimals
    return addressHex + amountHex;
  }

  /**
   * Get bonus details
   */
  async getBonusDetails(userId: string) {
    const bonus = await this.prisma.bonus.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!bonus) {
      return null;
    }

    return {
      ...bonus,
      rolloverPercentage: Number(bonus.rolloverRequired) > 0
        ? (Number(bonus.rolloverProgress) / Number(bonus.rolloverRequired)) * 100
        : 0,
    };
  }
}
