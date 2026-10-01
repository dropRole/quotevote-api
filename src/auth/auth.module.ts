import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import JWT_CONFIG from 'src/config/auth/jwt.config';
import { JWTStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync(JWT_CONFIG),
    LoggerModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JWTStrategy],
})
export class AuthModule {}
