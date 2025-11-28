import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WithdrawalService } from './withdrawal.service';

@Processor('withdrawals')
export class WithdrawalProcessor extends WorkerHost {
  private readonly logger = new Logger(WithdrawalProcessor.name);

  constructor(private readonly withdrawalService: WithdrawalService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing withdrawal job ${job.id}`, job.data);

    const { withdrawalId, userId, amount, method, destination } = job.data;

    try {
      // Process withdrawal (checks timer and applies compensation if breached)
      const result = await this.withdrawalService.processWithdrawal(withdrawalId);

      this.logger.log(`Withdrawal ${withdrawalId} processed successfully`, result);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process withdrawal ${withdrawalId}`,
        error.message
      );

      // Mark withdrawal as failed
      throw error;
    }
  }
}
