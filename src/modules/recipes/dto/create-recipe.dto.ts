import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeItemDto {
  @ApiPropertyOptional({ description: 'Ingredient ID (bắt buộc nếu không có supplyId)' })
  @IsOptional()
  @IsUUID()
  ingredientId?: string;

  @ApiPropertyOptional({ description: 'Supply ID (bắt buộc nếu không có ingredientId)' })
  @IsOptional()
  @IsUUID()
  supplyId?: string;

  @ApiProperty({ example: 100, description: 'Số lượng cho 1 sản phẩm' })
  @IsNumber()
  @Min(0.001)
  quantity: number;
}

export class CreateRecipeDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Size ID (null = công thức mặc định)' })
  @IsOptional()
  @IsUUID()
  sizeId?: string | null;

  @ApiPropertyOptional({ example: 'Nướng ở 180 độ C trong 25 phút' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [RecipeItemDto], description: 'Danh sách nguyên liệu' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items: RecipeItemDto[];
}
