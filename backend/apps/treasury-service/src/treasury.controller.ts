import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Treasury')
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Post('/accounts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create virtual NUBAN on BVN link' })
  async createAccount(
    @Body()
    body: {
      bvn: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
    },
    @Headers('authorization') auth: string
  ) {
    const userId = this.extractUserId(auth);

    return this.treasuryService.createVirtualAccount({ userId, ...body });
  }

  @Get('/accounts/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personal bank account details' })
  async getAccount(@Headers('authorization') auth: string) {
    const userId = this.extractUserId(auth);

    const account = await this.treasuryService.getAccount(userId);

    if (!account) {
      return { message: 'No bank account found. Please create one first.' };
    }

    return account;
  }

  @Get('/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(@Headers('authorization') auth: string) {
    const userId = this.extractUserId(auth);

    return this.treasuryService.getTransactions(userId);
  }

  @Post('/webhook')
  @ApiOperation({ summary: 'Wema Bank webhook for incoming transfers' })
  async handleWebhook(@Body() payload: any, @Headers('x-wema-signature') signature: string) {
    // Verify webhook signature
    const isValid = this.verifyWemaSignature(payload, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.treasuryService.handleWebhook(payload);

    return { status: 'received' };
  }

  private extractUserId(auth: string): string {
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    // TODO: Implement proper JWT validation
    return 'user-id-from-jwt';
  }

  private verifyWemaSignature(payload: any, signature: string): boolean {
    const secret = process.env.WEMA_SECRET_KEY || '';
    const data = JSON.stringify(payload);
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha512', secret).update(data).digest('hex');

    return signature === expected;
  }
}
