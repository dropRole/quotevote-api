## QuoteVote API

The RESTful API developed via NestJS framework for QuoteVote web app that enables the user to register, publish, track and rate other user quotes

## Installation

```bash
$ npm install
```

## Local Configuration

### Environment

Create .env.stage.{dev|prod} file within the root dir and properly configure the environment by defining the env vars regarding the configuration schema

#### Schema requirements

- PORT - web server port to listen to
- PG_HOST - address of the Postgres database server host
- PG_PORT - Postgres database server port used to establish connection with
- PG_DB - name of Postgres database on the database server
- PG_USER - username of Postgres database user
- PG_PASS - password of Postgres database user
- JWT_SECRET - string to sign and verify JWTs

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test
```
