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

  async signin(
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

  async updatePass(user: User, newPass: string): Promise<void> {
    const updateUser = await this.usersRepository.findOne({
      where: { username: user.username },
    });

    const salt = await bcrypt.genSalt()

    updateUser.pass = await bcrypt.hash(newPass, salt);

    this.usersRepository.save(updateUser);
  }
}
