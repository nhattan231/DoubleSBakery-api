import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderSupplyItem } from './entities/order-supply-item.entity';
import { Product } from '../products/entities/product.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { EstimateHistory } from '../production/entities/estimate-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderSupplyItem,
      Product,
      Recipe,
      Ingredient,
      Supply,
      InventoryTransaction,
      EstimateHistory,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
