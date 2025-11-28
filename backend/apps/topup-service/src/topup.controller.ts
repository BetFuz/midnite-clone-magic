import { Controller, Post, Get, Body, Query, Headers, Req, UnauthorizedException } from '@nestjs/common';
import { TopupService } from './topup.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { createHash } from 'crypto';

@ApiTags('Topup')
@Controller('topup')
export class TopupController {
  constructor(private readonly topupService: TopupService) {}

  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase airtime or data (idempotent)' })
  async createTopup(
    @Body()
    body: {
      phone: string;
      carrier: 'mtn' | 'airtel' | 'glo' | '9mobile';
      amount: number;
      type: 'airtime' | 'data';
    },
    @Headers('authorization') auth: string
  ) {
    // Extract user ID from JWT (implement proper JWT validation)
    const userId = this.extractUserId(auth);

    return this.topupService.createTopup(body, userId);
  }

  @Post('/webhook')
  @ApiOperation({ summary: 'Selcom webhook endpoint (< 5 min confirmation)' })
  async handleWebhook(@Body() payload: any, @Headers('x-selcom-signature') signature: string) {
    // Verify webhook signature
    const isValid = this.verifySelcomSignature(payload, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.topupService.handleWebhook(payload);

    return { status: 'received' };
  }

  @Get('/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get topup history' })
  async getHistory(
    @Query('limit') limit: string,
    @Headers('authorization') auth: string
  ) {
    const userId = this.extractUserId(auth);
    const limitNum = parseInt(limit) || 50;

    return this.topupService.getHistory(userId, limitNum);
  }

  private extractUserId(auth: string): string {
    // TODO: Implement proper JWT validation
    // For now, extract from Bearer token
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    // Mock user ID extraction
    return 'user-id-from-jwt';
  }

  private verifySelcomSignature(payload: any, signature: string): boolean {
    const secret = process.env.SELCOM_API_SECRET || '';
    const data = JSON.stringify(payload);
    const expected = createHash('sha256')
      .update(data + secret)
      .digest('hex');

    return signature === expected;
  }
}
