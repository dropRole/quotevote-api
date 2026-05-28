import { IsIn } from 'class-validator';

export default class VoteOnQuoteDTO {
  @IsIn(['up', 'down'])
  vote: 'up' | 'down';
}
