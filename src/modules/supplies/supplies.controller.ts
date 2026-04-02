import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Supplies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supply item' })
  create(@Body() dto: CreateSupplyDto) {
    return this.suppliesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all supply items' })
  findAll(@Query() pagination: PaginationDto) {
    return this.suppliesService.findAll(pagination);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get supply items with low stock' })
  getLowStock() {
    return this.suppliesService.getLowStockSupplies();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supply item by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supply item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplyDto,
  ) {
    return this.suppliesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supply item' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliesService.remove(id);
  }
}
