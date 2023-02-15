import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { SQLErrorCode } from 'src/sql-error-code.enum';
import { JWTPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { BasicsUpdateDTO } from './dto/basics-update-dto';
import { PassUpdateDTO } from './dto/pass-update.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    public usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signUpDTO: SignUpDTO): Promise<void> {
    const { email, name, surname, username, pass } = signUpDTO;

    // generate BCRYPT hash substrated from salt and pass
    const salt: string = await bcrypt.genSalt();

    const hash: string = await bcrypt.hash(pass, salt);

    const user: User = this.usersRepository.create({
      email,
      name,
      surname,
      username,
      pass: hash,
    });

    try {
      await this.usersRepository.insert(user);
    } catch (error) {
      // if username already exists
      if (error.code === SQLErrorCode.UniqueViolation)
        throw new ConflictException('Username already exists.');
    }
  }

  async login(
    authCredentialsDTO: AuthCredentialsDTO,
  ): Promise<{ accessToken: string }> {
    const { username, pass } = authCredentialsDTO;

    const user: User = await this.usersRepository.findOne({
      where: { username },
    });

    // if valid credentials
    if (user && (await bcrypt.compare(pass, user.pass))) {
      const payload: JWTPayload = { username };

      const accessToken: string = this.jwtService.sign(payload);

      return { accessToken };
    }

    throw new UnauthorizedException('Check your credentials.');
  }

  async updateBasics(
    user: User,
    basicsUpdateDTO: BasicsUpdateDTO,
  ): Promise<{ accessToken: string }> {
    const { email, name, surname, username } = basicsUpdateDTO;

    const update = await this.usersRepository.findOne({
      where: { username: user.username },
    });

    let accessToken = '';

    // if new username provided which doesn't already exist
    if (user.username !== username)
      if (
        !(await this.usersRepository.findOne({
          where: { username },
        }))
      ) {
        const payload: JWTPayload = { username };

        accessToken = this.jwtService.sign(payload);

        update.username = username;
      }
      // if username already exists
      else throw new ConflictException('Username already exists.');

    update.email = email;
    update.name = name;
    update.surname = surname;

    try {
      await this.usersRepository.update({ username: user.username }, update);
    } catch (error) {
      // if username already exists
      if (error.code === SQLErrorCode.UniqueViolation)
        throw new ConflictException('Username already exists.');
    }

    return { accessToken };
  }

  async updatePass(user: User, passUpdateDTO: PassUpdateDTO): Promise<void> {
    const { passCurrent, pass } = passUpdateDTO;

    // if correct current password
    if (user && (await bcrypt.compare(passCurrent, user.pass))) {
      const updateUser = await this.usersRepository.findOne({
        where: { username: user.username },
      });

      const salt = await bcrypt.genSalt();

      updateUser.pass = await bcrypt.hash(pass, salt);

      this.usersRepository.save(updateUser);

      return;
    }

    throw new ConflictException('Incorrect password.');
  }

  async uploadAvatar(user: User, filename: string): Promise<{ path: string }> {
    // if user already has an avatar
    if (user.avatar) {
      fs.unlink(`uploads/${filename}`, (err) => {
        if (err) throw err;
      });

      throw new ConflictException('Avatar is already uploaded.');
    }

    user.avatar = `uploads/${filename}`;

    this.usersRepository.save(user);

    return { path: user.avatar };
  }

  async unlinkAvatar(user: User): Promise<void> {
    fs.unlink(user.avatar, (err) => {
      if (err) throw err;
    });

    user.avatar = null;

    await this.usersRepository.save(user);
  }
}
