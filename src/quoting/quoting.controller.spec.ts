import { Test, TestingModule } from '@nestjs/testing';
import { QuotingController } from './quoting.controller';
import { QuotingService } from './quoting.service';
import FilterQuotesDTO from './dto/filter-quotes.dto';
import Quote from './entities/quote.entity';
import User from 'src/auth/entities/user.entity';
import * as moment from 'moment';
import { randomUUID } from 'crypto';
import GetQuoteDTO from './dto/get-quote.dto';
import CreateQuoteDTO from './dto/create-quote.dto';
import VoteOnQuoteDTO from './dto/vote-on-quote.dto';

describe('QuotingController', () => {
  let controller: QuotingController;

  const user: User = {
    username: 'johndoe',
    name: 'John',
    surname: 'Doe',
    email: 'johndoe@email.com',
    avatar: null,
    pass: 'johnDoe@26',
    quotes: [],
    votes: [],
  };

  const quotes: Quote[] = [
    {
      id: randomUUID(),
      content: 'Cogito ergo sum.',
      written: moment().toString(),
      updated: null,
      user,
      votes: [],
    },
    {
      id: randomUUID(),
      content: 'Omnia mea mecum porto.',
      written: moment().toString(),
      updated: null,
      user,
      votes: [],
    },
  ];

  const i = Math.floor(Math.random() * quotes.length);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotingController],
    })
      .useMocker((token) => {
        if (token === QuotingService)
          return {
            getQuotes: jest.fn().mockResolvedValue(quotes),
            getQuote: jest.fn().mockResolvedValue(quotes[0]),
            getRandomQuote: jest.fn().mockResolvedValue(quotes[i]),
            getQuoteKarma: jest.fn().mockResolvedValue({ quotes: 2, karma: 0 }),
            createQuote: jest.fn().mockResolvedValue({ id: randomUUID() }),
            updateQuote: jest.fn().mockResolvedValue(undefined),
            voteOnQuote: jest.fn().mockResolvedValue({ id: randomUUID() }),
            unQuote: jest.fn().mockResolvedValue(undefined),
          };
      })
      .compile();

    controller = module.get<QuotingController>(QuotingController);
  });

  describe('getQuotes', () => {
    const filterQuotesDTO: FilterQuotesDTO = {
      searchFor: 'recent',
      author: 'johndoe',
      limit: 10,
    };

    it('should return an Array instance of Quote objects when OK', async () => {
      await expect(
        controller.getQuotes(filterQuotesDTO),
      ).resolves.toBeInstanceOf(Array<Quote>);
    });
  });

  describe('getQuote', () => {
    const getQuoteDTO: GetQuoteDTO = {
      id: quotes[0].id,
    };

    it('should return a Quote object when OK', async () => {
      await expect(controller.getQuote(getQuoteDTO)).resolves.toEqual(
        quotes[0],
      );
    });
  });

  describe('getRandomQuote', () => {
    it('should return a Quote object when OK', async () => {
      await expect(controller.getRandomQuote()).resolves.toEqual(quotes[i]);
    });
  });

  describe('getQuoteKarma', () => {
    it('should return an object which has karma property when OK', async () => {
      await expect(
        controller.getQuoteKarma(user.username),
      ).resolves.toHaveProperty('karma');
    });
  });

  describe('createQuote', () => {
    const createQuoteDTO: CreateQuoteDTO = {
      content: 'Veni, vidi, vici.',
    };

    it('should return an object which has id property when OK', async () => {
      await expect(
        controller.createQuote(user, createQuoteDTO),
      ).resolves.toHaveProperty('id');
    });
  });

  describe('updateQuote', () => {
    const createQuoteDTO: CreateQuoteDTO = {
      content: 'VENI, VIDI, VICI.',
    };

    it('should be undefined when OK', async () => {
      await expect(
        controller.updateQuote(user, quotes[1].id, createQuoteDTO),
      ).resolves.toBeUndefined();
    });
  });

  describe('voteOnQuote', () => {
    const voteOnQuoteDTO: VoteOnQuoteDTO = {
      vote: 'up',
    };

    it('should return an object which has id property when OK', async () => {
      await expect(
        controller.voteOnQuote(user, quotes[1].id, voteOnQuoteDTO),
      ).resolves.toHaveProperty('id');
    });
  });

  describe('unQuote', () => {
    it('should be undefined when OK', async () => {
      await expect(
        controller.unQuote(user, quotes[1].id),
      ).resolves.toBeUndefined();
    });
  });
});
