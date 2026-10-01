import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import SignupDTO from './dto/signup.dto';
import AuthCredentialsDTO from './dto/auth-credentials.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  signup(@Body() signupDTO: SignupDTO) {
    return this.authService.signup(signupDTO);
  }

  @Public()
  @Post('/login')
  login(
    @Res({ passthrough: true }) response: Response,
    @Body() authCredentialsDTO: AuthCredentialsDTO,
  ) {
    return this.authService.login(response, authCredentialsDTO);
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('quotevote-jwt');
  }
}
