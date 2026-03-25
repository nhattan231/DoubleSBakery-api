import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IngredientUnit } from '../entities/ingredient.entity';

const VALID_UNITS: IngredientUnit[] = ['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];

export class CreateIngredientDto {
  @ApiProperty({ example: 'Bột mì' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: VALID_UNITS })
  @IsNotEmpty()
  @IsIn(VALID_UNITS)
  unit: IngredientUnit;

  @ApiPropertyOptional({ example: 5000, description: 'Current stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Minimum stock threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ example: 25, description: 'Cost per unit (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @ApiPropertyOptional({ example: '/uploads/ingredient.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['/uploads/img1.jpg'] })
  @IsOptional()
  @IsArray()
  images?: string[];
}
