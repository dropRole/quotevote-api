import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';
import ENV_CONFIG from './config/env/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import TYPEORM_CONFIG from './config/typeorm/typeorm.config';

@Module({
  imports: [
    AuthModule,
    QuotesModule,
    ConfigModule.forRoot(ENV_CONFIG),
    TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
