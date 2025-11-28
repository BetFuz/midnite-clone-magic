import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalService } from './withdrawal.service';

class CreateWithdrawalDto {
  userId: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'USDT_TRC20' | 'CRYPTO' | 'MOBILE_MONEY';
  destination: string;
}

@ApiTags('Withdrawal')
@Controller('withdraw')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create withdrawal request',
    description: '60-second timer starts. If breached, auto-credit ₦1,000 compensation and emit withdrawal.late event'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Withdrawal request created with 60s timer',
    schema: {
      example: {
        id: 'withdrawal-uuid',
        userId: 'user-uuid',
        amount: 50000,
        method: 'BANK_TRANSFER',
        destination: '1234567890',
        status: 'PENDING',
        requestedAt: '2025-01-28T10:00:00Z',
        timerStarted: '2025-01-28T10:00:00Z',
        timerExpiresAt: '2025-01-28T10:01:00Z',
        reference: 'WD-1738000000-ABC123'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createWithdrawal(@Body() dto: CreateWithdrawalDto) {
    return await this.withdrawalService.createWithdrawal(dto);
  }

  @Post(':withdrawalId/cancel')
  @ApiOperation({ 
    summary: 'Cancel withdrawal',
    description: 'Cancel pending withdrawal and refund amount to user balance'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Withdrawal cancelled and refunded',
    schema: {
      example: {
        success: true,
        message: 'Withdrawal cancelled and refunded',
        withdrawal: {
          id: 'withdrawal-uuid',
          status: 'CANCELLED',
          amount: 50000
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Withdrawal cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Withdrawal not found' })
  async cancelWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @Body('userId') userId: string
  ) {
    return await this.withdrawalService.cancelWithdrawal(withdrawalId, userId);
  }

  @Get(':userId/history')
  @ApiOperation({ 
    summary: 'Get withdrawal history',
    description: 'Get user withdrawal history with compensation details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Withdrawal history retrieved',
    schema: {
      example: [
        {
          id: 'withdrawal-uuid-1',
          amount: 50000,
          method: 'BANK_TRANSFER',
          status: 'COMPLETED',
          requestedAt: '2025-01-28T10:00:00Z',
          processedAt: '2025-01-28T10:00:45Z',
          timerExpired: false,
          compensationPaid: false
        },
        {
          id: 'withdrawal-uuid-2',
          amount: 30000,
          method: 'USDT_TRC20',
          status: 'COMPENSATED',
          requestedAt: '2025-01-27T15:00:00Z',
          processedAt: '2025-01-27T15:01:15Z',
          timerExpired: true,
          compensationPaid: true,
          compensationAmount: 1000
        }
      ]
    }
  })
  async getWithdrawalHistory(@Param('userId') userId: string) {
    return await this.withdrawalService.getWithdrawalHistory(userId);
  }

  @Get(':withdrawalId/:userId')
  @ApiOperation({ 
    summary: 'Get withdrawal details',
    description: 'Get specific withdrawal details including timer status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Withdrawal details retrieved',
    schema: {
      example: {
        id: 'withdrawal-uuid',
        userId: 'user-uuid',
        amount: 50000,
        method: 'BANK_TRANSFER',
        destination: '1234567890',
        status: 'COMPENSATED',
        requestedAt: '2025-01-28T10:00:00Z',
        processedAt: '2025-01-28T10:01:15Z',
        timerStarted: '2025-01-28T10:00:00Z',
        timerExpired: true,
        compensationPaid: true,
        compensationAmount: 1000,
        reference: 'WD-1738000000-ABC123'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Withdrawal not found' })
  async getWithdrawalDetails(
    @Param('withdrawalId') withdrawalId: string,
    @Param('userId') userId: string
  ) {
    return await this.withdrawalService.getWithdrawalDetails(withdrawalId, userId);
  }
}
