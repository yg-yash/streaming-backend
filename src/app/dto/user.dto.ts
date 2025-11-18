import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteGenres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dislikedGenres?: string[];
}

export class GetUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
