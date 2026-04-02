import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EquipmentCondition } from '../entities/equipment.entity';

const VALID_CONDITIONS: EquipmentCondition[] = ['good', 'worn', 'broken', 'replaced'];

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Khuôn tròn đúc đế rời 18cm' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 1, description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ enum: VALID_CONDITIONS, default: 'good' })
  @IsOptional()
  @IsIn(VALID_CONDITIONS)
  condition?: EquipmentCondition;

  @ApiPropertyOptional({ example: 50000, description: 'Purchase price (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: '/uploads/equipment.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['/uploads/img1.jpg'] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ example: 'Khuôn chống dính' })
  @IsOptional()
  @IsString()
  notes?: string;
}
