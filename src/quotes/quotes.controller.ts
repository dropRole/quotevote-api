import { Body, Controller, Post } from '@nestjs/common';
import { Delete, Get, Param, Patch, Query } from '@nestjs/common/decorators';
import { CreateUpdateQuoteDTO } from './dto/create-update-quote.dto';
import { Quote } from './quote.entity';

@Controller('quotes')
export class QuotesController {
  @Get()
  async getQuotes(@Query('search') search: string): Promise<Quote[]> {
    return [new Quote()];
  }

  @Get('/:id')
  async getQuote(@Param('id') id: string): Promise<Quote> {
    return new Quote();
  }

  @Get('/karma/:username')
  getQuoteKarma(
    @Param('username') username: string,
  ): Promise<{ quotes: Quote[]; karma: number }> {}

  @Post('/me/myquote')
  async createQuote(
    @Body() createUpdateQuoteDTO: CreateUpdateQuoteDTO,
  ): Promise<void> {}

  @Patch('/me/myquote/:id')
  async updateQuote(
    @Param('id') id: string,
    @Body() createUpdateQuoteDTO: CreateUpdateQuoteDTO,
  ): Promise<void> {}

  @Patch('/:id/upvote')
  async quoteUpVote(@Param('id') id: string): Promise<void> {}

  @Patch('/:id/downvote')
  async quoteDownVote(@Param('id') id: string): Promise<void> {}

  @Delete('/me/:id')
  async unQuote(@Param('id') id: string): Promise<void> {}
}
