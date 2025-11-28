import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BonusService } from './bonus.service';

class CreateBonusDto {
  userId: string;
  depositAmount: number;
  tronAddress?: string;
}

class ReleaseBonusDto {
  bonusId: string;
  userId: string;
}

@ApiTags('Bonus')
@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Post('create')
  @ApiOperation({ 
    summary: 'Create 300% first deposit bonus',
    description: '50% USDT (0x rollover - instant) + 50% NGN (5x rollover, min odds 1.5)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Bonus created and USDT released instantly',
    schema: {
      example: {
        id: 'bonus-uuid',
        userId: 'user-uuid',
        depositAmount: 10000,
        usdtBonus: 15000,
        ngnBonus: 15000,
        usdtReleased: true,
        ngnLocked: true,
        rolloverRequired: 75000,
        rolloverProgress: 0,
        minOdds: 1.5,
        status: 'USDT_RELEASED',
        createdAt: '2025-01-28T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - user already has bonus' })
  async createBonus(@Body() dto: CreateBonusDto) {
    return await this.bonusService.createBonus(dto);
  }

  @Post('release')
  @ApiOperation({ 
    summary: 'Release NGN bonus portion',
    description: 'Release NGN bonus after 5x rollover requirements met (min odds 1.5)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'NGN bonus released successfully',
    schema: {
      example: {
        success: true,
        message: 'NGN bonus released successfully',
        amount: 15000
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Rollover requirements not met' })
  @ApiResponse({ status: 404, description: 'Bonus not found' })
  async releaseBonus(@Body() dto: ReleaseBonusDto) {
    return await this.bonusService.releaseNgnBonus(dto.bonusId, dto.userId);
  }

  @Get(':userId')
  @ApiOperation({ 
    summary: 'Get bonus details',
    description: 'Get current bonus status and rollover progress'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bonus details retrieved',
    schema: {
      example: {
        id: 'bonus-uuid',
        userId: 'user-uuid',
        depositAmount: 10000,
        usdtBonus: 15000,
        ngnBonus: 15000,
        usdtReleased: true,
        ngnLocked: true,
        rolloverRequired: 75000,
        rolloverProgress: 25000,
        rolloverPercentage: 33.33,
        minOdds: 1.5,
        status: 'USDT_RELEASED'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Bonus not found' })
  async getBonusDetails(@Param('userId') userId: string) {
    return await this.bonusService.getBonusDetails(userId);
  }
}
