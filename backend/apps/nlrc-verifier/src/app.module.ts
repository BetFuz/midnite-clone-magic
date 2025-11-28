import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { NlrcVerifierService } from './nlrc-verifier.service';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { BetGuard } from './guards/bet.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [HealthController],
  providers: [NlrcVerifierService, PrismaService, BetGuard],
  exports: [NlrcVerifierService, BetGuard],
})
export class AppModule {}
