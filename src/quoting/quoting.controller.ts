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
import { Public } from '../auth/decorators/public.decorator';
import FilterQuotesDTO from './dto/filter-quotes.dto';
import GetUser from '../common/decorators/get-user.decorator';
import User from '../auth/entities/user.entity';
import CreateQuoteDTO from './dto/create-quote.dto';
import GetQuoteDTO from './dto/get-quote.dto';
import VoteOnQuoteDTO from './dto/vote-on-quote.dto';

@Controller('quoting')
export class QuotingController {
  @Public()
  @Get()
  getQuotes(
    @Query() filterQuotesDTO: FilterQuotesDTO,
    @GetUser() user?: User,
  ) {}

  @Public()
  @Get('/:id')
  getQuote(@Param() getQuoteDTO: GetQuoteDTO, @GetUser() user?: User) {}

  @Public()
  @Get('/rand/one')
  getRandomQuote(@GetUser() user?: User) {}

  @Public()
  @Get('/karma/:username')
  getQuoteKarma(@Param('username') username: string) {}

  @Post('/me/myquote')
  createQuote(@GetUser() user: User, @Body() createQuoteDTO: CreateQuoteDTO) {}

  @Patch('/me/myquote/:id')
  updateQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() createQuoteDTO: CreateQuoteDTO,
  ) {}

  @Patch('/:id/vote')
  voteOnQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() voteOnQuoteDTO: VoteOnQuoteDTO,
  ) {}

  @Delete('/me/:id')
  unQuote(@GetUser() user: User, @Param('id') id: string) {}
}
