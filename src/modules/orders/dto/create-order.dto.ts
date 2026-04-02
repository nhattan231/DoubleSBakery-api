import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsArray,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Size ID (nếu sản phẩm có size)' })
  @IsOptional()
  @IsUUID()
  sizeId?: string;

  @ApiProperty({ example: 2, description: 'Number of items' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Đánh dấu là món tặng kèm', default: false })
  @IsOptional()
  @IsBoolean()
  isGift?: boolean;

  @ApiPropertyOptional({ description: 'Giá tùy chỉnh cho món tặng (có thể = 0)', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;
}

export class CreateOrderSupplyItemDto {
  @ApiProperty({ description: 'Supply ID' })
  @IsUUID()
  @IsNotEmpty()
  supplyId: string;

  @ApiProperty({ example: 1, description: 'Số lượng vật tư' })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({ description: 'Đơn giá (mặc định 0 = miễn phí)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiPropertyOptional({ example: '0909123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Nguyễn Huệ, Q1, HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Xuất kho khi xác nhận đơn (trừ NL + VT)', default: true })
  @IsOptional()
  @IsBoolean()
  deductStock?: boolean;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({ type: [CreateOrderSupplyItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderSupplyItemDto)
  supplyItems?: CreateOrderSupplyItemDto[];
}
