import { IsOptional, IsString, IsInt, IsIn, IsObject, IsArray, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCvDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(20)
  fontSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  personalInfo?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sections?: Record<string, any>[];
}
