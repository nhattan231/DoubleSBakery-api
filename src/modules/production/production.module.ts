import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Product } from '../products/entities/product.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { EstimateHistory } from './entities/estimate-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Product, Ingredient, EstimateHistory])],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
