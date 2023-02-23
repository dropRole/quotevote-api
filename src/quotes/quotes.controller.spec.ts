import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { authorize } from 'passport';
import { User } from '../auth/user.entity';
import { CreateUpdateQuoteDTO } from './dto/create-update-quote.dto';
import { GetFilterDTO } from './dto/get-filter.dto';
import { Quote } from './quote.entity';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { Vote } from './vote.entity';

describe('QuotesController', () => {
  let controller: QuotesController;
  let service: QuotesService;

  const user: User = new User();
  user.email = 'phil.collins@gmail.com';
  user.name = 'Phil';
  user.surname = 'Collins';
  user.username = 'collinsphil';
  user.pass = 'philCollins@23';
  user.avatar = 'uploads/avatar.png';
  user.quotes = [];
  user.votes = [];

  const quotes: Quote[] = [
    {
      id: 'd646ff95-2acb-4a86-8221-ae92be19cfc8',
      quote: 'Acta, non verba',
      written: new Date(),
      user: user,
      updated: null,
      votes: [],
    },
    {
      id: '4264c3eb-e352-4e23-a3ac-02def23fc1f0',
      quote: 'Omnia mea mecum porto',
      written: new Date(),
      user: user,
      updated: null,
      votes: [new Vote()],
    },
  ];

  const rand: number = Math.random() >= 0.5 ? 1 : 0;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotesController],
    })
      .useMocker((token) => {
        if (token === QuotesService)
          return {
            getQuotes: jest.fn().mockResolvedValue(quotes as Record<any, any>),
            getQuote: jest
              .fn()
              .mockResolvedValue(
                quotes.find(
                  (quote) =>
                    quote.id === 'd646ff95-2acb-4a86-8221-ae92be19cfc8',
                ),
              ),
            getRandomQuote: jest.fn().mockResolvedValue(quotes[rand]),
            getQuoteKarma: jest.fn().mockResolvedValue({ quotes: 0, karma: 0 }),
            createQuote: jest.fn().mockResolvedValue(new Quote()),
            updateQuote: jest.fn(),
            quoteUpVote: jest.fn(),
            quoteDownVote: jest.fn(),
            unQuote: jest.fn(),
          };
      })
      .compile();

    controller = module.get<QuotesController>(QuotesController);
    service = module.get<QuotesService>(QuotesService);
  });

  describe('getQuotes', () => {
    it('should return an array of quotes', async () => {
      const getFilterDTO: GetFilterDTO = new GetFilterDTO();
      getFilterDTO.author = user.username;
      getFilterDTO.search = 'most';
      getFilterDTO.limit = 10;

      const result = await controller.getQuotes(getFilterDTO, user);
      expect(result).toBeInstanceOf(Array<Record<any, any>>);
    });
  });

  describe('getQuote', () => {
    it('should return a quote record', async () => {
      const result = await controller.getQuote(
        'd646ff95-2acb-4a86-8221-ae92be19cfc8',
        user,
      );
      expect(result).toBe(
        quotes.find(
          (quote) => quote.id === 'd646ff95-2acb-4a86-8221-ae92be19cfc8',
        ),
      );
    });
  });

  describe('getRandomQuote', () => {
    it('should return a random quote record', async () => {
      const result = await controller.getRandomQuote(user);
      expect(result).toBe(quotes[rand]);
    });
  });

  describe('getQuoteKarma', () => {
    it('should return an object', async () => {
      const result = await controller.getQuoteKarma(user.username);
      expect(result).toStrictEqual({ quotes: 0, karma: 0 });
    });
  });

  describe('createQuote', () => {
    it('should return a Quote instance', async () => {
      const createUpdateQuoteDTO: CreateUpdateQuoteDTO =
        new CreateUpdateQuoteDTO();
      createUpdateQuoteDTO.quote = 'First of the year';

      const result = await controller.createQuote(user, createUpdateQuoteDTO);
      expect(result).toBeInstanceOf(Quote);
    });
  });

  describe('updateQuote', () => {
    it('should be void', async () => {
      const createUpdateQuoteDTO: CreateUpdateQuoteDTO =
        new CreateUpdateQuoteDTO();
      createUpdateQuoteDTO.quote = 'First of the year';

      const result = await controller.updateQuote(
        user,
        'd646ff95-2acb-4a86-8221-ae92be19cfc8',
        createUpdateQuoteDTO,
      );
      expect(typeof result).toBe('undefined');
    });

    it('should throw a NotFound exception', async () => {
      const createUpdateQuoteDTO: CreateUpdateQuoteDTO =
        new CreateUpdateQuoteDTO();
      createUpdateQuoteDTO.quote = 'First of the year';

      jest
        .spyOn(service, 'updateQuote')
        .mockImplementation((): Promise<void> => {
          if (!quotes.find((quote) => quote.id === ''))
            throw new NotFoundException('Quote was not found.');
          return new Promise((resolve) => {});
        });

      try {
        await service.updateQuote(user, '', createUpdateQuoteDTO);
      } catch (error) {
        expect(error.name).toBe('NotFoundException');
      }
    });
  });

  describe('quoteUpVote', () => {
    it('should be void', async () => {
      const result = await controller.quoteUpVote(
        user,
        'd646ff95-2acb-4a86-8221-ae92be19cfc8',
      );
      expect(typeof result).toBe('undefined');
    });
  });

  describe('quoteDownVote', () => {
    it('should be void', async () => {
      const result = await controller.quoteDownVote(
        user,
        'd646ff95-2acb-4a86-8221-ae92be19cfc8',
      );
      expect(typeof result).toBe('undefined');
    });
  });

  describe('unQuote', () => {
    it('should be void', async () => {
      const result = await controller.quoteDownVote(
        user,
        'd646ff95-2acb-4a86-8221-ae92be19cfc8',
      );
      expect(typeof result).toBe('undefined');
    });

    it('should throw a UnauthorizedException', async () => {
      jest.spyOn(service, 'unQuote').mockImplementation((): Promise<void> => {
        const auhtorized: Quote | undefined = quotes.find(
          (quote) =>
            quote.id === 'd646ff95-2acb-4a86-8221-ae92be19cfc8' &&
            quote.user.username === 'johndoe',
        );

        if (!auhtorized)
          throw new UnauthorizedException('Not the author of the quote.');

        return new Promise((resolve) => {});
      });

      expect(service.unQuote).toThrow('Not the author of the quote.');
    });

    it('should throw a ConflictException', async () => {
      jest.spyOn(service, 'unQuote').mockImplementation((): Promise<void> => {
        const quote: Quote = quotes.find(
          (quote) => quote.id === '4264c3eb-e352-4e23-a3ac-02def23fc1f0',
        );

        if (quote.votes.length > 0)
          throw new ConflictException('Quote has been voted on.');
        return new Promise((resolve) => {});
      });

      expect(service.unQuote).toThrow('Quote has been voted on.');
    });
  });
});
