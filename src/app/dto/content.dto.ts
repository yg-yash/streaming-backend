import { IsString, IsNotEmpty, IsOptional, IsNumberString, IsIn } from 'class-validator';

export class FindAllContentDto {
  @IsOptional()
  @IsString()
  @IsIn(['Movie', 'TVShow'])
  type?: 'Movie' | 'TVShow';

  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}
