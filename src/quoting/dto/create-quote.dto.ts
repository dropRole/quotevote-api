import { IsString, MaxLength } from 'class-validator';

export default class CreateQuoteDTO {
  @IsString()
  @MaxLength(500)
  content: string;
}
