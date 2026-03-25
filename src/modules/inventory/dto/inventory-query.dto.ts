import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class InventoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by ingredient ID' })
  @IsOptional()
  @IsString()
  ingredientId?: string;

  @ApiPropertyOptional({ enum: ['IN', 'OUT'], description: 'Filter by transaction type' })
  @IsOptional()
  @IsIn(['IN', 'OUT'])
  type?: string;

  @ApiPropertyOptional({
    enum: ['ORDER', 'PURCHASE', 'ADJUSTMENT', 'WASTE'],
    description: 'Filter by reason',
  })
  @IsOptional()
  @IsIn(['ORDER', 'PURCHASE', 'ADJUSTMENT', 'WASTE'])
  reason?: string;
}
