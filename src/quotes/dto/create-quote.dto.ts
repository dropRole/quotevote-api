import { IsString, MaxLength } from 'class-validator';

export default class CreateUpdateQuoteDTO {
  @IsString()
  @MaxLength(500)
  content: string;
}
