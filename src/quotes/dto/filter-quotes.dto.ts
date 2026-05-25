import { IsOptional, IsString } from 'class-validator';

export default class FilterQuotesDTO {
  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  limit?: number;
}
