import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMAsyncConfig } from './config/typeorm.config';
import { APP_GUARD } from '@nestjs/core';
import { JWTGuard } from './auth/jwt.guard';

@Module({
  imports: [
    AuthModule,
    QuotesModule,
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync(TypeORMAsyncConfig),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JWTGuard }],
})
export class AppModule {}
