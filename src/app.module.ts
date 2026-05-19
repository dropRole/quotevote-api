import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [AuthModule, QuotesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
