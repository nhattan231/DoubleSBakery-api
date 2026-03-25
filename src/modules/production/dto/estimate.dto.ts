import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EstimateItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Size ID (nếu có)' })
  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @ApiProperty({ example: 50, description: 'Số lượng cần sản xuất' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ProductionEstimateDto {
  @ApiProperty({
    type: [EstimateItemDto],
    description: 'Danh sách sản phẩm + size + số lượng',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateItemDto)
  items: EstimateItemDto[];
}
