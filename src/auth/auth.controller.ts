import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Body, Get, Post, Patch } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
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

  @Patch('/me/avatar-upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename(_req, file, callback) {
          callback(
            null,
            `${new Date().getMilliseconds()}_${file.originalname}`,
          );
        },
      }),
    }),
  )
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15000 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    avatar: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<void> {
    return this.authService.uploadAvatar(user, avatar.filename);
  }

  @Patch('/me/avatar-unlink')
  unlinkAvatar(@GetUser() user: User): Promise<void> {
    return this.authService.unlinkAvatar(user)
  }
}
