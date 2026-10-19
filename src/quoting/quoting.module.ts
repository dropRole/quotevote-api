import { Module } from '@nestjs/common';
import { QuotingController } from './quoting.controller';
import { QuotingService } from './quoting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Quote from './entities/quote.entity';
import Vote from './entities/vote.entity';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Quote, Vote]), LoggerModule],
  controllers: [QuotingController],
  providers: [QuotingService],
})
export class QuotingModule {}
