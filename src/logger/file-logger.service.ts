import { createLogger, format, Logger } from 'winston';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FileLogger {
  private logger: Logger;

  constructor() {
    const logDir = join(process.cwd(), '/logs');

    if (!existsSync(logDir)) mkdirSync(logDir);

    const fileTransportOptions = new DailyRotateFile({
      filename: join(logDir, '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      auditFile: join(logDir, 'audit.json'),
      format: format.combine(format.timestamp(), format.json()),
    });

    this.logger = createLogger({
      level: 'error',
      levels: {
        error: 0,
      },
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [fileTransportOptions],
      exceptionHandlers: [fileTransportOptions],
      exitOnError: false,
    });
  }

  error(message: string, context?: string) {
    this.logger.error(message, { context });
  }
}
