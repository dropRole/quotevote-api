import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { App } from 'supertest/types';
import ENV_CONFIG from '../src/config/env/env.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import * as request from 'supertest';
import { type Response } from 'supertest';
import User from '../src/auth/entities/user.entity';
import TYPEORM_CONFIG from '../src/config/typeorm/typeorm.config';
import Quote from '../src/quoting/entities/quote.entity';
import Vote from '../src/quoting/entities/vote.entity';
import * as cookieParser from 'cookie-parser';
import BasicsUpdateDTO from '../src/auth/dto/basics-update.dto';
import { JWTGuard } from '../src/auth/guards/jwt.guard';
import AuthCredentialsDTO from 'src/auth/dto/auth-credentials.dto';
import SignupDTO from 'src/auth/dto/signup.dto';
import PassUpdateDTO from 'src/auth/dto/pass-update.dto';

describe('Users', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
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

    let signupDTO: SignupDTO = userPayloads[0];

    await request(app.getHttpServer()).post('/auth/signup').send(signupDTO);

    signupDTO = userPayloads[1];

    await request(app.getHttpServer()).post('/auth/signup').send(signupDTO);

    const authCredentialsDTO: AuthCredentialsDTO = userPayloads[0];

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authCredentialsDTO);

    cookie = response.headers['set-cookie'];
  });

  let response: Response;

  let cookie = '';

  const userPayloads: Omit<User, 'avatar' | 'quotes' | 'votes'>[] = [
    {
      username: 'janedoe',
      name: 'Jane',
      surname: 'Doe',
      email: 'janedoe@email.com',
      pass: 'janeDoe@26',
    },
    {
      username: 'babydoe',
      name: 'Baby',
      surname: 'Doe',
      email: 'babydoe@email.com',
      pass: 'babyDoe@26',
    },
  ];

  describe('/users/me (GET)', () => {
    it("Returns the logged in user's information", async () => {
      response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', cookie)
        .send()
        .expect(200);

      expect(response.body).toHaveProperty('username');
    });
  });

  describe('/users/me/avatar (GET)', () => {
    it('Results in a bad request exception due to missing path query param', async () => {
      request(app.getHttpServer()).get('/users/me/avatar').send().expect(400);
    });

    it('Results in a not found exception when avatar cannot be found', async () => {
      response = await request(app.getHttpServer())
        .get(`/users/me/avatar?path=uploads/profile_avatar.png`)
        .send()
        .expect(404);

      expect(response.body.message).toEqual('Avatar was not found.');
    });
  });

  describe('/users/me/basics (PATCH)', () => {
    const basicsUpdateDTO: BasicsUpdateDTO = {
      ...userPayloads[0],
      username: userPayloads[1].username,
    };

    it('Results in a bad request exception due to missing mandatory payload', async () => {
      await request(app.getHttpServer())
        .patch('/users/me/basics')
        .set('Cookie', cookie)
        .send()
        .expect(400);
    });

    it('Results in a conflict exception when provided username already exists', async () => {
      response = await request(app.getHttpServer())
        .patch(`/users/me/basics`)
        .set('Cookie', cookie)
        .send(basicsUpdateDTO)
        .expect(409);

      expect(response.body.message).toEqual(
        `Username ${basicsUpdateDTO.username} already exists.`,
      );
    });

    it('Results in a newly issued auth cookie when username is updated', async () => {
      userPayloads[0].username = `${userPayloads[0].username}_new`;

      basicsUpdateDTO.username = userPayloads[0].username;

      response = await request(app.getHttpServer())
        .patch(`/users/me/basics`)
        .set('Cookie', cookie)
        .send(basicsUpdateDTO);

      expect(response.headers['set-cookie']).toBeDefined();

      cookie = response.headers['set-cookie'];
    });
  });

  describe('/users/me/pass (PATCH)', () => {
    const passUpdateDTO: PassUpdateDTO = {
      currentPass: `${userPayloads[0].pass}_invalid`,
      newPass: `${userPayloads[0].pass}_new`,
    };

    it('Results in a bad request exception due to missing mandatory payload', async () => {
      await request(app.getHttpServer())
        .patch('/users/me/pass')
        .set('Cookie', cookie)
        .send()
        .expect(400);
    });

    it('Results in a conflict exception due to invalid current password', async () => {
      response = await request(app.getHttpServer())
        .patch('/users/me/pass')
        .set('Cookie', cookie)
        .send(passUpdateDTO)
        .expect(409);

      expect(response.body.message).toEqual('Incorrect password.');
    });

    it('Results in an affected user record', async () => {
      passUpdateDTO.currentPass = userPayloads[0].pass;

      userPayloads[0].pass = `${userPayloads[0].pass}_new`;

      await request(app.getHttpServer())
        .patch('/users/me/pass')
        .set('Cookie', cookie)
        .send(passUpdateDTO)
        .expect(200);
    });
  });

  describe('/users/me/avatar-upload (PATCH)', () => {
    it('Results in a payload exception due to file exceeding the size limit', async () => {
      response = await request(app.getHttpServer())
        .patch('/users/me/avatar-upload')
        .set('Cookie', cookie)
        .attach('avatar', Buffer.alloc(200000), 'file.png')
        .expect(413);

      expect(response.body.message).toEqual('File too large');
    });

    it('Results in a bad request exception due to file type not being supported', async () => {
      response = await request(app.getHttpServer())
        .patch('/users/me/avatar-upload')
        .set('Cookie', cookie)
        .attach('avatar', Buffer.alloc(100000), 'file.mp3')
        .expect(400);

      expect(response.body.message).toEqual(
        'File is not in PNG, JPEG or WEBP MIME types.',
      );
    });

    it('Results in an affected user record and uploaded file', async () => {
      await request(app.getHttpServer())
        .patch('/users/me/avatar-upload')
        .set('Cookie', cookie)
        .attach('avatar', Buffer.alloc(100), 'file.png')
        .expect(200);
    });
  });

  describe('/users/me/avatar (GET)', () => {
    it("Streams the logged in user's avatar", async () => {
      let path = '';

      response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', cookie)
        .send();

      path = response.body.avatar;

      response = await request(app.getHttpServer())
        .get(`/users/me/avatar?path=${path}`)
        .send()
        .expect(200);

      expect(response.body).toBeInstanceOf(Buffer);
    });
  });

  describe('/users/me/avatar-unlink (DELETE)', () => {
    it('Results in an affected user record and deleted file', async () => {
      await request(app.getHttpServer())
        .delete('/users/me/avatar-unlink')
        .set('Cookie', cookie)
        .expect(200);
    });
  });

  afterAll(async () => {
    let response: Response;

    let authCredentialsDTO: AuthCredentialsDTO = userPayloads[0];

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authCredentialsDTO);

    cookie = response.headers['set-cookie'];

    await request(app.getHttpServer())
      .delete(`/auth/${userPayloads[0].username}`)
      .set('Cookie', cookie)
      .send();

    authCredentialsDTO = userPayloads[1];

    response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(authCredentialsDTO);

    cookie = response.headers['set-cookie'];

    await request(app.getHttpServer())
      .delete(`/auth/${userPayloads[1].username}`)
      .set('Cookie', cookie)
      .send();

    await app.close();
  });
});
