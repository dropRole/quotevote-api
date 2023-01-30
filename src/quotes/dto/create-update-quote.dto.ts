import { IsString, MaxLength } from 'class-validator';

export class CreateUpdateQuoteDTO {
  @IsString()
  @MaxLength(400)
  quote: string;
}
