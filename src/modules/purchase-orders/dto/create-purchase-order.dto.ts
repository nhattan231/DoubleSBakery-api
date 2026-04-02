import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  ValidateNested,
  IsArray,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderItemDto {
  @ApiPropertyOptional({
    description: 'Item type: ingredient | supply | equipment',
    default: 'ingredient',
  })
  @IsOptional()
  @IsIn(['ingredient', 'supply', 'equipment'])
  itemType?: string = 'ingredient';

  @ApiPropertyOptional({ description: 'Ingredient ID (required if itemType = ingredient)' })
  @IsOptional()
  @IsUUID()
  ingredientId?: string;

  @ApiPropertyOptional({ description: 'Supply ID (required if itemType = supply)' })
  @IsOptional()
  @IsUUID()
  supplyId?: string;

  @ApiPropertyOptional({ description: 'Equipment ID (required if itemType = equipment)' })
  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}
