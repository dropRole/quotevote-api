import { Body, Controller, Post, Res } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import SignupDTO from './dto/signup.dto';
import AuthCredentialsDTO from './dto/auth-credentials.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('/signup')
  signup(@Body() signUpDTO: SignupDTO) {}

  @Public()
  @Post('/login')
  login(
    @Res({ passthrough: true }) response: Response,
    @Body() authCredentialsDTO: AuthCredentialsDTO,
  ) {}

  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response) {}
}
