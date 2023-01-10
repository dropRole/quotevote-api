import { Body, Controller, Post } from '@nestjs/common';
import { Delete, Get, Param, Patch, Query } from '@nestjs/common/decorators';
import { GetUser } from 'src/auth/get-user.decorator';
import { Public } from 'src/auth/public.decorator';
import { User } from 'src/auth/user.entity';
import { CreateUpdateQuoteDTO } from './dto/create-update-quote.dto';
import { GetFilterDTO } from './dto/get-filter.dto';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Public()
  @Get()
  getQuotes(
    @Query() getFilterDTO: GetFilterDTO,
    @Body('username') username?: string,
  ): Promise<Record<any, any>[]> {
    return this.quotesService.getQuotes(getFilterDTO, username);
  }

  @Public()
  @Get('/:id')
  getQuote(
    @Param('id') id: string,
    @Body('username') username?: string,
  ): Promise<Record<any, any>> {
    return this.quotesService.getQuote(id, username);
  }

  @Public()
  @Get('/rand/one')
  getRandomQuote(
    @Body('username') username?: string,
  ): Promise<Record<any, any>> {
    return this.quotesService.getQuote(undefined, username);
  }

  @Post('/me/myquote')
  createQuote(
    @GetUser() user: User,
    @Body() createUpdateQuoteDTO: CreateUpdateQuoteDTO,
  ): Promise<void> {
    return this.quotesService.createQuote(user, createUpdateQuoteDTO);
  }

  @Patch('/me/myquote/:id')
  updateQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() createUpdateQuoteDTO: CreateUpdateQuoteDTO,
  ): Promise<void> {
    return this.quotesService.updateQuote(user, id, createUpdateQuoteDTO);
  }

  @Patch('/:id/upvote')
  quoteUpVote(@GetUser() user: User, @Param('id') id: string): Promise<void> {
    return this.quotesService.quoteUpVote(user, id);
  }

  @Patch('/:id/downvote')
  quoteDownVote(@GetUser() user: User, @Param('id') id: string): Promise<void> {
    return this.quotesService.quoteDownVote(user, id);
  }

  @Delete('/me/:id')
  unQuote(@GetUser() user: User, @Param('id') id: string): Promise<void> {
    return this.quotesService.unQuote(user, id);
  }
}
