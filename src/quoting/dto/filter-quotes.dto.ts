import { IsIn, IsOptional, IsString } from 'class-validator';

export default class FilterQuotesDTO {
  @IsOptional()
  @IsIn(['mostLiked', 'leastLiked', 'recent', 'votedFor'])
  searchFor?: 'mostLiked' | 'leastLiked' | 'recent' | 'votedFor';

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  limit?: number;
}
