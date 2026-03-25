import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview' })
  getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  getRevenue(@Query() query: ReportQueryDto) {
    return this.reportsService.getRevenue(query);
  }

  @Get('costs')
  @ApiOperation({ summary: 'Get cost report' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  getCosts(@Query() query: ReportQueryDto) {
    return this.reportsService.getCosts(query);
  }

  @Get('profit')
  @ApiOperation({ summary: 'Get profit report (admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  getProfit(@Query() query: ReportQueryDto) {
    return this.reportsService.getProfit(query);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  getTopProducts(@Query() query: ReportQueryDto) {
    return this.reportsService.getTopProducts(query);
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Get period-over-period comparison (admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  getComparison(@Query() query: ReportQueryDto) {
    return this.reportsService.getComparison(query);
  }
}
