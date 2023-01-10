import { IsOptional, IsString } from 'class-validator';

export class GetFilterDTO {
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
