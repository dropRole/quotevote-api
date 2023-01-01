import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Quote } from './quote.entity';
import { CreateUpdateQuoteDTO } from './dto/create-update-quote.dto';
import { Vote } from './vote.entity';
import { User } from 'src/auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetFilterDTO } from './dto/get-filter.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async getQuotes(getFilterDTO: GetFilterDTO): Promise<Quote[]> {
    const { search } = getFilterDTO;

    const query = this.quotesRepository.createQueryBuilder('quotes');
    query.innerJoin('quotes.user', 'users');
    query.leftJoinAndSelect('quotes.votes', 'votes');
    query.select('quotes');
    query.addSelect(
      '(COUNT(CASE WHEN votes.vote = true THEN 1 END) - COUNT(CASE WHEN votes.vote = false THEN 1 END))',
      'voted',
    );
    query.groupBy('quotes.id');

    switch (search) {
      case 'most':
        query.orderBy('voted', 'DESC');
        break;

      case 'least':
        query.orderBy('voted', 'ASC');
        break;

      case 'recent':
        query.orderBy('written', 'DESC');
        break;

      default:
        query.orderBy('written', 'DESC');
    }

    try {
      return await query.execute();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getQuote(id: string): Promise<Record<any, any>> {
    const query = this.quotesRepository.createQueryBuilder('quotes');
    query.innerJoin('quotes.user', 'users');
    query.leftJoinAndSelect('quotes.votes', 'votes');
    query.select('quotes');
    query.addSelect(
      '(COUNT(CASE WHEN votes.vote = true THEN 1 END) - COUNT(CASE WHEN votes.vote = false THEN 1 END))',
      'voted',
    );
    query.where('quotes.id = :id', { id });
    query.groupBy('quotes.id');

    try {
      return (await query.execute())[0];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createQuote(
    user: User,
    createUpdateQuoteDTO: CreateUpdateQuoteDTO,
  ): Promise<void> {
    const { quote: content } = createUpdateQuoteDTO;

    const quote: Quote = this.quotesRepository.create({
      user,
      quote: content,
      written: new Date(),
    });

    try {
      await this.quotesRepository.insert(quote);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateQuote(
    user: User,
    id: string,
    createUpdateQuoteDTO: CreateUpdateQuoteDTO,
  ): Promise<void> {
    const { quote: content } = createUpdateQuoteDTO;

    const quote: Quote = await this.quotesRepository.findOne({ where: { id } });

    // if nought existant
    if (!quote) throw new NotFoundException('Quote was not found');

    // if not the author of the quote
    if (quote.user.username !== user.username)
      throw new UnauthorizedException('Unauthorized update attempt.');

    quote.quote = content;

    try {
      await this.quotesRepository.save(quote);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async unVote(vote: Vote): Promise<void> {
    try {
      await this.votesRepository.remove(vote);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async quoteUpVote(user: User, id: string): Promise<void> {
    let quoteVote: Vote = await this.votesRepository.findOne({
      where: { user, quote: { id } },
    });

    // if user already up-voted
    if (quoteVote && quoteVote.vote === true) {
      this.unVote(quoteVote);

      return;
    }

    // if user already down-voted
    if (quoteVote && quoteVote.vote === false) {
      quoteVote.vote = true;
      quoteVote.reVoted = new Date();

      try {
        await this.votesRepository.save(quoteVote);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      return;
    }

    quoteVote = this.votesRepository.create({
      user,
      quote: { id },
      vote: true,
    });

    try {
      await this.votesRepository.insert(quoteVote);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async quoteDownVote(user: User, id: string): Promise<void> {
    let quoteVote: Vote = await this.votesRepository.findOne({
      where: { user, quote: { id } },
    });

    // if user already down-voted
    if (quoteVote && quoteVote.vote === false) {
      this.unVote(quoteVote);

      return;
    }

    // if user already up-voted
    if (quoteVote && quoteVote.vote === true) {
      quoteVote.vote = false;
      quoteVote.reVoted = new Date();

      try {
        await this.votesRepository.save(quoteVote);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      return;
    }

    quoteVote = this.votesRepository.create({
      user,
      quote: { id },
      vote: false,
    });

    try {
      await this.votesRepository.insert(quoteVote);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async unQuote(user: User, id: string): Promise<void> {
    const quote: Quote = await this.quotesRepository.findOne({
      where: { id },
    });

    // if not the author the quote
    if (quote.user.username !== user.username)
      throw new UnauthorizedException('Not the author of the quote.');

    // if voted on quote
    if (await this.votesRepository.findOne({ where: { quote: { id } } }))
      throw new ConflictException('Quote has been voted on.');

    try {
      await this.quotesRepository.remove(quote);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
