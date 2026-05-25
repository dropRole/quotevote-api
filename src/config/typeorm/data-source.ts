import * as dotenv from 'dotenv';
import { SeederOptions } from 'typeorm-extension';
import { DataSource, DataSourceOptions } from 'typeorm';
import UserSeeder from './seeders/user.seeder';
import QuoteSeeder from './seeders/quote.seeder';
import User from '../../auth/entities/user.entity';
import Quote from '../../quotes/entities/quote.entity';
import Vote from '../../quotes/entities/vote.entity';

dotenv.config({ path: `src/config/env/.env.stage.${process.env.STAGE}` });

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : undefined,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  entities: [User, Quote, Vote],
  seeds: [UserSeeder, QuoteSeeder],
};

export const dataSource: DataSource = new DataSource(options);
