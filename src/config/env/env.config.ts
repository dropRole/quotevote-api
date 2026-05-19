import { ConfigModuleOptions } from '@nestjs/config';
import * as joi from 'joi';

const ENV_CONFIG: ConfigModuleOptions = {
  cache: true,
  envFilePath: `src/config/env/.env.stage.${process.env.STAGE}`,
  validationSchema: joi.object({
    PORT: joi.number().required(),
  }),
};

export default ENV_CONFIG;
