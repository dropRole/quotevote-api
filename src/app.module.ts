import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMAsyncConfig } from './config/typeorm/typeorm.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JWTGuard } from './common/guards/jwt.guard';

@Module({
  imports: [
    AuthModule,
    QuotesModule,
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync(TypeORMAsyncConfig),
  ],
  providers: [
    { provide: APP_GUARD, useClass: JWTGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
