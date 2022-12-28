import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './quote.entity';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';


@Module({
  imports: [TypeOrmModule.forFeature([Quote])],
  controllers: [QuotesController],
  providers: [QuotesService]
})
export class QuotesModule {}
