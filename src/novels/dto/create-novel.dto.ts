import { IsString, IsArray, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateNovelDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  author_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  novel_summary: string;

  @IsArray()
  @IsNotEmpty()
  categories: string[];
}
