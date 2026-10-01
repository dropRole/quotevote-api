import { Module } from '@nestjs/common';
import { QuotingController } from './quoting.controller';
import { QuotingService } from './quoting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Quote from './entities/quote.entity';
import Vote from './entities/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quote, Vote])],
  controllers: [QuotingController],
  providers: [QuotingService],
})
export class QuotingModule {}
