import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  STAGE: Joi.string().required(),
  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.string().required().default(5432),
  PG_DB: Joi.string().required(),
  PG_USER: Joi.string().required(),
  PG_PASS: Joi.string().required(),
});
