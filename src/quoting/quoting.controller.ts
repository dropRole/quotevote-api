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
import { QuotingService } from './quoting.service';

@Controller('quoting')
export class QuotingController {
  constructor(private quotingService: QuotingService) {}

  @Public()
  @Get()
  getQuotes(@Query() filterQuotesDTO: FilterQuotesDTO, @GetUser() user?: User) {
    return this.quotingService.getQuotes(filterQuotesDTO, user);
  }

  @Public()
  @Get('/:id')
  getQuote(@Param() getQuoteDTO: GetQuoteDTO, @GetUser() user?: User) {
    return this.quotingService.getQuote(getQuoteDTO, user);
  }

  @Public()
  @Get('/rand/one')
  getRandomQuote(@GetUser() user?: User) {
    return this.quotingService.getRandomQuote(user);
  }

  @Public()
  @Get('/karma/:username')
  getQuoteKarma(@Param('username') username: string) {
    return this.quotingService.getQuoteKarma(username);
  }

  @Post('/me/myquote')
  createQuote(@GetUser() user: User, @Body() createQuoteDTO: CreateQuoteDTO) {
    return this.quotingService.createQuote(user, createQuoteDTO);
  }

  @Patch('/me/myquote/:id')
  updateQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() createQuoteDTO: CreateQuoteDTO,
  ) {
    return this.quotingService.updateQuote(user, id, createQuoteDTO);
  }

  @Patch('/:id/vote')
  voteOnQuote(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() voteOnQuoteDTO: VoteOnQuoteDTO,
  ) {
    return this.quotingService.voteOnQuote(user, id, voteOnQuoteDTO);
  }

  @Delete('/me/:id')
  unQuote(@GetUser() user: User, @Param('id') id: string) {
    return this.quotingService.unQuote(user, id);
  }
}
