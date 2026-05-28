import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Quote from './entities/quote.entity';
import Vote from './entities/vote.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Quote, Vote]), LoggerModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
