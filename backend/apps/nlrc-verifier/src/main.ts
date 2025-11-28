import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NlrcVerifier');
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  const port = process.env.NLRC_VERIFIER_PORT || 3003;
  await app.listen(port);
  
  logger.log(`🚀 NLRC Licence Verifier running on: http://localhost:${port}/api`);
  logger.log(`📊 Health check available at: http://localhost:${port}/api/health/licence`);
}

bootstrap();
