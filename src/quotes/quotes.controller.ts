import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import FilterQuotesDTO from './dto/filter-quotes.dto';
import GetUser from 'src/common/decorators/get-user.decorator';
import User from 'src/auth/entities/user.entity';
import CreateQuoteDTO from './dto/create-quote.dto';
import GetQuoteDTO from './dto/get-quote.dto';
import VoteOnQuoteDTO from './dto/vote-on-quote.dto';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Public()
  @Get()
  getQuotes(@Query() filterQuotesDTO: FilterQuotesDTO, @GetUser() user?: User) {
    return this.quotesService.getQuotes(filterQuotesDTO, user);
  }

  @Public()
  @Get('/:id')
  getQuote(@Param() getQuoteDTO: GetQuoteDTO, @GetUser() user?: User) {
    return this.quotesService.getQuote(getQuoteDTO, user);
  }

  @Public()
  @Get('/rand/one')
  getRandomQuote(@GetUser() user?: User) {
    return this.quotesService.getRandomQuote(user);
  }

  @Public()
  @Get('/karma/:username')
  getQuoteKarma(@Param('username') username: string) {
    return this.quotesService.getQuoteKarma(username);
  }

  @Post('/me/myquote')
  createQuote(@GetUser() user: User, @Body() createQuoteDTO: CreateQuoteDTO) {
    return this.quotesService.createQuote(user, createQuoteDTO);
  }

  @Patch('/me/myquote/:id')
  updateQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() createQuoteDTO: CreateQuoteDTO,
  ) {
    return this.quotesService.updateQuote(user, id, createQuoteDTO);
  }

  @Patch('/:id/vote')
  voteOnQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() voteOnQuoteDTO: VoteOnQuoteDTO,
  ) {
    return this.quotesService.voteOnQuote(user, id, voteOnQuoteDTO);
  }

  @Delete('/me/:id')
  unQuote(@GetUser() user: User, @Param('id') id: string) {
    return this.quotesService.unQuote(user, id);
  }
}
