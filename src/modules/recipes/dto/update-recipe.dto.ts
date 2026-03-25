import {
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateRecipeItemDto {
  @ApiProperty({ description: 'Ingredient ID' })
  @IsUUID()
  @IsNotEmpty()
  ingredientId: string;

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
