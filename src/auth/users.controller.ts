import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Patch,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import GetUser from 'src/common/decorators/get-user.decorator';
import User from './entities/user.entity';
import { Public } from './decorators/public.decorator';
import GetAvatarDTO from './dto/get-avatar.dto';
import { Response } from 'express';
import BasicsUpdateDTO from './dto/basics-update.dto';
import PassUpdateDTO from './dto/pass-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Controller('users')
export class UsersController {
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
          const ext = extname(file.originalname).replace(/[^.a-z0-9]/gi, '');

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
