import { DataSource } from 'typeorm';

export const source = new DataSource({
  type: 'postgres',
  host: '194.249.251.33',
  port: 5432,
  database: 'quote-vote-droprole',
  username: 'sum2212',
  password: 'Univ3s3+045',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
