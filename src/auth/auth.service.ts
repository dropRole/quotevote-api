import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async validateUser(username: string) {
    const user = await this.userRepo.findOneBy({ username });

    if (!user) throw new UnauthorizedException('Check your credentials.');

    return user;
  }
}
