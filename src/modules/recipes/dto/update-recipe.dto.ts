import {
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateRecipeItemDto {
  @ApiPropertyOptional({ description: 'Ingredient ID (bắt buộc nếu không có supplyId)' })
  @IsOptional()
  @IsUUID()
  ingredientId?: string;

  @ApiPropertyOptional({ description: 'Supply ID (bắt buộc nếu không có ingredientId)' })
  @IsOptional()
  @IsUUID()
  supplyId?: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0.001)
  quantity: number;
}

export class UpdateRecipeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [UpdateRecipeItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecipeItemDto)
  items?: UpdateRecipeItemDto[];
}
