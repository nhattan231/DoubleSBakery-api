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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new equipment item' })
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all equipment items' })
  findAll(@Query() pagination: PaginationDto) {
    return this.equipmentService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment item by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an equipment item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an equipment item' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipmentService.remove(id);
  }
}
