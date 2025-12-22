import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateChapterDto {
  @IsInt()
  @Min(1)
  chapter_number: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  chapter_type: string;

  @IsUrl()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(100)
  content: string;

  @IsString()
  @IsNotEmpty()
  novel_id: string;
}
