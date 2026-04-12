import { IsOptional, IsString } from 'class-validator';

export class FilterQuotesDTO {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  limit?: number;
}
