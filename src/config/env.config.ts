import * as Joi from 'joi';
import { ConfigModuleOptions } from '@nestjs/config';

const EnvConfigValidationSchema: Joi.ObjectSchema = Joi.object({});

export const EnvConfig: ConfigModuleOptions = {
  validationSchema: EnvConfigValidationSchema,
  envFilePath: `./src/config/.env.stage.${process.env.STAGE}`,
};
