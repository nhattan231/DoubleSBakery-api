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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ingredients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingredients' })
  findAll(@Query() pagination: PaginationDto) {
    return this.ingredientsService.findAll(pagination);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get ingredients with low stock' })
  getLowStock() {
    return this.ingredientsService.getLowStockIngredients();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ingredient by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ingredient' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ingredient' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.remove(id);
  }
}
