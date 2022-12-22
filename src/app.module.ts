import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [AuthModule, QuotesModule, VotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
