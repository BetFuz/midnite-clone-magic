import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { NlrcVerifierService } from '../nlrc-verifier.service';

/**
 * Guard to block bet placement when NLRC licence is invalid
 * Apply this to bet placement endpoints in API Gateway
 */
@Injectable()
export class BetGuard implements CanActivate {
  constructor(private readonly nlrcVerifier: NlrcVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isBettingAllowed = await this.nlrcVerifier.isBettingAllowed();

    if (!isBettingAllowed) {
      const licenceStatus = await this.nlrcVerifier.getCurrentLicenceStatus();
      throw new ForbiddenException({
        message: 'Bet placement is currently unavailable',
        reason: `NLRC licence is ${licenceStatus.status}`,
        licenceStatus: licenceStatus.status,
        lastChecked: licenceStatus.lastChecked,
      });
    }

    return true;
  }
}
