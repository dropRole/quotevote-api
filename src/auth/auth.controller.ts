import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import SignupDTO from './dto/signup.dto';
import AuthCredentialsDTO from './dto/auth-credentials.dto';
import GetUser from '../common/decorators/get-user.decorator';
import User from './entities/user.entity';
import BasicsUpdateDTO from './dto/basics-update.dto';
import PassUpdateDTO from './dto/pass-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import * as path from 'path';
import GetAvatarDTO from './dto/get-avatar.dto';

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

  @Get('/me')
  getInfo(@GetUser() user: User) {}

  @Public()
  @Get('/me/avatar')
  @Header('Content-Type', 'image/*')
  getAvatar(@Query() getAvatarDTO: GetAvatarDTO) {}

  @Patch('/me/basics')
  updateBasics(
    @Res({ passthrough: true }) response: Response,
    @GetUser() user: User,
    @Body() basicsUpdateDTO: BasicsUpdateDTO,
  ) {}

  @Patch('/me/pass')
  updatePass(@GetUser() user: User, @Body() passUpdateDTO: PassUpdateDTO) {}

  @Patch('/me/avatar-upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      fileFilter(_req, file, callback) {
        if (!/^image\/(png|jpeg|webp)$/.test(file.mimetype))
          return callback(
            new BadRequestException(
              'File is not in PNG, JPEG or WEBP MIME types.',
            ),
            false,
          );

        callback(null, true);
      },
      limits: { fileSize: 15000 },
      storage: diskStorage({
        destination: './uploads',
        filename(_req, file, callback) {
          const ext = path
            .extname(file.originalname)
            .replace(/[^.a-z0-9]/gi, '');

          callback(null, `${randomUUID() + ext}`);
        },
      }),
    }),
  )
  uploadAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @GetUser() user: User,
  ) {}

  @Delete('/me/avatar-unlink')
  unlinkAvatar(@GetUser() user: User) {}
}
