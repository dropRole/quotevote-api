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
import FileLogger from '../logger/file-logger.service';

@Injectable()
export class AuthService {
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
}
