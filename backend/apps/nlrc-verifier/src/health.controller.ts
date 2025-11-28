import { Controller, Get } from '@nestjs/common';
import { NlrcVerifierService } from './nlrc-verifier.service';

@Controller('health')
export class HealthController {
  constructor(private readonly nlrcVerifier: NlrcVerifierService) {}

  @Get('licence')
  async checkLicence() {
    const status = await this.nlrcVerifier.getCurrentLicenceStatus();
    
    return {
      service: 'nlrc-licence-verifier',
      timestamp: new Date().toISOString(),
      licence: {
        status: status.status,
        isValid: status.isValid,
        lastChecked: status.lastChecked,
        expiryDate: status.expiryDate,
        errorMessage: status.errorMessage,
        bettingAllowed: status.isValid,
      },
    };
  }

  @Get()
  async healthCheck() {
    const bettingAllowed = await this.nlrcVerifier.isBettingAllowed();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      bettingAllowed,
    };
  }
}
