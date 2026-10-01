import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import Quote from '../../../quoting/entities/quote.entity';
import User from '../../../auth/entities/user.entity';

export default class QuoteSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const user: User = (await dataSource
      .getRepository(User)
      .findOneBy({ username: process.env.MOCK_USER as string })) as User;

    await dataSource.getRepository(Quote).insert([
      {
        content: 'Talk is cheap. Show me the code.',
        user,
      },
      {
        content:
          'Program testing can be used to show the presence of bugs, but never to show their absence!',
        user,
      },
      {
        content:
          "I know how to control the universe and I'm not interested in money or fame.",
        user,
      },
      {
        content: "What doesn't kill us makes us stronger.",
        user,
      },
      {
        content: 'The unexamined life is not worth living.',
        user,
      },
      {
        content: 'Imagination is more important than knowledge.',
        user,
      },
      {
        content:
          'If I have seen further it is by standing on the shoulders of Giants',
        user,
      },
      {
        content: 'Give me a place to stand, and I will move the Earth',
        user,
      },
      {
        content: 'The most personal is the most creative.',
        user,
      },
      {
        content: 'Just when I thought I was out, they pull me back in.',
        user,
      },
    ]);
  }
}
