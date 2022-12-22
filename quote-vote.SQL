/*
Created: 22/12/2022
Modified: 22/12/2022
Model: PostgreSQL 10
Database: PostgreSQL 10
*/


-- Create tables section -------------------------------------------------

-- Table users

CREATE TABLE "users"(
 "username" Character varying(20) NOT NULL,
 "pass" Character varying(64) NOT NULL,
 "name" Character varying(13) NOT NULL,
 "surname" Character varying(20) NOT NULL,
 "email" Character varying(64) NOT NULL
)
WITH (
 autovacuum_enabled=true)
;

-- Add keys for table users

ALTER TABLE "users" ADD CONSTRAINT "PK_users" PRIMARY KEY ("username")
;

-- Table quotes

CREATE TABLE "quotes"(
 "id" UUID NOT NULL,
 "quote" Character varying(400) NOT NULL,
 "upvotes" Smallint DEFAULT 0 NOT NULL,
 "downvotes" Smallint DEFAULT 0 NOT NULL,
 "username" Character varying(20) NOT NULL
)
WITH (
 autovacuum_enabled=true)
;

-- Create indexes for table quotes

CREATE INDEX "IX_users_quotes" ON "quotes" ("username")
;

-- Add keys for table quotes

ALTER TABLE "quotes" ADD CONSTRAINT "PK_quotes" PRIMARY KEY ("id")
;
-- Create foreign keys (relationships) section ------------------------------------------------- 

ALTER TABLE "quotes" ADD CONSTRAINT "users_quotes" FOREIGN KEY ("username") REFERENCES "users" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
;




