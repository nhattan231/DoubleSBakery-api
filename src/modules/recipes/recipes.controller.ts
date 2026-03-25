import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Recipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a recipe for a product' })
  create(@Body() dto: CreateRecipeDto) {
    return this.recipesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recipes' })
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipe by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get recipe by product ID' })
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.recipesService.findByProductId(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.remove(id);
  }
}
