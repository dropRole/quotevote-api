import { Test, TestingModule } from '@nestjs/testing';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import Quote from './entities/quote.entity';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import FilterQuotesDTO from './dto/filter-quotes.dto';
import User from '../auth/entities/user.entity';
import GetQuoteDTO from './dto/get-quote.dto';
import CreateUpdateQuoteDTO from './dto/create-quote.dto';
import VoteOnQuoteDTO from './dto/vote-on-quote.dto';
import Vote from './entities/vote.entity';

let mockQuoteRepo: Quote[] = [
  {
    id: randomUUID(),
    content: "Ain't no grave can hold my body down.",
    written: moment().toString(),
    updated: null,
    user: {
      username: 'johnnycash',
      name: 'Johnny',
      surname: 'Cash',
      email: 'johnnycash@email.com',
      pass: bcrypt.hashSync('johnnyCash@26', 9),
      avatar: null,
      quotes: [],
      votes: [],
    },
    votes: [],
  },
  {
    id: randomUUID(),
    content: "Knock, knock, knocking' on heaven's door.",
    written: moment().add(1, 'hour').toString(),
    updated: null,
    user: {
      username: 'bobdylan',
      name: 'Bob',
      surname: 'Dyan',
      email: 'bobdyan@email.com',
      pass: bcrypt.hashSync('bobDylan@26', 9),
      avatar: null,
      quotes: [],
      votes: [],
    },
    votes: [],
  },
  {
    id: randomUUID(),
    content: 'Cumberland gap is a devil of a gap.',
    written: moment().add(2, 'hour').toString(),
    updated: null,
    user: {
      username: 'davidrawlings',
      name: 'David',
      surname: 'Rawlings',
      email: 'davidrawlings@email.com',
      pass: bcrypt.hashSync('davidRawlings@26', 9),
      avatar: null,
      quotes: [],
      votes: [],
    },
    votes: [],
  },
];

mockQuoteRepo[0].votes.push({
  id: randomUUID(),
  at: moment().toString(),
  quote: mockQuoteRepo[0],
  up: true,
  user: mockQuoteRepo[1].user,
});

mockQuoteRepo[1].votes.push({
  id: randomUUID(),
  at: moment().add(1, 'hour').toString(),
  quote: mockQuoteRepo[1],
  up: true,
  user: mockQuoteRepo[0].user,
});

mockQuoteRepo[2].votes.push({
  id: randomUUID(),
  at: moment().add(1, 'hour').toString(),
  quote: mockQuoteRepo[2],
  up: true,
  user: mockQuoteRepo[0].user,
});

mockQuoteRepo[2].votes.push({
  id: randomUUID(),
  at: moment().add(2, 'hour').toString(),
  quote: mockQuoteRepo[2],
  up: true,
  user: mockQuoteRepo[1].user,
});

describe('QuotesController', () => {
  let controller: QuotesController;

  const rand: number = Math.floor(Math.random() * 3);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotesController],
    })
      .useMocker((token) => {
        if (token === QuotesService)
          return {
            getQuotes: jest
              .fn()
              .mockImplementation(
                (filterQuotesDTO: FilterQuotesDTO, user?: User) => {
                  const { searchFor, author, limit } = filterQuotesDTO;

                  let filteredQuotes: Quote[] = [];

                  if (author)
                    filteredQuotes = mockQuoteRepo.filter(
                      (quote) =>
                        quote.user.username.toUpperCase() ===
                        author.toUpperCase(),
                    );

                  switch (searchFor) {
                    case 'mostLiked':
                      filteredQuotes = filteredQuotes.sort(
                        (a: Quote, b: Quote) => b.votes.length - a.votes.length,
                      );
                      break;
                    case 'leastLiked':
                      filteredQuotes = filteredQuotes.sort(
                        (a: Quote, b: Quote) => a.votes.length - b.votes.length,
                      );
                      break;
                    case 'recent':
                      filteredQuotes = filteredQuotes.sort(
                        (a: Quote, b: Quote) =>
                          moment(b.written).diff(moment(a.written)),
                      );
                      break;
                    case 'votedFor':
                      filteredQuotes = filteredQuotes.filter((quote) =>
                        quote.votes.find(
                          (vote) => vote.user.username === author,
                        ),
                      );
                      break;
                  }

                  filteredQuotes = filteredQuotes.slice(0, limit);

                  if (user)
                    filteredQuotes = filteredQuotes.map((quote) => {
                      const vote = quote.votes.find(
                        (vote) => vote.user.username === user.username,
                      );

                      if (vote)
                        return {
                          ...quote,
                          votedOn: vote.up ? 'up' : 'down',
                        };

                      return quote;
                    });

                  return filteredQuotes;
                },
              ),
            getQuote: jest.fn().mockReturnValue(mockQuoteRepo[0]),
            getRandomQuote: jest.fn().mockReturnValue(mockQuoteRepo[rand]),
            getQuoteKarma: jest.fn().mockImplementation((username: string) => {
              let karma = 0;

              const quotes = mockQuoteRepo.filter(
                (quote) => quote.user.username === username,
              );

              quotes.map((quote) =>
                quote.votes.map((vote) => (vote ? karma++ : karma--)),
              );

              return { quotes: quotes.length, karma };
            }),
            createQuote: jest.fn().mockReturnValue(undefined),
            updateQuote: jest.fn().mockReturnValue(undefined),
            voteOnQuote: jest
              .fn()
              .mockImplementation(
                (user: User, id: string, voteOnQuoteDTO: VoteOnQuoteDTO) => {
                  const { vote } = voteOnQuoteDTO;

                  const quote = mockQuoteRepo.find((quote) => quote.id === id);

                  const existingVote = quote?.votes.find(
                    (vote) => vote.user.username === user.username,
                  );

                  if (existingVote) {
                    existingVote.up = vote === 'up' ? true : false;

                    mockQuoteRepo = mockQuoteRepo.map((quote) => {
                      quote.votes.map((vote) =>
                        vote.user.username === user.username
                          ? existingVote
                          : vote,
                      );

                      return quote;
                    });
                  }

                  const newVote: Vote = {
                    id: randomUUID(),
                    up: vote === 'up' ? true : false,
                    at: moment().toString(),
                    quote: quote as Quote,
                    user,
                  };

                  mockQuoteRepo = mockQuoteRepo.map((quote) => {
                    if (quote.id === id) quote.votes.push(newVote);

                    return quote;
                  });
                },
              ),
            unQuote: jest.fn().mockReturnValue(undefined),
          };
      })
      .compile();

    controller = module.get<QuotesController>(QuotesController);
  });

  describe('getQuotes', () => {
    it('should return a quote array instance', () => {
      const filterQuotesDTO: FilterQuotesDTO = {
        searchFor: 'mostLiked',
        author: 'davidrawlings',
        limit: 1,
      };

      expect(controller.getQuotes(filterQuotesDTO)).toBeInstanceOf(
        Array<Quote>,
      );
    });
  });

  describe('getQuote', () => {
    it('should return a quote instance', () => {
      const getQuoteDTO: GetQuoteDTO = {
        id: mockQuoteRepo[0].id,
      };

      expect(controller.getQuote(getQuoteDTO)).toMatchObject(mockQuoteRepo[0]);
    });
  });

  describe('getRandomQuote', () => {
    it('should return a quote instance', () => {
      expect(controller.getRandomQuote()).toMatchObject(mockQuoteRepo[rand]);
    });
  });

  describe('getQuoteKarma', () => {
    it('should return an object holding karma property', () => {
      expect(
        controller.getQuoteKarma(mockQuoteRepo[2].user.username),
      ).toHaveProperty('karma');
    });
  });

  describe('createQuote', () => {
    it('should be OK', () => {
      const createQuoteDTO: CreateUpdateQuoteDTO = {
        content: 'Once upon a time, you dressed so fine.',
      };

      expect(
        controller.createQuote(mockQuoteRepo[2].user, createQuoteDTO),
      ).toBeUndefined();
    });
  });

  describe('updateQuote', () => {
    it('should be OK', () => {
      const updateQuoteDTO: CreateUpdateQuoteDTO = {
        content: 'Once upon a time, you could be mine.',
      };

      expect(
        controller.updateQuote(
          mockQuoteRepo[2].user,
          mockQuoteRepo[2].id,
          updateQuoteDTO,
        ),
      ).toBeUndefined();
    });
  });

  describe('voteOnQuote', () => {
    it('should be OK', () => {
      const voteOnQuoteDTO: VoteOnQuoteDTO = {
        vote: 'up',
      };

      expect(
        controller.voteOnQuote(
          mockQuoteRepo[2].user,
          mockQuoteRepo[0].id,
          voteOnQuoteDTO,
        ),
      ).toBeUndefined();
    });
  });

  describe('unQuote', () => {
    it('should be OK', () => {
      expect(
        controller.unQuote(mockQuoteRepo[0].user, mockQuoteRepo[0].id),
      ).toBeUndefined();
    });
  });
});
