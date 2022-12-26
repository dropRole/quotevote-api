import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { APP_GUARD } from '@nestjs/core';
import { JWTGuard } from './auth/jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PG_HOST'),
        port: configService.get('PG_PORT'),
        database: configService.get('PG_DB'),
        username: configService.get('PG_USER'),
        password: configService.get('PG_PASS'),
        autoLoadEntities: true,
        synchronize: process.env.STAGE === 'dev' ? true : false,
      }),
    }),
    AuthModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JWTGuard }],
})
export class AppModule {}
