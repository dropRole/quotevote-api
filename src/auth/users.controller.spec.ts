import { describe, beforeEach, jest, expect } from '@jest/globals';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import GetAvatarDTO from './dto/get-avatar.dto';
import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  PayloadTooLargeException,
  StreamableFile,
} from '@nestjs/common';
import User from './entities/user.entity';
import BasicsUpdateDTO from './dto/basics-update.dto';
import { getMockRes } from '@jest-mock/express';
import PassUpdateDTO from './dto/pass-update.dto';
import { Readable } from 'stream';

describe('UsersController', () => {
  let controller: UsersController;

  let service: jest.Mocked<UsersService>;

  const { res } = getMockRes();

  const user: User = {
    username: 'johndoe',
    name: 'John',
    surname: 'Doe',
    email: 'johndoe@email.com',
    avatar: null,
    pass: 'johnDoe@26',
    quotes: [],
    votes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService)
          return {
            updateBasics: jest.fn(),
            updatePass: jest.fn(),
            uploadAvatar: jest.fn(),
            unlinkAvatar: jest.fn(),
          };
      })
      .compile();

    controller = module.get<UsersController>(UsersController);

    service = module.get(UsersService);
  });

  describe('getInfo', () => {
    it('should return an object of User type when OK', () => {
      expect(controller.getInfo(user)).toEqual(user);
    });
  });

  describe('getAvatar', () => {
    const getAvatarDTO: GetAvatarDTO = {
      path: `uploads/${randomUUID()}.png`,
    };

    it('should return a StreamableFile instance when OK', () => {
      jest
        .spyOn(controller, 'getAvatar')
        .mockReturnValue(new StreamableFile(new Uint8Array()));

      expect(controller.getAvatar(getAvatarDTO)).toBeInstanceOf(StreamableFile);
    });
  });

  describe('updateBasics', () => {
    const basicsUpdateDTO: BasicsUpdateDTO = {
      name: 'JOHN',
      surname: 'DOE',
      email: 'johnisdoe@email.com',
      username: 'JOHNDOE',
    };

    it('should throw a ConflictException when username already exists', async () => {
      service.updateBasics.mockRejectedValue(
        new ConflictException(`Username ${user.username} already exists.`),
      );

      await expect(
        controller.updateBasics(res, user, basicsUpdateDTO),
      ).rejects.toThrow(ConflictException);
    });

    it('should be undefined when OK', async () => {
      service.updateBasics.mockResolvedValue(undefined);

      await expect(
        controller.updateBasics(res, user, basicsUpdateDTO),
      ).resolves.toBeUndefined();
    });
  });

  describe('updatePass', () => {
    const passUpdateDTO: PassUpdateDTO = {
      currentPass: user.pass,
      newPass: `${user.pass}new`,
    };

    it('should throw a ConflictException when current password is invalid', async () => {
      service.updatePass.mockRejectedValue(
        new ConflictException(`Incorrect password.`),
      );

      await expect(controller.updatePass(user, passUpdateDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should be undefined when OK', async () => {
      service.updatePass.mockResolvedValue(undefined);

      await expect(
        controller.updatePass(user, passUpdateDTO),
      ).resolves.toBeUndefined();
    });
  });

  describe('uploadAvatar', () => {
    const file: Express.Multer.File = {
      fieldname: 'avatar',
      originalname: 'profile_picture.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './uploads/',
      filename: '1710927384912-profile-picture.jpg',
      path: 'uploads/1710927384912-profile-picture.jpg',
      size: 48250,
      buffer: Buffer.from([]),
      stream: new Readable(),
    };

    it('should throw a BadRequestException when file MIME type is not among the supported oness', async () => {
      service.uploadAvatar.mockRejectedValue(
        new BadRequestException(`File is not in PNG, JPEG or WEBP MIME types.`),
      );

      await expect(controller.uploadAvatar(file, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a PayloadTooLargeException when file size exceeds the limits', async () => {
      service.uploadAvatar.mockRejectedValue(
        new PayloadTooLargeException(`File too large.`),
      );

      await expect(controller.uploadAvatar(file, user)).rejects.toThrow(
        PayloadTooLargeException,
      );
    });
  });

  describe('unlinkAvatar', () => {
    it('should be undefined when OK', async () => {
      service.unlinkAvatar.mockResolvedValue(undefined);

      await expect(controller.unlinkAvatar(user)).resolves.toBeUndefined();
    });
  });
});
