import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Ledger')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('/export.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="betfuz-ledger.csv"')
  @ApiOperation({ summary: 'Export ledger as CSV' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.ledgerService.exportCsv();
    res.send(csv);
  }

  @Get('/entries')
  @ApiOperation({ summary: 'Get recent ledger entries' })
  async getEntries() {
    return this.ledgerService.getRecentEntries();
  }

  @Get('/:betSlipId')
  @ApiOperation({ summary: 'Get ledger entry by bet ID' })
  async getEntry(@Param('betSlipId') betSlipId: string) {
    const entry = await this.ledgerService.getLedgerEntry(betSlipId);

    if (!entry) {
      return { message: 'Bet not found in ledger' };
    }

    return entry;
  }
}
