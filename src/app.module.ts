import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { QuotingModule } from './quoting/quoting.module';
import { ConfigModule } from '@nestjs/config';
import ENV_CONFIG from './config/env/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import TYPEORM_CONFIG from './config/typeorm/typeorm.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JWTGuard } from './auth/guards/jwt.guard';

@Module({
  imports: [
    AuthModule,
    QuotingModule,
    ConfigModule.forRoot(ENV_CONFIG),
    TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
