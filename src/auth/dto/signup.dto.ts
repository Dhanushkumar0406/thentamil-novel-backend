import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class SignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
