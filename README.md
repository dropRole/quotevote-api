## QuoteVote API

The RESTful API developed via NestJS framework that enables the user to register, publish, track and rate other user quotes

## Installation

### Optional prerequisite

Globally enable Yarn package manager or use npm instead to manage dependencies and run scripts

```bash
# all dependencies
$ yarn install
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
- MOCK_USER - mock user username used for database-preceeding
- MOCK_USER_PASS - mock user pass used for database-preseeding
- CORS_ORIGIN - to configure the access-control-allow-origin CORS option 

### Database pre-seeding
```bash
# seed the database with the inital data
$ yarn db:seed
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# run unit tests
$ yarn test
```