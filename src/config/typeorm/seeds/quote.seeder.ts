import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Quote } from '../../../quotes/entities/quote.entity';
import { User } from '../../../auth/entities/user.entity';

export default class QuoteSeeder implements Seeder {
  async run(dataSource: DataSource, _factoryManager: SeederFactoryManager) {
    const user: User = (
      await dataSource.getRepository(User).find({ take: 1 })
    )[0];

    await dataSource.getRepository(Quote).insert([
      {
        quote: 'Talk is cheap. Show me the code.',
        user,
        upvotes: 1991,
        downvotes: 0,
      },
      {
        quote:
          'Program testing can be used to show the presence of bugs, but never to show their absence!',
        user,
        upvotes: 1972,
        downvotes: 0,
      },
      {
        quote:
          "I know how to control the universe and I'm not interested in money or fame.",
        user,
        upvotes: 2006,
        downvotes: 0,
      },
      {
        quote: "What doesn't kill us makes us stronger.",
        user,
        upvotes: 3,
        downvotes: 0,
      },
      {
        quote: 'The unexamined life is not worth living.',
        user,
        upvotes: 729,
        downvotes: 0,
      },
      {
        quote: 'Imagination is more important than knowledge.',
        user,
        upvotes: 1921,
        downvotes: 0,
      },
      {
        quote:
          'If I have seen further it is by standing on the shoulders of Giants',
        user,
        upvotes: 1687,
        downvotes: 0,
      },
      {
        quote: 'Give me a place to stand, and I will move the Earth',
        user,
        upvotes: 314,
        downvotes: 0,
      },
      {
        quote: 'The most personal is the most creative.',
        user,
        upvotes: 2006,
        downvotes: 0,
      },
      {
        quote: 'Just when I thought I was out, they pull me back in.',
        user,
        upvotes: 1992,
        downvotes: 0,
      },
    ]);
  }
}
