import { IsString, IsArray, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateNovelDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  author_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  novel_summary?: string;

  @IsOptional()
  @IsArray()
  categories?: string[];
}
