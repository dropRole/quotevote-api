import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import TYPEORM_CONFIG from '../src/config/typeorm/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import ENV_CONFIG from '../src/config/env/env.config';
import User from '../src/auth/entities/user.entity';
import Quote from '../src/quoting/entities/quote.entity';
import Vote from '../src/quoting/entities/vote.entity';

describe('Auth', () => {
  let app: INestApplication<App>;

  const payload = {
    name: 'John',
    surname: 'Doe',
    email: 'johndoe@email.com',
    username: 'johndoe',
    pass: 'johnDoe@26',
  };

  let cookie = '';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot(ENV_CONFIG),
        TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
        TypeOrmModule.forFeature([User, Quote, Vote]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.use(cookieParser());
    await app.init();
  });

  describe('/auth/signup (POST)', () => {
    it('Results in created user record', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .expect(201);
    });

    it('Results in a username conflict exception', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(payload);

      expect(response.body.message).toEqual(
        `Username ${payload.username} already exists.`,
      );
    });

    it('Results in a bad request exception due to missing mandatory payload', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send()
        .expect(400);
    });
  });

  describe('/login (POST)', () => {
    it('Issues an auth cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: payload.username, pass: payload.pass })
        .expect(201);

      cookie = response.headers['set-cookie'];
    });

    it('Results in unauthorized exception due to invalid user credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: payload.username,
          pass: `${payload.pass}_invalid`,
        });

      expect(response.body.message).toEqual('Check your credentials.');
    });

    it('Results in a bad request exception due to missing mandatory payload', async () => {
      await request(app.getHttpServer()).post('/auth/login').send().expect(400);
    });
  });

  describe('/logout (POST)', () => {
    it('Expires an auth cookie', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookie)
        .send()
        .expect(201);

      cookie = '';
    });
  });

  afterAll(async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: payload.username, pass: payload.pass })
      .expect(201);

    cookie = response.headers['set-cookie'];

    await request(app.getHttpServer())
      .delete(`/auth/${payload.username}`)
      .set('Cookie', cookie)
      .send();

    await app.close();
  });
});
