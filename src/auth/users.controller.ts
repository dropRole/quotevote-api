import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Patch,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import GetUser from '../common/decorators/get-user.decorator';
import User from './entities/user.entity';
import { Public } from './decorators/public.decorator';
import GetAvatarDTO from './dto/get-avatar.dto';
import { Response } from 'express';
import BasicsUpdateDTO from './dto/basics-update.dto';
import PassUpdateDTO from './dto/pass-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UsersService } from './users.service';
import { createReadStream, existsSync } from 'fs';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/me')
  getInfo(@GetUser() user: User) {
    return user;
  }

  @Public()
  @Get('/me/avatar')
  @Header('Content-Type', 'image/*')
  getAvatar(@Query() getAvatarDTO: GetAvatarDTO) {
    const { path } = getAvatarDTO;

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
    return this.usersService.updateBasics(response, user, basicsUpdateDTO);
  }

  @Patch('/me/pass')
  updatePass(@GetUser() user: User, @Body() passUpdateDTO: PassUpdateDTO) {
    return this.usersService.updatePass(user, passUpdateDTO);
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
      limits: { fileSize: 150000 },
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
  ) {
    return this.usersService.uploadAvatar(user, avatar.filename);
  }

  @Delete('/me/avatar-unlink')
  unlinkAvatar(@GetUser() user: User) {
    return this.usersService.unlinkAvatar(user);
  }
}
