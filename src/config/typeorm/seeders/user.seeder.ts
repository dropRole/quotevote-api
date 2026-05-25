import User from '../../../auth/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(process.env.MOCK_USER_PASS as string, salt);

    await dataSource.getRepository(User).insert({
      name: 'Quote',
      surname: 'Vote',
      email: 'quotevote@email.com',
      username: process.env.MOCK_USER as string,
      pass: hash,
    });
  }
}
