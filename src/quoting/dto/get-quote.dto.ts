import { IsUUID } from 'class-validator';

export default class GetQuoteDTO {
  @IsUUID()
  id: string;
}
