import { Module } from '@nestjs/common';
import FileLogger from './file-logger.service';

@Module({
  providers: [FileLogger],
  exports: [FileLogger],
})
export class LoggerModule {}
