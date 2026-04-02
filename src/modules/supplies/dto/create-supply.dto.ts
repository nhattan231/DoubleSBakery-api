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
import { SupplyUnit } from '../entities/supply.entity';

const VALID_UNITS: SupplyUnit[] = ['piece', 'pack', 'roll', 'sheet', 'box', 'bag'];

export class CreateSupplyDto {
  @ApiProperty({ example: 'Hộp bánh 18cm' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: VALID_UNITS })
  @IsNotEmpty()
  @IsIn(VALID_UNITS)
  unit: SupplyUnit;

  @ApiPropertyOptional({ example: 50, description: 'Current stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ example: 10, description: 'Minimum stock threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Cost per unit (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @ApiPropertyOptional({ example: '/uploads/supply.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['/uploads/img1.jpg'] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ example: 'Dùng kèm mỗi đơn hàng' })
  @IsOptional()
  @IsString()
  notes?: string;
}
