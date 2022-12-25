import { Controller } from '@nestjs/common';
import { Body, Get, Post } from '@nestjs/common/decorators';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { SignUpDTO } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  @Post('/signup')
  async signup(@Body() signUpDTO: SignUpDTO): Promise<void> {}

  @Get('/signin')
  async signin(
    @Body() authCredentials: AuthCredentialsDTO,
  ): Promise<{ accessToken: string }> {
    return { accessToken: '' }
  }
}
