import { Controller, Post, Get, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { ProductionEstimateDto } from './dto/estimate.dto';
import { EstimateHistoryQueryDto } from './dto/estimate-history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('estimate')
  @ApiOperation({
    summary: 'Estimate ingredients needed for production',
    description:
      'Calculate total ingredients required for producing a list of products. ' +
      'Returns detailed breakdown with stock comparison and cost estimate.',
  })
  estimate(
    @Body() dto: ProductionEstimateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productionService.estimate(dto, userId);
  }

  @Get('estimate-history')
  @ApiOperation({ summary: 'Get estimate history list' })
  getEstimateHistory(@Query() query: EstimateHistoryQueryDto) {
    return this.productionService.getEstimateHistory(query);
  }

  @Get('estimate-history/order/:orderId')
  @ApiOperation({ summary: 'Get estimate history by order ID' })
  getEstimateByOrder(@Param('orderId') orderId: string) {
    return this.productionService.getEstimateByOrder(orderId);
  }

  @Get('estimate-history/:id')
  @ApiOperation({ summary: 'Get estimate history detail' })
  getEstimateDetail(@Param('id') id: string) {
    return this.productionService.getEstimateDetail(id);
  }
}
