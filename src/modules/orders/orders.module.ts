import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { EstimateHistory } from '../production/entities/estimate-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Recipe,
      Ingredient,
      InventoryTransaction,
      EstimateHistory,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
