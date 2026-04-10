import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JWTStrategy } from './strategies/jwt.strategy';
import {
  JWTModuleAsyncConfig,
  PassportModuleConfig,
} from 'src/config/passport-jwt.config';
@Module({
  imports: [
    ConfigModule,
    PassportModule.register(PassportModuleConfig),
    JwtModule.registerAsync(JWTModuleAsyncConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy],
  exports: [JWTStrategy, PassportModule],
})
export class AuthModule {}
