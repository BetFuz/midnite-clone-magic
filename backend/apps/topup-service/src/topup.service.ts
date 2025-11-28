import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import axios from 'axios';
import { createHash } from 'crypto';

const SELCOM_API_KEY = process.env.SELCOM_API_KEY || '';
const SELCOM_API_SECRET = process.env.SELCOM_API_SECRET || '';
const SELCOM_BASE_URL = process.env.SELCOM_BASE_URL || 'https://apigw.selcommobile.com';

interface TopupRequest {
  phone: string;
  carrier: 'mtn' | 'airtel' | 'glo' | '9mobile';
  amount: number;
  type: 'airtime' | 'data';
}

interface TopupResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  message: string;
}

@Injectable()
export class TopupService {
  constructor(private prisma: PrismaService) {}

  /**
   * Idempotent topup request - prevents duplicate processing
   * Returns existing transaction if found within 24 hours
   */
  async createTopup(dto: TopupRequest, userId: string): Promise<TopupResponse> {
    // Generate idempotency key from request parameters
    const idempotencyKey = this.generateIdempotencyKey(dto, userId);

    // Check for existing transaction within 24 hours
    const existingTopup = await this.prisma.topupTransaction.findFirst({
      where: {
        idempotencyKey,
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours
        },
      },
    });

    if (existingTopup) {
      return {
        transactionId: existingTopup.id,
        status: existingTopup.status as 'pending' | 'completed' | 'failed',
        reference: existingTopup.reference,
        message: 'Transaction already exists',
      };
    }

    // Validate user balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user || user.balance < dto.amount) {
      throw new Error('Insufficient balance');
    }

    // Create pending transaction
    const transaction = await this.prisma.topupTransaction.create({
      data: {
        userId,
        phone: dto.phone,
        carrier: dto.carrier,
        amount: dto.amount,
        type: dto.type,
        status: 'pending',
        reference: this.generateReference(),
        idempotencyKey,
      },
    });

    // Deduct balance immediately
    await this.prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: dto.amount } },
    });

    // Call Selcom API asynchronously
    this.processTopupWithSelcom(transaction.id, dto).catch((error) => {
      console.error('Selcom topup failed:', error);
      // Will be retried by webhook or manual reconciliation
    });

    return {
      transactionId: transaction.id,
      status: 'pending',
      reference: transaction.reference,
      message: 'Topup initiated. You will receive confirmation within 5 minutes.',
    };
  }

  /**
   * Process topup with Selcom API
   * Expected completion: < 5 minutes
   */
  private async processTopupWithSelcom(transactionId: string, dto: TopupRequest): Promise<void> {
    const transaction = await this.prisma.topupTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    try {
      // Prepare Selcom API request
      const timestamp = new Date().toISOString();
      const digest = this.generateSelcomDigest(transaction.reference, timestamp);

      const response = await axios.post(
        `${SELCOM_BASE_URL}/v1/checkout/topup`,
        {
          vendor: 'BETFUZ',
          order_id: transaction.reference,
          msisdn: dto.phone,
          operator: dto.carrier.toUpperCase(),
          amount: dto.amount,
          product_type: dto.type.toUpperCase(),
          webhook_url: `${process.env.API_BASE_URL}/topup/webhook`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `SELCOM ${SELCOM_API_KEY}`,
            'Digest-Method': 'HS256',
            Digest: digest,
            Timestamp: timestamp,
          },
          timeout: 30000, // 30 seconds
        }
      );

      // Update transaction with Selcom reference
      await this.prisma.topupTransaction.update({
        where: { id: transactionId },
        data: {
          externalReference: response.data.reference_id,
          metadata: response.data,
        },
      });

      console.log(`Topup initiated with Selcom: ${transaction.reference}`);
    } catch (error: any) {
      console.error('Selcom API error:', error.response?.data || error.message);

      // Mark as failed and refund user
      await this.prisma.topupTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'failed',
          errorMessage: error.response?.data?.message || error.message,
        },
      });

      // Refund balance
      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });
    }
  }

  /**
   * Handle Selcom webhook confirmation
   * Called when topup completes (< 5 minutes)
   */
  async handleWebhook(payload: any): Promise<void> {
    const { order_id, status, reference_id, result_code, result_description } = payload;

    const transaction = await this.prisma.topupTransaction.findFirst({
      where: {
        OR: [{ reference: order_id }, { externalReference: reference_id }],
      },
    });

    if (!transaction) {
      console.warn(`Webhook received for unknown transaction: ${order_id}`);
      return;
    }

    // Prevent duplicate processing
    if (transaction.status !== 'pending') {
      console.log(`Transaction already processed: ${transaction.reference}`);
      return;
    }

    // Update transaction status
    const newStatus = status === 'SUCCESS' ? 'completed' : 'failed';

    await this.prisma.topupTransaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        completedAt: new Date(),
        metadata: { ...transaction.metadata, webhook: payload },
        errorMessage: result_description,
      },
    });

    // Refund if failed
    if (newStatus === 'failed') {
      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });
    }

    console.log(
      `Topup ${newStatus} for ${transaction.phone}: ₦${transaction.amount} (${result_code})`
    );
  }

  /**
   * Get topup history for user
   */
  async getHistory(userId: string, limit = 50): Promise<any[]> {
    return this.prisma.topupTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        phone: true,
        carrier: true,
        amount: true,
        type: true,
        status: true,
        reference: true,
        createdAt: true,
        completedAt: true,
      },
    });
  }

  /**
   * Generate idempotency key from request params
   */
  private generateIdempotencyKey(dto: TopupRequest, userId: string): string {
    const data = `${userId}:${dto.phone}:${dto.carrier}:${dto.amount}:${dto.type}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate unique transaction reference
   */
  private generateReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TOP${timestamp}${random}`.toUpperCase();
  }

  /**
   * Generate HMAC digest for Selcom API authentication
   */
  private generateSelcomDigest(orderId: string, timestamp: string): string {
    const data = `${SELCOM_API_KEY}${orderId}${timestamp}`;
    return createHash('sha256')
      .update(data + SELCOM_API_SECRET)
      .digest('hex');
  }
}
