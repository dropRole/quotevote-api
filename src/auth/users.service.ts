import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import SignupDTO from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import SQLErrorCode from './enums/sql-error-code.enum';
import AuthCredentialsDTO from './dto/auth-credentials.dto';
import { JWTPayload } from './strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as moment from 'moment';
import BasicsUpdateDTO from './dto/basics-update.dto';
import PassUpdateDTO from './dto/pass-update.dto';
import { unlink } from 'fs';
import FileLogger from 'src/logger/file-logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private readonly fileLogger: FileLogger,
  ) {}

  async validateUser(username: string) {
    let user: User | null;

    try {
      user = await this.userRepo.findOneBy({ username });
    } catch (error) {
      this.fileLogger.error(error.message, 'validateUser');

      throw new InternalServerErrorException('Failed to validate user.');
    }

    if (!user) throw new UnauthorizedException('Check your credentials.');

    return user;
  }

  async signup(signupDTO: SignupDTO) {
    const { email, name, surname, username, pass } = signupDTO;

    const salt: string = await bcrypt.genSalt();

    const hash: string = await bcrypt.hash(pass, salt);

    const user: User = this.userRepo.create({
      email,
      name,
      surname,
      username,
      pass: hash,
    });

    try {
      await this.userRepo.insert(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === SQLErrorCode.UniqueViolation
      )
        throw new ConflictException(`Username ${username} already exists.`);

      this.fileLogger.error(error.message, 'signup');

      throw new InternalServerErrorException('Failed to sign up.');
    }
  }

  async login(response: Response, authCredentialsDTO: AuthCredentialsDTO) {
    const { username, pass } = authCredentialsDTO;

    let user: User | null;

    try {
      user = await this.userRepo.findOneBy({
        username,
      });
    } catch (error) {
      this.fileLogger.error(error.message, 'login');

      throw new InternalServerErrorException('Failed to login.');
    }

    if (!user) throw new NotFoundException(`User ${username} was not found.`);

    const isValidPass = await bcrypt.compare(pass, user.pass);

    if (user && isValidPass) {
      const payload: JWTPayload = { username };

      const accessToken: string = this.jwtService.sign(payload);

      const expires = moment().add(86400, 'seconds').toDate();

      response.cookie('quotevote-jwt', accessToken, {
        httpOnly: true,
        secure: process.env.STAGE === 'prod',
        expires,
      });

      return;
    }

    throw new UnauthorizedException('Check your credentials.');
  }

  async updateBasics(
    response: Response,
    user: User,
    basicsUpdateDTO: BasicsUpdateDTO,
  ) {
    const { email, name, surname, username } = basicsUpdateDTO;

    user.email = email;
    user.name = name;
    user.surname = surname;

    try {
      await this.userRepo.update(
        { username: user.username },
        { ...user, username },
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === SQLErrorCode.UniqueViolation
      )
        throw new ConflictException(`Username ${username} already exists.`);

      this.fileLogger.error(error.message, 'updateBasics');

      throw new InternalServerErrorException('Failed to update basics.');
    }

    let accessToken = '';

    const payload: JWTPayload = { username };

    accessToken = this.jwtService.sign(payload);

    const expires = moment().add(86400, 'seconds').toDate();

    response.cookie('quotevote-jwt', accessToken, {
      httpOnly: true,
      secure: process.env.STAGE === 'prod',
      expires,
    });
  }

  async updatePass(user: User, passUpdateDTO: PassUpdateDTO) {
    const { currentPass, newPass } = passUpdateDTO;

    const isValidPass = await bcrypt.compare(currentPass, user.pass);

    if (user && isValidPass) {
      const salt = await bcrypt.genSalt();

      user.pass = await bcrypt.hash(newPass, salt);

      try {
        await this.userRepo.update({ username: user.username }, user);
      } catch (error) {
        this.fileLogger.error(error.message, 'updatePass');

        throw new InternalServerErrorException('Failed to update pass.');
      }

      return;
    }

    throw new ConflictException('Incorrect password.');
  }

  async uploadAvatar(user: User, filename: string) {
    if (user.avatar)
      unlink(user.avatar, (error) => {
        if (error) {
          this.fileLogger.error(error.message, 'uploadAvatar');

          throw new InternalServerErrorException('Failed to upload avatar.');
        }
      });

    user.avatar = `uploads/${filename}`;

    try {
      await this.userRepo.update({ username: user.username }, user);
    } catch (error) {
      this.fileLogger.error(error.message, 'uploadAvatar');

      throw new InternalServerErrorException('Failed to upload avatar.');
    }

    return { path: user.avatar };
  }

  async unlinkAvatar(user: User): Promise<void> {
    if (user.avatar)
      unlink(user.avatar, (error) => {
        if (error) {
          this.fileLogger.error(error.message, 'uploadAvatar');

          throw new InternalServerErrorException('Failed to unlink avatar.');
        }
      });

    user.avatar = null;

    try {
      await this.userRepo.update({ username: user.username }, user);
    } catch (error) {
      this.fileLogger.error(error.message, 'unlinkAvatar');

      throw new InternalServerErrorException('Failed to unlink avatar.');
    }
  }
}
