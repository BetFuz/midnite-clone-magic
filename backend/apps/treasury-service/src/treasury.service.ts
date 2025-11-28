import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import axios from 'axios';
import { createHash, createHmac } from 'crypto';

const WEMA_API_KEY = process.env.WEMA_API_KEY || '';
const WEMA_SECRET_KEY = process.env.WEMA_SECRET_KEY || '';
const WEMA_BASE_URL = process.env.WEMA_BASE_URL || 'https://api.wemabank.com';

interface CreateAccountRequest {
  userId: string;
  bvn: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  balance: number;
  status: string;
}

@Injectable()
export class TreasuryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create static virtual NUBAN for user on BVN link
   * One-time account creation per user
   */
  async createVirtualAccount(dto: CreateAccountRequest): Promise<BankAccount> {
    // Check if user already has virtual account
    const existing = await this.prisma.bankAccount.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      return {
        accountNumber: existing.accountNumber,
        accountName: existing.accountName,
        bankName: 'Wema Bank',
        balance: existing.balance,
        status: existing.status,
      };
    }

    // Generate account reference
    const reference = this.generateReference();

    try {
      // Call Wema Bank API to create virtual NUBAN
      const response = await axios.post(
        `${WEMA_BASE_URL}/v1/accounts/virtual`,
        {
          reference,
          bvn: dto.bvn,
          firstname: dto.firstName,
          lastname: dto.lastName,
          phone: dto.phoneNumber,
          email: dto.email,
          webhook_url: `${process.env.API_BASE_URL}/treasury/webhook`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${WEMA_API_KEY}`,
            'X-Api-Signature': this.generateWemaSignature(reference),
          },
        }
      );

      const { account_number, account_name } = response.data.data;

      // Store account in database
      const account = await this.prisma.bankAccount.create({
        data: {
          userId: dto.userId,
          accountNumber: account_number,
          accountName: account_name,
          bankName: 'Wema Bank',
          bankCode: '035',
          balance: 0,
          status: 'active',
          reference,
          bvn: dto.bvn,
        },
      });

      console.log(`Virtual account created: ${account_number} for user ${dto.userId}`);

      return {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankName: 'Wema Bank',
        balance: 0,
        status: 'active',
      };
    } catch (error: any) {
      console.error('Wema Bank API error:', error.response?.data || error.message);
      throw new Error('Failed to create virtual account: ' + error.message);
    }
  }

  /**
   * Handle Wema Bank webhook for incoming transfers
   * Credits user wallet automatically
   */
  async handleWebhook(payload: any): Promise<void> {
    const {
      account_number,
      amount,
      transaction_reference,
      sender_name,
      sender_account,
      sender_bank,
      narration,
      transaction_date,
    } = payload;

    // Find account
    const account = await this.prisma.bankAccount.findUnique({
      where: { accountNumber: account_number },
    });

    if (!account) {
      console.warn(`Webhook received for unknown account: ${account_number}`);
      return;
    }

    // Check for duplicate transaction
    const existingTx = await this.prisma.bankTransaction.findUnique({
      where: { transactionReference: transaction_reference },
    });

    if (existingTx) {
      console.log(`Duplicate transaction ignored: ${transaction_reference}`);
      return;
    }

    // Create transaction record
    const transaction = await this.prisma.bankTransaction.create({
      data: {
        bankAccountId: account.id,
        userId: account.userId,
        type: 'credit',
        amount,
        transactionReference: transaction_reference,
        senderName: sender_name,
        senderAccount: sender_account,
        senderBank: sender_bank,
        narration,
        transactionDate: new Date(transaction_date),
        status: 'completed',
      },
    });

    // Update account balance
    await this.prisma.bankAccount.update({
      where: { id: account.id },
      data: { balance: { increment: amount } },
    });

    // Credit user wallet
    await this.prisma.user.update({
      where: { id: account.userId },
      data: { balance: { increment: amount } },
    });

    console.log(
      `Wallet credited: ₦${amount} for user ${account.userId} (${transaction_reference})`
    );

    // Broadcast balance change via Supabase Realtime (if integrated)
    // await this.broadcastBalanceChange(account.userId, amount);
  }

  /**
   * Get user's bank account details
   */
  async getAccount(userId: string): Promise<BankAccount | null> {
    const account = await this.prisma.bankAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return null;
    }

    return {
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      bankName: account.bankName,
      balance: account.balance,
      status: account.status,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, limit = 50): Promise<any[]> {
    return this.prisma.bankTransaction.findMany({
      where: { userId },
      orderBy: { transactionDate: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        amount: true,
        transactionReference: true,
        senderName: true,
        senderAccount: true,
        senderBank: true,
        narration: true,
        transactionDate: true,
        status: true,
      },
    });
  }

  /**
   * Generate unique reference for account creation
   */
  private generateReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BFZ${timestamp}${random}`.toUpperCase();
  }

  /**
   * Generate HMAC signature for Wema API
   */
  private generateWemaSignature(reference: string): string {
    return createHmac('sha512', WEMA_SECRET_KEY).update(reference).digest('hex');
  }
}
