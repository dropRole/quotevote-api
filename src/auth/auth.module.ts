import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JWTStrategy } from './strategies/jwt.strategy';
import {
  JWTModuleAsyncConfig,
  PassportModuleConfig,
} from 'src/config/passport-jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JWTGuard } from 'src/common/guards/jwt.guard';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register(PassportModuleConfig),
    JwtModule.registerAsync(JWTModuleAsyncConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTStrategy,
    { provide: APP_GUARD, useClass: JWTGuard },
  ],
})
export class AuthModule {}
