import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';

@ApiTags('Affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('commission')
  @ApiOperation({ summary: 'Calculate commission for affiliate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        affiliateId: { type: 'string', example: 'uuid-here' },
        revenueAmount: { type: 'number', example: 10000 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Commission calculated successfully',
    schema: {
      type: 'object',
      properties: {
        baseCommission: { type: 'number' },
        overrideCommission: { type: 'number' },
        totalCommission: { type: 'number' },
        tier: { type: 'string', enum: ['BRONZE', 'SILVER', 'GOLD'] },
        dailySalaryEligible: { type: 'boolean' },
      },
    },
  })
  async calculateCommission(
    @Body() body: { affiliateId: string; revenueAmount: number },
  ) {
    return this.affiliateService.calculateCommission(
      body.affiliateId,
      body.revenueAmount,
    );
  }

  @Get('tree/:affiliateId')
  @ApiOperation({ summary: 'Get affiliate tree (depth 3) for D3 visualization' })
  @ApiParam({ name: 'affiliateId', type: 'string', example: 'uuid-here' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate tree retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        tier: { type: 'string', enum: ['BRONZE', 'SILVER', 'GOLD'] },
        code: { type: 'string' },
        activeReferrals: { type: 'number' },
        commission: { type: 'number' },
        conversions: { type: 'number' },
        isActive: { type: 'boolean' },
        children: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  async getAffiliateTree(@Param('affiliateId') affiliateId: string) {
    return this.affiliateService.getAffiliateTree(affiliateId, 3);
  }

  @Post('upgrade/:affiliateId')
  @ApiOperation({ summary: 'Upgrade affiliate tier based on performance' })
  @ApiParam({ name: 'affiliateId', type: 'string', example: 'uuid-here' })
  @ApiResponse({
    status: 200,
    description: 'Tier upgrade processed',
    schema: {
      type: 'object',
      properties: {
        tier: { type: 'string', enum: ['BRONZE', 'SILVER', 'GOLD'] },
      },
    },
  })
  async upgradeTier(@Param('affiliateId') affiliateId: string) {
    const tier = await this.affiliateService.upgradeTier(affiliateId);
    return { tier };
  }
}
