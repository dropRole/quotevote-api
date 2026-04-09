import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthModule,
    QuotesModule,
    ConfigModule.forRoot(EnvConfig),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
