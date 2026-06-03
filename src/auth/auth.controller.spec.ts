import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import User from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import SignupDTO from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import AuthCredentialsDTO from './dto/auth-credentials.dto';
import { Response } from 'express';
import BasicsUpdateDTO from './dto/basics-update.dto';
import PassUpdateDTO from './dto/pass-update.dto';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import GetAvatarDTO from './dto/get-avatar.dto';

let mockUserRepo: User[] = [
  {
    username: 'johndoe',
    name: 'John',
    surname: 'Doe',
    email: 'johndoe@email.com',
    pass: bcrypt.hashSync('johnDoe@26', bcrypt.genSaltSync()),
    avatar: null,
    quotes: [],
    votes: [],
  },
  {
    username: 'janedoe',
    name: 'Jane',
    surname: 'Doe',
    email: 'janedoe@email.com',
    pass: bcrypt.hashSync('janeDow@26', bcrypt.genSaltSync()),
    avatar: null,
    quotes: [],
    votes: [],
  },
];

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService)
          return {
            signup: jest.fn((signupDTO: SignupDTO) => {
              const { email, name, surname, username, pass } = signupDTO;

              const usernameExists = mockUserRepo.find(
                (user) => user.username === username,
              );

              if (usernameExists)
                throw new ConflictException(
                  `Username ${username} already exists.`,
                );

              const salt = bcrypt.genSaltSync();

              const hash = bcrypt.hashSync(pass, salt);

              const newUser: User = {
                username,
                name,
                surname,
                email,
                pass: hash,
                avatar: null,
                quotes: [],
                votes: [],
              };

              mockUserRepo.push(newUser);
            }),
            login: jest.fn(
              (_response: Response, authCredentialsDTO: AuthCredentialsDTO) => {
                const { username, pass } = authCredentialsDTO;

                const user = mockUserRepo.find(
                  (user) => user.username === username,
                );

                if (!user)
                  throw new NotFoundException(`User ${username} not found.`);

                const isValidPass = bcrypt.compareSync(pass, user.pass);

                if (!isValidPass)
                  throw new ConflictException('Check your credentials.');
              },
            ),
            getAvatar: jest.fn((getAvatarDTO: GetAvatarDTO) => {
              const { path } = getAvatarDTO;

              if (!existsSync(path))
                throw new NotFoundException('Avatar was not found.');
            }),
            updateBasics: jest.fn(
              (
                _response: Response,
                user: User,
                basicsUpdateDTO: BasicsUpdateDTO,
              ) => {
                const { email, name, surname, username } = basicsUpdateDTO;

                const usernameExists = mockUserRepo.find(
                  (user) => user.username === username,
                );

                if (usernameExists)
                  throw new ConflictException(
                    `Username ${username} already exists.`,
                  );

                mockUserRepo = mockUserRepo.map((mockUser) => {
                  if (mockUser.username === user.username)
                    mockUser = { ...mockUser, email, name, surname, username };

                  return mockUser;
                });
              },
            ),
            updatePass: jest.fn((user: User, passUpdateDTO: PassUpdateDTO) => {
              const { currentPass, newPass } = passUpdateDTO;

              const isValidPass = bcrypt.compareSync(currentPass, user.pass);

              if (!isValidPass)
                throw new ConflictException('Incorrect password.');

              const salt = bcrypt.genSaltSync();

              const hash = bcrypt.hashSync(newPass, salt);

              mockUserRepo = mockUserRepo.map((mockUser) => {
                if (mockUser.username === user.username)
                  mockUser = { ...mockUser, pass: hash };

                return mockUser;
              });
            }),
            uploadAvatar: jest.fn((user: User, filename: string) => {
              mockUserRepo = mockUserRepo.map((mockUser) => {
                if (mockUser.username === user.username)
                  mockUser = { ...mockUser, avatar: `uploads/${filename}` };

                return mockUser;
              });

              return { path: `uploads/${filename}` };
            }),
            unlinkAvatar: jest.fn((user: User) => {
              mockUserRepo = mockUserRepo.map((mockUser) => {
                if (mockUser.username === user.username)
                  mockUser = { ...mockUser, avatar: null };

                return mockUser;
              });
            }),
          };
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should return the logged in user', () => {
      const signupDTO: SignupDTO = {
        email: 'babydoe@email.com',
        name: 'Baby',
        surname: 'Doe',
        username: 'babydoe',
        pass: 'babyDoe@26',
      };

      expect(controller.signup(signupDTO)).toBe(undefined);
    });

    it('should throw a conflict exception', () => {
      expect(() => controller.signup(mockUserRepo[0])).toThrow(
        `Username ${mockUserRepo[0].username} already exists.`,
      );
    });
  });

  describe('login', () => {
    const response: Response = {} as unknown as Response;

    it('should throw a not found exception', () => {
      const authCredentialsDTO: AuthCredentialsDTO = {
        username: 'johnslow',
        pass: 'johnSlow@26',
      };

      expect(() => controller.login(response, authCredentialsDTO)).toThrow(
        `User ${authCredentialsDTO.username} not found.`,
      );
    });

    it('should throw a conflict exception', () => {
      const authCredentialsDTO: AuthCredentialsDTO = {
        username: 'johndoe',
        pass: 'johnSlow@26',
      };

      expect(() => controller.login(response, authCredentialsDTO)).toThrow(
        'Check your credentials.',
      );
    });
  });

  describe('getInfo', () => {
    it('should return a user instance', () => {
      expect(controller.getInfo(mockUserRepo[0])).toEqual(mockUserRepo[0]);
    });
  });

  describe('getAvatar', () => {
    it('should throw a not found exception', () => {
      const getAvatarDTO: GetAvatarDTO = {
        path: 'uploads/nonexistingavatar.png',
      };

      expect(() => controller.getAvatar(getAvatarDTO)).toThrow(
        'Avatar was not found.',
      );
    });
  });

  describe('updateBasics', () => {
    const response: Response = {} as unknown as Response;

    it('should throw a conflict exception', () => {
      expect(() =>
        controller.updateBasics(response, mockUserRepo[0], {
          ...mockUserRepo[0],
          username: 'janedoe',
        }),
      ).toThrow(`Username janedoe already exists.`);
    });

    it('should be OK', () => {
      const result = controller.updateBasics(response, mockUserRepo[0], {
        ...mockUserRepo[0],
        username: 'JOHNDOE',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('updatePass', () => {
    it('should throw a conflict exception', () => {
      expect(() =>
        controller.updatePass(mockUserRepo[0], {
          currentPass: 'janeDoe@26',
          newPass: 'JOHNDOE@26',
        }),
      ).toThrow(`Incorrect password.`);
    });

    it('should be OK', () => {
      const result = controller.updatePass(mockUserRepo[0], {
        currentPass: 'johnDoe@26',
        newPass: 'JOHNDOE@26',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('uploadAvatar', () => {
    it('should be OK', () => {
      const filename = `${randomUUID()}.png`;

      const file: Express.Multer.File = {
        destination: './upload',
        fieldname: 'avatar',
        filename,
        originalname: 'avatar.png',
        size: 2048,
        mimetype: 'image/png',
        path: `upload/${filename}`,
        stream: new Readable(),
        buffer: Buffer.alloc(2048),
        encoding: 'utf-9',
      };

      expect(controller.uploadAvatar(file, mockUserRepo[0])).toEqual({
        path: `uploads/${filename}`,
      });
    });
  });

  describe('unlinkAvatar', () => {
    it('should be OK', () => {
      expect(controller.unlinkAvatar(mockUserRepo[0])).toBeUndefined();
    });
  });
});
