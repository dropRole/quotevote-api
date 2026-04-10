import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';

export const PassportModuleConfig: IAuthModuleOptions = {
  defaultStrategy: 'jwt',
};

export const JWTModuleAsyncConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_EXPIRE'),
    },
  }),
};
