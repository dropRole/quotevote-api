import * as Joi from 'joi';
import { ConfigModuleOptions } from '@nestjs/config';

const EnvConfigValidationSchema: Joi.ObjectSchema = Joi.object({
  PG_HOST: Joi.string().default('localhost'),
  PG_PORT: Joi.number().default(5432),
  PG_USER: Joi.string().default('postgres'),
  PG_PASS: Joi.string().default('postgres'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().required(),
});

export const EnvConfig: ConfigModuleOptions = {
  validationSchema: EnvConfigValidationSchema,
  envFilePath: `./src/config/.env.stage.${process.env.STAGE}`,
};
