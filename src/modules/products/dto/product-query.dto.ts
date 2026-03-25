import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['active', 'inactive'], description: 'Filter by product status' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
