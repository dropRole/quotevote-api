import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
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
import { AuthService } from './auth.service';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';

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

  @Get('/me')
  getInfo(@GetUser() user: User) {
    return user;
  }

  @Public()
  @Get('/me/avatar')
  @Header('Content-Type', 'image/*')
  getAvatar(@Query() getAvatarDTO: GetAvatarDTO) {
    const filePath = join(process.cwd(), path);

    if (!existsSync(filePath))
      throw new NotFoundException('Avatar was not found.');

    const stream = createReadStream(filePath);

    return new StreamableFile(stream);
  }

  @Patch('/me/basics')
  updateBasics(
    @Res({ passthrough: true }) response: Response,
    @GetUser() user: User,
    @Body() basicsUpdateDTO: BasicsUpdateDTO,
  ) {
    return this.authService.updateBasics(response, user, basicsUpdateDTO);
  }

  @Patch('/me/pass')
  updatePass(@GetUser() user: User, @Body() passUpdateDTO: PassUpdateDTO) {
    return this.authService.updatePass(user, passUpdateDTO);
  }

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
      limits: { fileSize: 2000000 },
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
  ) {
    return this.authService.uploadAvatar(user, avatar.filename);
  }

  @Delete('/me/avatar-unlink')
  unlinkAvatar(@GetUser() user: User) {
    return this.authService.unlinkAvatar(user);
  }
}
