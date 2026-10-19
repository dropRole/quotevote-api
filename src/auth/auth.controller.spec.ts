import { describe, beforeEach, jest, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import SignupDTO from './dto/signup.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import AuthCredentialsDTO from './dto/auth-credentials.dto';
import { getMockRes } from '@jest-mock/express';

describe('AuthController', () => {
  let controller: AuthController;

  let service: jest.Mocked<AuthService>;

  const { res } = getMockRes();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService)
          return {
            signup: jest.fn(),
            login: jest.fn(),
          };
      })
      .compile();

    controller = module.get<AuthController>(AuthController);

    service = module.get(AuthService);
  });

  describe('signup', () => {
    const signupDTO: SignupDTO = {
      name: 'John',
      surname: 'Doe',
      email: 'johndoe@email.com',
      username: 'johndoe',
      pass: 'johnDoe@26',
    };

    it('should throw a ConflictException when username already exists', async () => {
      service.signup.mockRejectedValue(
        new ConflictException(`The ${signupDTO.username} already exists.`),
      );

      await expect(controller.signup(signupDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a ConflictException when email already exists', async () => {
      service.signup.mockRejectedValue(
        new ConflictException(`The ${signupDTO.email} already exists.`),
      );

      await expect(controller.signup(signupDTO)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const authCredentialsDTO: AuthCredentialsDTO = {
      username: 'johndoe',
      pass: 'johnDoe@26',
    };

    it('should throw a ConflictException when credentials are invalid', async () => {
      service.login.mockRejectedValue(
        new UnauthorizedException('Check your credentials'),
      );

      await expect(controller.login(res, authCredentialsDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should be undefined when Created', async () => {
      service.login.mockResolvedValue(undefined);

      await expect(
        controller.login(res, authCredentialsDTO),
      ).resolves.toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should be undefined when Created', () => {
      expect(controller.logout(res)).toBeUndefined();
    });
  });
});
