import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NovelStatus } from '@prisma/client';

export class NovelQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(NovelStatus)
  status?: NovelStatus;
}
