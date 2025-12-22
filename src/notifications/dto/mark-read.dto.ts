import { IsArray, IsInt } from 'class-validator';

export class MarkReadDto {
  @IsArray()
  @IsInt({ each: true })
  notification_ids: number[];
}
