import { Controller } from '@nestjs/common';
import { Body, Get, Post, Patch } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { GetUser } from './get-user.decorator';
import { Public } from './public.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  signup(@Body() signUpDTO: SignUpDTO): Promise<void> {
    return this.authService.signup(signUpDTO);
  }

  @Public()
  @Get('/signin')
  signin(
    @Body() authCredentialsDTO: AuthCredentialsDTO,
  ): Promise<{ accessToken: string }> {
    return this.authService.signin(authCredentialsDTO);
  }

  @Get('/me')
  getInfo(@GetUser() user: User): User {
    return user;
  }

  @Patch('/me/update-pass')
  updatePass(
    @GetUser() user: User,
    @Body('newpass') newPass: string,
  ): Promise<void> {
    return this.authService.updatePass(user, newPass);
  }
}
