import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Quote from './entities/quote.entity';
import { Repository } from 'typeorm';
import Vote from './entities/vote.entity';
import FilterQuotesDTO from './dto/filter-quotes.dto';
import User from 'src/auth/entities/user.entity';
import FileLogger from 'src/logger/file-logger.service';
import CreateUpdateQuoteDTO from './dto/create-quote.dto';
import GetQuoteDTO from './dto/get-quote.dto';
import VoteOnQuoteDTO from './dto/vote-on-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote) private quoteRepo: Repository<Quote>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    private logger: FileLogger,
  ) {}

  private async checkForVotedQuotes(
    quotes: Record<string, string | number>[],
    username: string,
  ) {
    for (let i = 0; i <= quotes.length - 1; i++) {
      const query = this.voteRepo.createQueryBuilder('vote');
      query.innerJoin('vote.quote', 'quote');
      query.where('vote."quoteId" = :id', {
        id: quotes[i].id,
      });
      query.andWhere('vote.voter = :username', {
        username,
      });

      let quoteVote: Vote | null = null;

      try {
        quoteVote = await query.getOne();
      } catch (error) {
        this.logger.error(error.message, 'checkForVotedQuotes');
      }

      if (quoteVote && quoteVote.up) quotes[i].votedOn = 'up';

      if (quoteVote && !quoteVote.up) quotes[i].votedOn = 'down';
    }

    return quotes;
  }

  async getQuotes(filterQuotesDTO: FilterQuotesDTO, user?: User) {
    const { searchFor, author, limit } = filterQuotesDTO;

    const query = this.quoteRepo.createQueryBuilder('quote');
    query.innerJoin('quote.user', 'user');
    query.leftJoin('quote.votes', 'vote');
    query.select('quote.id', 'id');
    query.addSelect('quote.content', 'content');
    query.addSelect('quote.written', 'written');
    query.addSelect('quote.updated', 'updated');
    query.addSelect('user.name', 'name');
    query.addSelect('user.surname', 'surname');
    query.addSelect('user.avatar', 'avatar');
    query.addSelect(
      '(COUNT(CASE WHEN vote.up = true THEN 1 END) - COUNT(CASE WHEN vote.up = false THEN 1 END))',
      'totalVotes',
    );
    query.addSelect('user.username', 'username');

    if (author) query.where('user.username = :author', { author });

    query.groupBy(
      'quote.id, user.avatar, user.name, user.surname, user.username',
    );

    switch (searchFor) {
      case 'mostLiked':
        query.orderBy('"totalVotes"', 'DESC');
        break;

      case 'leastLiked':
        query.orderBy('"totalVotes"', 'ASC');
        break;

      case 'recent':
        query.orderBy('written', 'DESC');
        break;

      case 'votedFor':
        query.where('votes.username = :username', {
          username: author,
        });
        break;

      default:
        query.orderBy('written', 'DESC');
    }

    query.limit(limit);

    let quotes: Record<string, string | number>[] = [];

    try {
      quotes = await query.execute();
    } catch (error) {
      this.logger.error(error.message, 'getQuotes');

      throw new InternalServerErrorException('Failed to fetch quotes.');
    }

    if (user) return await this.checkForVotedQuotes(quotes, user.username);

    return quotes;
  }

  async getQuote(getQuoteDTO: GetQuoteDTO, user?: User) {
    const { id } = getQuoteDTO;

    const query = this.quoteRepo.createQueryBuilder('quote');
    query.innerJoin('quote.user', 'user');
    query.leftJoinAndSelect('quote.votes', 'vote');
    query.select('quote.id', 'id');
    query.addSelect('quote.content', 'content');
    query.addSelect('quote.written', 'written');
    query.addSelect('quote.updated', 'updated');
    query.addSelect('user.name', 'name');
    query.addSelect('user.surname', 'surname');
    query.addSelect('user.avatar', 'avatar');
    query.addSelect(
      '(COUNT(CASE WHEN vote.up = true THEN 1 END) - COUNT(CASE WHEN vote.up = false THEN 1 END))',
      'totalVotes',
    );

    query.where('quote.id = :id', { id });

    query.groupBy('quote.id, user.avatar, user.name, user.surname');

    let quote: Record<string, string | number>;

    try {
      quote = (await query.execute())[0];
    } catch (error) {
      this.logger.error(error.message, 'getQuote');

      throw new InternalServerErrorException('Failed to fetch quote.');
    }

    return quote;
  }

  async getRandomQuote(user?: User) {
    const query = this.quoteRepo.createQueryBuilder('quote');
    query.innerJoin('quote.user', 'user');
    query.leftJoinAndSelect('quote.votes', 'vote');
    query.select('quote.id', 'id');
    query.addSelect('quote.content', 'content');
    query.addSelect('quote.written', 'written');
    query.addSelect('quote.updated', 'updated');
    query.addSelect('user.name', 'name');
    query.addSelect('user.surname', 'surname');
    query.addSelect('user.avatar', 'avatar');
    query.addSelect(
      '(COUNT(CASE WHEN vote.up = true THEN 1 END) - COUNT(CASE WHEN vote.up = false THEN 1 END))',
      'totalVotes',
    );
    query.addSelect('user.username', 'username');

    query.orderBy('random()');

    query.groupBy(
      'quote.id, user.avatar, user.name, user.surname, user.username',
    );

    let quote: Record<string, string | number>;

    try {
      quote = (await query.execute())[0];
    } catch (error) {
      this.logger.error(error.message, 'getQuote');

      throw new InternalServerErrorException('Failed to fetch random quote.');
    }

    if (user)
      return (await this.checkForVotedQuotes([quote], user.username))[0];

    return quote;
  }

  async getQuoteKarma(username: string) {
    const totalQuery = this.quoteRepo.createQueryBuilder('quote');
    totalQuery.select('quote.author');
    totalQuery.addSelect('COUNT(quote.id)', 'total');
    totalQuery.where('quote.author = :username ', { username });
    totalQuery.groupBy('quote.author');

    const karmaQuery = this.quoteRepo.createQueryBuilder('quote');
    karmaQuery.innerJoin('quote.user', 'user');
    karmaQuery.innerJoin('quote.votes', 'vote');
    karmaQuery.select('user.username');
    karmaQuery.addSelect(
      '(COUNT(CASE WHEN vote.up = true THEN 1 END) - COUNT(CASE WHEN vote.up = false THEN 1 END))',
      'karma',
    );
    karmaQuery.where('quote.author = :username ', { username });
    karmaQuery.groupBy('user.username');

    const result: { quotes: number; karma: number } = { quotes: 0, karma: 0 };
    try {
      const { total } = (await totalQuery.execute())[0] ?? { total: 0 };

      const { karma } = (await karmaQuery.execute())[0] ?? { karma: 0 };

      result.quotes = total;
      result.karma = karma;
    } catch (error) {
      this.logger.error(error.message, 'getQuoteKarma');

      throw new InternalServerErrorException('Failed to fetch quote karma.');
    }

    return result;
  }

  async createQuote(user: User, createQuoteDTO: CreateUpdateQuoteDTO) {
    const { content } = createQuoteDTO;

    const quote: Quote = this.quoteRepo.create({
      user,
      content,
    });

    try {
      await this.quoteRepo.insert(quote);
    } catch (error) {
      this.logger.error(error.message, 'createQuote');

      throw new InternalServerErrorException('Failed to create quote.');
    }
  }

  async updateQuote(
    user: User,
    id: string,
    createQuoteDTO: CreateUpdateQuoteDTO,
  ) {
    const { content } = createQuoteDTO;

    try {
      const { affected } = await this.quoteRepo.update({ id }, { content });

      return affected;
    } catch (error) {
      this.logger.error(error.message, 'updateQuote');

      throw new InternalServerErrorException('Failed to update quote.');
    }
  }

  async voteOnQuote(user: User, id: string, voteOnQuote: VoteOnQuoteDTO) {
    let alreadyVotedOn: boolean;

    try {
      alreadyVotedOn = await this.voteRepo.exists({ where: { quote: { id } } });
    } catch (error) {
      this.logger.error(error.message, 'voteOnQuote');

      throw new InternalServerErrorException(
        'Failed to check if up or down voted on quote.',
      );
    }

    const { vote } = voteOnQuote;

    if (alreadyVotedOn) {
      try {
        await this.voteRepo.update(
          { user, quote: { id } },
          { up: vote === 'up' ? true : false },
        );
      } catch (error) {
        this.logger.error(error.message, 'voteOnQuote');

        throw new InternalServerErrorException(
          'Failed to update vote on quote.',
        );
      }

      return;
    }

    let quote: Quote | null;

    try {
      quote = await this.quoteRepo.findOneBy({ id });
    } catch (error) {
      this.logger.error(error.message, 'voteOnQuote');

      throw new InternalServerErrorException(
        'Failed to fetch the voted on quote.',
      );
    }

    if (!quote) throw new NotFoundException('The voted on quote not found.');

    const quoteVote = this.voteRepo.create({
      up: vote === 'up' ? true : false,
      quote,
      user,
    });

    try {
      await this.voteRepo.insert(quoteVote);
    } catch (error) {
      this.logger.error(error.message, 'voteOnQuote');

      throw new InternalServerErrorException('Failed to insert vote on quote.');
    }
  }

  async unQuote(user: User, id: string) {
    let votedOnQuote: boolean;

    try {
      votedOnQuote = await this.voteRepo.exists({ where: { quote: { id } } });
    } catch (error) {
      this.logger.error(error.message, 'unQuote');

      throw new InternalServerErrorException('Failed to fetch votes on quote.');
    }

    if (votedOnQuote) {
      try {
        await this.voteRepo.delete({ quote: { id } });
      } catch (error) {
        this.logger.error(error.message, 'unQuote');

        throw new InternalServerErrorException(
          'Failed to delete votes on quote.',
        );
      }
    }

    try {
      const { affected } = await this.quoteRepo.delete({ id });

      return affected;
    } catch (error) {
      this.logger.error(error.message, 'unQuote');

      throw new InternalServerErrorException('Failed to delete quote.');
    }
  }
}
