import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

export type JWTPayload = {
  username: string;
};

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies['quotevote-jwt'],
      ]),
    });
  }

  async validate(jwtPayload: JWTPayload) {
    const { username } = jwtPayload;

    return this.authService.validateUser(username);
  }
}
