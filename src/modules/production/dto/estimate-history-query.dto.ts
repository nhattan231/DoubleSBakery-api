import { IsOptional, IsDateString, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class EstimateHistoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ['ESTIMATE', 'ORDER'],
    description: 'Filter by type: ESTIMATE (manual) or ORDER (from order confirmation)',
  })
  @IsOptional()
  @IsIn(['ESTIMATE', 'ORDER'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Search by order number or product name',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
