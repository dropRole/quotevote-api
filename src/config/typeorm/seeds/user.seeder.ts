import { User } from '../../../auth/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource, _factoryManager: SeederFactoryManager) {
    await dataSource.getRepository(User).insert({
      name: 'Quote',
      surname: 'Vote',
      email: 'quotevote@email.com',
      username: 'quotevote',
      pass: await bcrypt.hash(
        process.env.MOCK_USER_PASS,
        await bcrypt.genSalt(),
      ),
    });
  }
}
