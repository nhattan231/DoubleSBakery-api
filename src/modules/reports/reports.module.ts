import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { EstimateHistory } from '../production/entities/estimate-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, PurchaseOrder, Ingredient, EstimateHistory]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
