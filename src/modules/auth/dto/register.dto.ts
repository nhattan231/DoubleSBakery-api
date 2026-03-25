import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@doublebakery.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: ['admin', 'staff'], default: 'staff' })
  @IsOptional()
  @IsIn(['admin', 'staff'])
  role?: 'admin' | 'staff';
}
