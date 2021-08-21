DROP DATABASE IF EXISTS qa;

CREATE DATABASE qa;

\c qa

CREATE TABLE questions_staging (
  question_id integer PRIMARY KEY,
  product_id integer,
  question_body text,
  question_date bigint,
  asker_name text,
  asker_email text,
  reported boolean,
  question_helpfulness integer
);

CREATE TABLE questions (
  question_id integer PRIMARY KEY,
  product_id integer,
  question_body text,
  question_date timestamp DEFAULT CURRENT_TIMESTAMP(0),
  asker_name text,
  asker_email text,
  reported boolean DEFAULT false,
  question_helpfulness integer DEFAULT 0
);

CREATE TABLE answers_staging (
  answer_id integer PRIMARY KEY,
  question_id integer,
  body text,
  date bigint,
  answerer_name text,
  answerer_email text,
  reported boolean,
  helpfulness integer
);

CREATE TABLE answers (
  answer_id integer PRIMARY KEY,
  question_id integer REFERENCES questions ON DELETE CASCADE,
  body text,
  date timestamp DEFAULT CURRENT_TIMESTAMP(0),
  answerer_name text,
  answerer_email text,
  reported boolean DEFAULT false,
  helpfulness integer DEFAULT 0
);

CREATE TABLE photos (
  id integer PRIMARY KEY,
  answer_id integer REFERENCES answers ON DELETE CASCADE,
  url text
);

COPY questions_staging from 'C:\Users\mamin\Desktop\qadata\questions.csv' delimiter ',' csv header;

INSERT INTO questions (question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
SELECT question_id, product_id, question_body, to_timestamp(question_date/1000), asker_name, asker_email, reported, question_helpfulness
FROM questions_staging;

COPY answers_staging from 'C:\Users\mamin\Desktop\qadata\answers.csv' delimiter ',' csv header;
INSERT INTO answers (answer_id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
SELECT answer_id, question_id, body, to_timestamp(date/1000), answerer_name, answerer_email, reported, helpfulness
FROM answers_staging;

COPY photos from 'C:\Users\mamin\Desktop\qadata\answers_photos.csv' delimiter ',' csv header;

-- DROP staging tables
DROP TABLE questions_staging;
DROP TABLE answers_staging;