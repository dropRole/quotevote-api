import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { generateKeySync } from 'crypto';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { User } from './user.entity';
import {
  ConflictException,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AuthService } from './auth.service';
import { BasicsUpdateDTO } from './dto/basics-update-dto';
import { PassUpdateDTO } from './dto/pass-update.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const users: User[] = [];

  const user: User = new User();
  user.email = 'phil.collins@gmail.com';
  user.name = 'Phil';
  user.surname = 'Collins';
  user.username = 'philcollins';
  user.pass = 'philCollins@23';
  user.avatar = 'uploads/1676601431847_avataaars.png';
  user.quotes = [];
  user.votes = [];

  const user1 = new User();
  user1.email = 'john.kroeger@gmail.com';
  user1.name = 'John';
  user1.surname = 'Kroeger';
  user1.username = 'johnkroeger';
  user1.pass = 'johnKroeger@23';
  user1.avatar = null;
  user1.quotes = [];
  user1.votes = [];

  users.push(user);
  users.push(user1);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService)
          return {
            signup: jest.fn(),
            login: jest
              .fn()
              .mockResolvedValue(
                generateKeySync('aes', { length: 128 }).export().toString(),
              ),
            getInfo: jest.fn().mockResolvedValue(users[0]),
            updateBasics: jest
              .fn()
              .mockResolvedValue(
                generateKeySync('aes', { length: 128 }).export().toString(),
              ),
            updatePass: jest.fn(),
            uploadAvatar: jest.fn().mockResolvedValue(users[0].avatar),
            unlinkAvatar: jest.fn(),
          };
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should be void', async () => {
      const signUpDTO = new SignUpDTO();
      signUpDTO.email = 'john.doe@gmail.com';
      signUpDTO.name = 'john';
      signUpDTO.surname = 'doe';
      signUpDTO.username = 'johndoe';
      signUpDTO.pass = 'johnDoe@23';

      const result = await controller.signup(signUpDTO);
      expect(typeof result).toBe('undefined');
    });

    it('should throw a ConflictException', async () => {
      const signUpDTO: SignUpDTO = users[0];

      jest.spyOn(service, 'signup').mockImplementation((): Promise<void> => {
        if (users.find((user) => user.username === signUpDTO.username))
          throw new ConflictException('Username already exists.');
        return new Promise((resolve) => {});
      });

      expect(service.signup).toThrow('Username already exists.');
    });
  });

  describe('login', () => {
    const authCredentialsDTO = new AuthCredentialsDTO();
    authCredentialsDTO.username = users[0].username;
    authCredentialsDTO.pass = users[0].pass;

    it('should return a token string', async () => {
      const result = await controller.login(authCredentialsDTO);
      expect(typeof result).toBe('string');
    });

    it('should throw a UnauthorizedException', async () => {
      jest
        .spyOn(service, 'login')
        .mockImplementation((): Promise<{ accessToken: string }> => {
          if (
            !users.findIndex(
              (user) =>
                user.username === authCredentialsDTO.username &&
                user.pass === authCredentialsDTO.pass,
            )
          )
            throw new UnauthorizedException('Check your credentials.');
          return new Promise((resolve) =>
            resolve({
              accessToken: generateKeySync('aes', { length: 128 })
                .export()
                .toString(),
            }),
          );
        });
      expect(service.login).toThrow('Check your credentials.');
    });
  });

  describe('getInfo', () => {
    it('should return user basic info', async () => {
      const result = controller.getInfo(
        users.find((user) => user.username === 'johnkroeger'),
      );
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('getAvatar', () => {
    it('should return a readable stream an avatar', async () => {
      const result = controller.getAvatar(users[0].avatar);
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('updateBasics', () => {
    const basicsUpdateDTO: BasicsUpdateDTO = users[0];

    it('should return a token string', async () => {
      const result = await controller.updateBasics(users[0], basicsUpdateDTO);
      expect(typeof result).toBe('string');
    });

    it('should throw a ConflictException', async () => {
      jest
        .spyOn(service, 'updateBasics')
        .mockImplementation((): Promise<{ accessToken: string }> => {
          if (users.find((user) => user.username === basicsUpdateDTO.username))
            throw new ConflictException('Username already exists.');
          return new Promise((resolve) =>
            resolve({
              accessToken: generateKeySync('aes', { length: 128 })
                .export()
                .toString(),
            }),
          );
        });

      expect(service.updateBasics).toThrow('Username already exists.');
    });
  });

  describe('updatePass', () => {
    const passUpdateDTO: PassUpdateDTO = new PassUpdateDTO();
    passUpdateDTO.passCurrent = 'philcollins@23';
    passUpdateDTO.pass = 'genesIs@24';

    it('should be void', async () => {
      const result = await controller.updatePass(users[0], passUpdateDTO);
      expect(typeof result).toBe('undefined');
    });

    it('should throw a ConflictException', async () => {
      jest
        .spyOn(service, 'updatePass')
        .mockImplementation((): Promise<void> => {
          const user: User = users.find(
            (user) => user.username === 'philcollins',
          );

          if (user.pass !== passUpdateDTO.passCurrent)
            throw new ConflictException('Incorect password.');
          return new Promise((resolve) => {});
        });

      expect(service.updatePass).toThrow('Incorect password.');
    });
  });

  describe('uploadAvatar', () => {
    it('should return the avatar path', async () => {
      const file: Express.Multer.File = {
        destination: './uplaods',
        fieldname: 'avatar',
        filename: '1676601431847_avataaars.png',
        originalname: '1676601431847_avataaars.png',
        size: 2048,
        mimetype: 'image/png',
        path: join(process.cwd(), users[0].avatar),
        stream: createReadStream(join(process.cwd(), users[0].avatar)),
        buffer: Buffer.alloc(2048),
        encoding: 'utf-9',
      };

      const result = await controller.uploadAvatar(file, users[0]);
      expect(typeof result).toBe('string');
    });

    it('should throw a ConflictException', async () => {
      jest
        .spyOn(service, 'uploadAvatar')
        .mockImplementation((): Promise<{ path: string }> => {
          const user: User = users.find(
            (user) => user.username === 'philcollins',
          );

          if (user.avatar)
            throw new ConflictException('Avatar was already uploaded.');
          return new Promise((resolve) => {});
        });

      expect(service.uploadAvatar).toThrow('Avatar was already uploaded.');
    });
  });

  describe('unlinkAvatar', () => {
    it('should be void', async () => {
      const result = await controller.unlinkAvatar(users[0]);
      expect(typeof result).toBe('undefined');
    });
  });
});
