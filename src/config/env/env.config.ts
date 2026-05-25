import { ConfigModuleOptions } from '@nestjs/config';
import * as joi from 'joi';

const ENV_CONFIG: ConfigModuleOptions = {
  cache: true,
  envFilePath: `src/config/env/.env.stage.${process.env.STAGE}`,
  validationSchema: joi.object({
    PORT: joi.number().required(),
    PG_HOST: joi.string().required(),
    PG_PORT: joi.number().required(),
    PG_DB: joi.string().required(),
    PG_USER: joi.string().required(),
    PG_PASS: joi.string().required(),
    MOCK_USER: joi.string().required(),
    MOCK_USER_PASS: joi.string().required(),
    CORS_ORIGIN: joi.string().required(),
  }),
};

export default ENV_CONFIG;
