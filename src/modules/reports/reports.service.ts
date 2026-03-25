import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { EstimateHistory } from '../production/entities/estimate-history.entity';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(EstimateHistory)
    private estimateHistoryRepository: Repository<EstimateHistory>,
  ) {}

  /**
   * Dashboard tổng quan
   */
  async getDashboard() {
    const [
      totalOrders,
      pendingOrders,
      todayRevenue,
      lowStockCount,
    ] = await Promise.all([
      this.ordersRepository.count(),
      this.ordersRepository.count({ where: { status: 'pending' } }),
      this.getTodayRevenue(),
      this.getLowStockCount(),
    ]);

    return {
      totalOrders,
      pendingOrders,
      todayRevenue,
      lowStockCount,
    };
  }

  /**
   * Doanh thu theo khoảng thời gian
   */
  async getRevenue(query: ReportQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    // Doanh thu theo ngày
    const dailyRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select("DATE(order.created_at) as date")
      .addSelect('SUM(order.total_amount) as revenue')
      .addSelect('COUNT(order.id) as order_count')
      .where('order.status IN (:...statuses)', {
        statuses: ['confirmed', 'processing', 'completed'],
      })
      .andWhere('order.created_at >= :startDate', { startDate })
      .andWhere('order.created_at <= :endDate', { endDate })
      .groupBy('DATE(order.created_at)')
      .orderBy('date', 'DESC')
      .getRawMany();

    // Tổng doanh thu
    const totalResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount) as total_revenue')
      .addSelect('COUNT(order.id) as total_orders')
      .where('order.status IN (:...statuses)', {
        statuses: ['confirmed', 'processing', 'completed'],
      })
      .andWhere('order.created_at >= :startDate', { startDate })
      .andWhere('order.created_at <= :endDate', { endDate })
      .getRawOne();

    return {
      period: { startDate, endDate },
      totalRevenue: Number(totalResult?.total_revenue || 0),
      totalOrders: Number(totalResult?.total_orders || 0),
      dailyRevenue,
    };
  }

  /**
   * Chi phí nguyên liệu (purchase orders)
   */
  async getCosts(query: ReportQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const result = await this.purchaseOrdersRepository
      .createQueryBuilder('po')
      .select('SUM(po.total_cost) as total_cost')
      .addSelect('COUNT(po.id) as total_purchases')
      .where('po.status IN (:...statuses)', {
        statuses: ['confirmed', 'received'],
      })
      .andWhere('po.created_at >= :startDate', { startDate })
      .andWhere('po.created_at <= :endDate', { endDate })
      .getRawOne();

    return {
      period: { startDate, endDate },
      totalCost: Number(result?.total_cost || 0),
      totalPurchases: Number(result?.total_purchases || 0),
    };
  }

  /**
   * Chi phí nguyên liệu thực tế sử dụng (từ estimate_history type=ORDER)
   */
  async getActualIngredientCost(query: ReportQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const result = await this.estimateHistoryRepository
      .createQueryBuilder('eh')
      .select('COALESCE(SUM(eh.total_estimated_cost), 0) as total_actual_cost')
      .addSelect('COUNT(eh.id) as total_orders')
      .where('eh.type = :type', { type: 'ORDER' })
      .andWhere('eh.created_at >= :startDate', { startDate })
      .andWhere('eh.created_at <= :endDate', { endDate })
      .getRawOne();

    return {
      period: { startDate, endDate },
      totalActualCost: Number(result?.total_actual_cost || 0),
      totalOrders: Number(result?.total_orders || 0),
    };
  }

  /**
   * Lợi nhuận = Doanh thu - Chi phí NL thực tế sử dụng
   */
  async getProfit(query: ReportQueryDto) {
    const [revenue, costs, actualCost] = await Promise.all([
      this.getRevenue(query),
      this.getCosts(query),
      this.getActualIngredientCost(query),
    ]);

    return {
      period: revenue.period,
      revenue: revenue.totalRevenue,
      cost: costs.totalCost,
      actualIngredientCost: actualCost.totalActualCost,
      profit: revenue.totalRevenue - actualCost.totalActualCost,
      margin:
        revenue.totalRevenue > 0
          ? ((revenue.totalRevenue - actualCost.totalActualCost) / revenue.totalRevenue) *
            100
          : 0,
      totalOrders: revenue.totalOrders,
    };
  }

  /**
   * So sánh kỳ trước cùng thời lượng
   */
  async getComparison(query: ReportQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();

    // Kỳ trước: lùi lại đúng số ngày
    const prevEnd = new Date(start.getTime() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    const prevStart = new Date(prevEnd.getTime() - diffMs);
    prevStart.setHours(0, 0, 0, 0);

    const prevQuery: ReportQueryDto = {
      startDate: prevStart.toISOString().split('T')[0],
      endDate: prevEnd.toISOString().split('T')[0],
    };

    const [current, previous] = await Promise.all([
      this.getProfit(query),
      this.getProfit(prevQuery),
    ]);

    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    return {
      current,
      previous: {
        period: {
          startDate: prevStart.toISOString(),
          endDate: prevEnd.toISOString(),
        },
        revenue: previous.revenue,
        cost: previous.cost,
        actualIngredientCost: previous.actualIngredientCost,
        profit: previous.profit,
        margin: previous.margin,
        totalOrders: previous.totalOrders,
      },
      changes: {
        revenue: calcChange(current.revenue, previous.revenue),
        cost: calcChange(current.cost, previous.cost),
        actualIngredientCost: calcChange(current.actualIngredientCost, previous.actualIngredientCost),
        profit: calcChange(current.profit, previous.profit),
        totalOrders: calcChange(current.totalOrders, previous.totalOrders),
      },
    };
  }

  /**
   * Top sản phẩm bán chạy (tách theo size)
   */
  async getTopProducts(query: ReportQueryDto, limit = 10) {
    const { startDate, endDate } = this.getDateRange(query);

    const topProducts = await this.orderItemsRepository
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'order')
      .leftJoin('oi.product', 'product')
      .leftJoin('oi.size', 'size')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('size.id', 'sizeId')
      .addSelect('size.name', 'sizeName')
      .addSelect('SUM(oi.quantity)', 'totalQuantity')
      .addSelect('SUM(oi.subtotal)', 'totalRevenue')
      .where('order.status IN (:...statuses)', {
        statuses: ['confirmed', 'processing', 'completed'],
      })
      .andWhere('order.created_at >= :startDate', { startDate })
      .andWhere('order.created_at <= :endDate', { endDate })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('size.id')
      .addGroupBy('size.name')
      .orderBy('"totalQuantity"', 'DESC')
      .limit(limit)
      .getRawMany();

    return topProducts;
  }

  private async getTodayRevenue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.ordersRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total_amount), 0) as revenue')
      .where('order.status IN (:...statuses)', {
        statuses: ['confirmed', 'processing', 'completed'],
      })
      .andWhere('order.created_at >= :today', { today })
      .getRawOne();

    return Number(result?.revenue || 0);
  }

  private async getLowStockCount(): Promise<number> {
    return this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.current_stock <= ingredient.min_stock')
      .andWhere('ingredient.min_stock > 0')
      .getCount();
  }

  private getDateRange(query: ReportQueryDto) {
    const endDate = query.endDate
      ? new Date(query.endDate + 'T23:59:59')
      : new Date();

    const startDate = query.startDate
      ? new Date(query.startDate + 'T00:00:00')
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    return { startDate, endDate };
  }
}
