import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../src/auth/entities/user.entity';
import { JWTGuard } from '../src/auth/guards/jwt.guard';
import ENV_CONFIG from '../src/config/env/env.config';
import TYPEORM_CONFIG from '../src/config/typeorm/typeorm.config';
import Quote from '../src/quoting/entities/quote.entity';
import Vote from '../src/quoting/entities/vote.entity';
import { QuotingModule } from '../src/quoting/quoting.module';
import { App } from 'supertest/types';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import SignupDTO from 'src/auth/dto/signup.dto';
import AuthCredentialsDTO from 'src/auth/dto/auth-credentials.dto';
import { Response } from 'supertest';
import GetQuoteDTO from 'src/quoting/dto/filter-quotes.dto';
import { AuthModule } from '../src/auth/auth.module';
import CreateQuoteDTO from 'src/quoting/dto/create-quote.dto';
import * as moment from 'moment';
import VoteOnQuoteDTO from 'src/quoting/dto/vote-on-quote.dto';

describe('Quoting', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        QuotingModule,
        ConfigModule.forRoot(ENV_CONFIG),
        TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
        TypeOrmModule.forFeature([User, Quote, Vote]),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JWTGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.use(cookieParser());
    await app.init();

    let signupDTO: SignupDTO = userPayload;

    response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signupDTO);

    signupDTO = userPayload;

    await request(app.getHttpServer()).post('/auth/signup').send(signupDTO);

    const authCredentialsDTO: AuthCredentialsDTO = userPayload;

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authCredentialsDTO);

    cookie = response.headers['set-cookie'];
  });

  const userPayload: Omit<User, 'avatar' | 'quotes' | 'votes'> = {
    username: 'uncledoe',
    name: 'Uncle',
    surname: 'Doe',
    email: 'uncledoe@email.com',
    pass: 'uncleDoe@26',
  };

  const quotePayloads: Pick<Quote, 'content'>[] = [
    {
      content: 'Carpe diem',
    },
    {
      content: 'Memento mori',
    },
  ];

  const quotes: Omit<Quote, 'user' | 'votes'>[] = [];

  let response: Response;

  let cookie = '';

  describe('/quoting/me/myquote (POST)', () => {
    it('Results in created quote record and its identifier returned', async () => {
      let createQuoteDTO: CreateQuoteDTO = quotePayloads[0];

      response = await request(app.getHttpServer())
        .post('/quoting/me/myquote')
        .set('Cookie', cookie)
        .send(createQuoteDTO)
        .expect(201);

      quotes.push({
        id: response.body[0].id,
        content: createQuoteDTO.content,
        written: moment().toISOString(),
        updated: null,
      });

      createQuoteDTO = quotePayloads[1];

      response = await request(app.getHttpServer())
        .post('/quoting/me/myquote')
        .set('Cookie', cookie)
        .send(createQuoteDTO)
        .expect(201);

      quotes.push({
        id: response.body[0].id,
        content: createQuoteDTO.content,
        written: moment().toISOString(),
        updated: null,
      });
    });
  });

  describe('/quoting (GET)', () => {
    it('Results in an array of none or many quote objects', async () => {
      const filterQuotesDTO: GetQuoteDTO = {
        searchFor: 'mostLiked',
        author: userPayload.username,
        limit: 10,
      };

      response = await request(app.getHttpServer())
        .get('/quoting')
        .send(filterQuotesDTO)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array<Quote>);
    });
  });

  describe('/quoting/:id (GET)', () => {
    it('Results in a quote object holding a content property', async () => {
      const getQuoteDTO: GetQuoteDTO = {
        author: userPayload.username,
        limit: 10,
      };

      response = await request(app.getHttpServer())
        .get(`/quoting/${quotes[0].id}`)
        .send(getQuoteDTO)
        .expect(200);

      expect(response.body).toHaveProperty<string>(
        'content',
        quotes[0].content,
      );
    });
  });

  describe('/quoting/rand/one (GET)', () => {
    it('Results in a quote object holding a content property', async () => {
      response = await request(app.getHttpServer())
        .get('/quoting/rand/one')
        .send()
        .expect(200);

      expect(response.body).toHaveProperty<string>('content');
    });
  });

  describe('/quoting/karma/:username (GET)', () => {
    it('Results in an object holding quotes and karma properties', async () => {
      response = await request(app.getHttpServer())
        .get(`/quoting/karma/${userPayload.username}`)
        .send()
        .expect(200);

      expect(response.body).toHaveProperty<number>('quotes');
      expect(response.body).toHaveProperty<number>('karma');
    });
  });

  describe('/quoting/me/myquote/:id (PATCH)', () => {
    it('Results in a text designating the number of affected updated records', async () => {
      const updateQuoteDTO: CreateQuoteDTO = {
        content: 'CARPE DIEM',
      };

      response = await request(app.getHttpServer())
        .patch(`/quoting/me/myquote/${quotes[0].id}`)
        .set('Cookie', cookie)
        .send(updateQuoteDTO)
        .expect(200);

      expect(response.text).toEqual('1');
    });
  });

  describe('/quoting/:id/vote (PATCH)', () => {
    it('Results in created vote record and its identifier returned', async () => {
      const voteOnQuoteDTO: VoteOnQuoteDTO = {
        vote: 'up',
      };

      response = await request(app.getHttpServer())
        .patch(`/quoting/${quotes[0].id}/vote`)
        .set('Cookie', cookie)
        .send(voteOnQuoteDTO)
        .expect(200);

      expect(JSON.parse(response.text)).toHaveProperty('id');
    });
  });

  describe('/quoting/me/:id (DELETE)', () => {
    it('Results in deleted quote and its belonging vote records', async () => {
      response = await request(app.getHttpServer())
        .delete(`/quoting/me/${quotes[0].id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

      expect(response.text).toEqual('1');
    });
  });

  afterAll(async () => {
    let response: request.Response;

    const authCredentialsDTO: AuthCredentialsDTO = userPayload;

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authCredentialsDTO);

    cookie = response.headers['set-cookie'];

    for (const quote of quotes) {
      await request(app.getHttpServer())
        .delete(`/quoting/me/${quote.id}`)
        .set('Cookie', cookie)
        .send();
    }

    await request(app.getHttpServer())
      .delete(`/auth/${userPayload.username}`)
      .set('Cookie', cookie)
      .send();

    await app.close();
  });
});
