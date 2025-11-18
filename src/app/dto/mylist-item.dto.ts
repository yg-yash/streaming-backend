import { IsString, IsNotEmpty, IsOptional, IsNumberString } from 'class-validator';

export class CreateMyListItemDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  contentId: string;
}

export class GetMyListDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;
}

export class DeleteMyListItemDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  contentId: string;
}
