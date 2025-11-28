import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from './prisma.service';
import { firstValueFrom } from 'rxjs';

export interface NlrcLicenceResponse {
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  licenceNumber: string;
  expiryDate: string;
  operatorName: string;
  issuedDate: string;
}

@Injectable()
export class NlrcVerifierService {
  private readonly logger = new Logger(NlrcVerifierService.name);
  private readonly nlrcApiUrl = process.env.NLRC_API_URL || 'https://api.nlrc.gov.ng/v1/verify';
  private readonly licenceNumber = process.env.NLRC_LICENCE_NUMBER;
  private readonly apiKey = process.env.NLRC_API_KEY;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Cron job that runs every hour to verify NLRC licence status
   */
  @Cron(CronExpression.EVERY_HOUR)
  async verifyLicence(): Promise<void> {
    this.logger.log('Starting NLRC licence verification...');

    if (!this.licenceNumber || !this.apiKey) {
      this.logger.error('NLRC_LICENCE_NUMBER or NLRC_API_KEY not configured');
      await this.updateLicenceStatus('UNKNOWN', null, 'Configuration missing');
      return;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<NlrcLicenceResponse>(this.nlrcApiUrl, {
          params: { licence: this.licenceNumber },
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        })
      );

      const { status, licenceNumber, expiryDate } = response.data;

      this.logger.log(`NLRC Licence Status: ${status}`);
      this.logger.log(`Expiry Date: ${expiryDate}`);

      await this.updateLicenceStatus(
        status,
        new Date(expiryDate),
        null,
        response.data
      );

      if (status !== 'ACTIVE') {
        this.logger.warn(
          `⚠️ NLRC Licence is ${status} - Bet placement will be blocked!`
        );
      }
    } catch (error) {
      this.logger.error('Failed to verify NLRC licence', error.message);
      await this.updateLicenceStatus(
        'UNKNOWN',
        null,
        error.message || 'Verification failed'
      );
    }
  }

  /**
   * Update licence status in database
   */
  private async updateLicenceStatus(
    status: string,
    expiryDate: Date | null,
    errorMessage: string | null,
    responseData?: any
  ): Promise<void> {
    try {
      await this.prisma.nlrcLicence.create({
        data: {
          status: status as any,
          licenceNumber: this.licenceNumber || 'UNKNOWN',
          expiryDate: expiryDate || new Date(),
          lastChecked: new Date(),
          responseData: responseData || null,
          errorMessage,
        },
      });

      this.logger.log('Licence status updated in database');
    } catch (error) {
      this.logger.error('Failed to update licence status in database', error);
    }
  }

  /**
   * Get current licence status from database
   */
  async getCurrentLicenceStatus(): Promise<{
    status: string;
    isValid: boolean;
    lastChecked: Date;
    expiryDate: Date | null;
    errorMessage: string | null;
  }> {
    const latestLicence = await this.prisma.nlrcLicence.findFirst({
      orderBy: { lastChecked: 'desc' },
    });

    if (!latestLicence) {
      return {
        status: 'UNKNOWN',
        isValid: false,
        lastChecked: new Date(),
        expiryDate: null,
        errorMessage: 'No licence verification data available',
      };
    }

    return {
      status: latestLicence.status,
      isValid: latestLicence.status === 'ACTIVE',
      lastChecked: latestLicence.lastChecked,
      expiryDate: latestLicence.expiryDate,
      errorMessage: latestLicence.errorMessage,
    };
  }

  /**
   * Check if betting is allowed based on licence status
   */
  async isBettingAllowed(): Promise<boolean> {
    const licenceStatus = await this.getCurrentLicenceStatus();
    return licenceStatus.isValid;
  }
}
