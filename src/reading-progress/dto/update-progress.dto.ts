import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  novelId: string;

  @IsInt()
  @Min(1)
  lastChapter: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
