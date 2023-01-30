import { Controller } from '@nestjs/common';
import { Body, Get, Post } from '@nestjs/common/decorators';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { Public } from './public.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('/signup')
  async signup(@Body() signUpDTO: SignUpDTO): Promise<void> {}

  @Public()
  @Post('/login')
  async login(
    @Body() authCredentials: AuthCredentialsDTO,
  ): Promise<{ accessToken: string }> {
    return { accessToken: '' };
  }

  @Get('/me')
  async getInfo(@Body('username') username: string): Promise<User> {
    return new User();
  }
}
