import { Module } from '@nestjs/common';
import { QuotingController } from './quoting.controller';
import { QuotingService } from './quoting.service';

@Module({
  controllers: [QuotingController],
  providers: [QuotingService],
})
export class QuotingModule {}
