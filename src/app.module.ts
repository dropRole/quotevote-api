import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.config';

@Module({
  imports: [AuthModule, QuotesModule, ConfigModule.forRoot(EnvConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
