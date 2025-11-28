import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

interface CreateWithdrawalDto {
  userId: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'USDT_TRC20' | 'CRYPTO' | 'MOBILE_MONEY';
  destination: string; // Bank account, crypto address, or mobile number
}

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);
  private readonly COMPENSATION_AMOUNT = 1000; // ₦1,000
  private readonly TIMER_DURATION = 60000; // 60 seconds in milliseconds

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('withdrawals') private readonly withdrawalQueue: Queue
  ) {}

  /**
   * Create a withdrawal request and start 60-second timer
   */
  async createWithdrawal(dto: CreateWithdrawalDto) {
    this.logger.log(`Creating withdrawal request for user ${dto.userId}`);

    // Validate user has sufficient balance
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (Number(user.balance) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Generate unique reference
    const reference = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create withdrawal record
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        method: dto.method,
        destination: dto.destination,
        status: 'PENDING',
        requestedAt: new Date(),
        timerStarted: new Date(),
        reference,
      },
    });

    // Deduct amount from user balance immediately
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        balance: {
          decrement: dto.amount,
        },
      },
    });

    // Add withdrawal to BullMQ queue with 60-second delay
    await this.withdrawalQueue.add(
      'process-withdrawal',
      {
        withdrawalId: withdrawal.id,
        userId: dto.userId,
        amount: dto.amount,
        method: dto.method,
        destination: dto.destination,
      },
      {
        delay: this.TIMER_DURATION, // 60 seconds
        removeOnComplete: true,
        attempts: 3,
      }
    );

    this.logger.log(`Withdrawal created: ${withdrawal.id} with 60s timer`);

    return {
      ...withdrawal,
      timerExpiresAt: new Date(Date.now() + this.TIMER_DURATION),
    };
  }

  /**
   * Process withdrawal (called by BullMQ processor)
   */
  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    const now = new Date();
    const timerStarted = new Date(withdrawal.timerStarted!);
    const elapsedTime = now.getTime() - timerStarted.getTime();

    this.logger.log(`Processing withdrawal ${withdrawalId} - Elapsed time: ${elapsedTime}ms`);

    // Check if timer breached (60 seconds)
    if (elapsedTime > this.TIMER_DURATION) {
      return await this.handleLateWithdrawal(withdrawal);
    }

    // Process withdrawal normally
    return await this.completeWithdrawal(withdrawal);
  }

  /**
   * Handle late withdrawal (timer breached)
   */
  private async handleLateWithdrawal(withdrawal: any) {
    this.logger.warn(`Withdrawal ${withdrawal.id} breached 60s timer - Applying compensation`);

    // Credit ₦1,000 compensation
    await this.prisma.user.update({
      where: { id: withdrawal.userId },
      data: {
        balance: {
          increment: this.COMPENSATION_AMOUNT,
        },
      },
    });

    // Update withdrawal record
    await this.prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        timerExpired: true,
        compensationPaid: true,
        compensationAmount: this.COMPENSATION_AMOUNT,
        status: 'COMPENSATED',
        processedAt: new Date(),
      },
    });

    // Emit withdrawal.late event (for analytics, notifications, etc.)
    await this.emitWithdrawalLateEvent(withdrawal);

    this.logger.log(
      `Compensation paid: ₦${this.COMPENSATION_AMOUNT} to user ${withdrawal.userId}`
    );

    return {
      success: true,
      message: 'Withdrawal processed with compensation due to delay',
      compensationAmount: this.COMPENSATION_AMOUNT,
      withdrawal,
    };
  }

  /**
   * Complete withdrawal successfully
   */
  private async completeWithdrawal(withdrawal: any) {
    this.logger.log(`Completing withdrawal ${withdrawal.id} successfully`);

    // In production, integrate with payment gateway here
    // For now, mark as completed
    await this.prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Withdrawal completed successfully',
      withdrawal,
    };
  }

  /**
   * Emit withdrawal.late event for monitoring/notifications
   */
  private async emitWithdrawalLateEvent(withdrawal: any) {
    // In production, emit to event bus (RabbitMQ, Kafka, etc.)
    this.logger.warn('WITHDRAWAL.LATE EVENT', {
      event: 'withdrawal.late',
      withdrawalId: withdrawal.id,
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      compensationPaid: this.COMPENSATION_AMOUNT,
      timestamp: new Date().toISOString(),
    });

    // Could also trigger:
    // - Email notification to user
    // - Admin alert
    // - Analytics tracking
    // - Slack/Discord webhook
  }

  /**
   * Cancel withdrawal and refund user
   */
  async cancelWithdrawal(withdrawalId: string, userId: string) {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { id: withdrawalId, userId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('Withdrawal cannot be cancelled');
    }

    // Refund amount to user balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: withdrawal.amount,
        },
      },
    });

    // Update withdrawal status
    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'CANCELLED',
        processedAt: new Date(),
      },
    });

    this.logger.log(`Withdrawal ${withdrawalId} cancelled and refunded`);

    return {
      success: true,
      message: 'Withdrawal cancelled and refunded',
      withdrawal,
    };
  }

  /**
   * Get withdrawal history for user
   */
  async getWithdrawalHistory(userId: string, limit: number = 20) {
    return await this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get withdrawal details
   */
  async getWithdrawalDetails(withdrawalId: string, userId: string) {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { id: withdrawalId, userId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    return withdrawal;
  }
}
