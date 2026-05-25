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

@Controller('quotes')
export class QuotesController {
  @Public()
  @Get()
  getQuotes(
    @Query() filterQuotesDTO: FilterQuotesDTO,
    @GetUser() user?: User,
  ) {}

  @Public()
  @Get('/:id')
  getQuote(@Param('id') id: string, @GetUser() user?: User) {}

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

  @Patch('/:id/upvote')
  quoteUpVote(@GetUser() user: User, @Param('id') id: string) {}

  @Patch('/:id/downvote')
  quoteDownVote(@GetUser() user: User, @Param('id') id: string) {}

  @Delete('/me/:id')
  unQuote(@GetUser() user: User, @Param('id') id: string) {}
}
