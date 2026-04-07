import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderSupplyItem } from './entities/order-supply-item.entity';
import { Product } from '../products/entities/product.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { EstimateHistory } from '../production/entities/estimate-history.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';
import { generateOrderNumber } from '../../common/utils/order-number.util';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(Supply)
    private suppliesRepository: Repository<Supply>,
    @InjectRepository(InventoryTransaction)
    private inventoryTxRepository: Repository<InventoryTransaction>,
    @InjectRepository(EstimateHistory)
    private estimateHistoryRepository: Repository<EstimateHistory>,
    private dataSource: DataSource,
  ) {}

  /**
   * Tạo đơn hàng mới (chưa trừ kho, chỉ khi confirm mới trừ)
   */
  async create(dto: CreateOrderDto, userId?: string): Promise<Order> {
    const orderNumber = generateOrderNumber('ORD');

    // Validate products và tính giá
    const orderItems: Partial<OrderItem>[] = [];
    let totalAmount = 0;

    for (const item of dto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: item.productId, status: 'active' },
      });

      if (!product) {
        throw new BadRequestException(
          `Sản phẩm ${item.productId} không tồn tại hoặc ngừng bán`,
        );
      }

      // Nếu có sizeId → lấy giá từ size, không thì lấy giá mặc định
      let originalPrice = Number(product.price);
      let sizeId: string | undefined;

      if (item.sizeId) {
        const size = product.sizes?.find((s) => s.id === item.sizeId);
        if (!size) {
          throw new BadRequestException(
            `Size ${item.sizeId} không tồn tại cho sản phẩm "${product.name}"`,
          );
        }
        originalPrice = Number(size.price);
        sizeId = size.id;
      }

      // Nếu là món tặng → dùng customPrice (mặc định 0), ngược lại dùng giá gốc
      const isGift = item.isGift || false;
      const unitPrice = isGift
        ? Number(item.customPrice ?? 0)
        : originalPrice;

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: item.productId,
        sizeId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        isGift,
        customPrice: isGift ? Number(item.customPrice ?? 0) : undefined,
      });
    }

    // Validate và tạo supply items
    const supplyItems: Partial<OrderSupplyItem>[] = [];
    if (dto.supplyItems && dto.supplyItems.length > 0) {
      for (const si of dto.supplyItems) {
        const supply = await this.suppliesRepository.findOne({ where: { id: si.supplyId } });
        if (!supply) {
          throw new BadRequestException(`Vật tư ${si.supplyId} không tồn tại`);
        }
        const unitPrice = Number(si.unitPrice ?? 0);
        const subtotal = unitPrice * si.quantity;
        totalAmount += subtotal;
        supplyItems.push({
          supplyId: si.supplyId,
          quantity: si.quantity,
          unitPrice,
          subtotal,
        });
      }
    }

    const order = this.ordersRepository.create({
      orderNumber,
      customerName: dto.customerName,
      phone: dto.phone,
      address: dto.address,
      notes: dto.notes,
      status: 'pending',
      totalAmount,
      deductStock: dto.deductStock !== false, // default true
      createdBy: userId,
      orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
      items: orderItems as OrderItem[],
      supplyItems: supplyItems as OrderSupplyItem[],
    });

    const saved = await this.ordersRepository.save(order);
    this.logger.log(`Order created: ${orderNumber}, total: ${totalAmount}`);

    return this.findOne(saved.id);
  }

  async findAll(
    query: OrderQueryDto,
  ): Promise<PaginationResult<Order>> {
    const { page = 1, limit = 20, status, search, startDate, endDate } = query;

    // Convert sang timezone VN rồi cast DATE để so sánh ngày thuần
    const dateExpr = "(COALESCE(ord.order_date, ord.created_at) AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE";

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('ord')
      .addSelect(dateExpr, 'effective_date')
      .leftJoinAndSelect('ord.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('ord.supplyItems', 'supplyItems')
      .leftJoinAndSelect('supplyItems.supply', 'supply');

    if (status) {
      queryBuilder.andWhere('ord.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(ord.orderNumber ILIKE :search OR ord.customerName ILIKE :search OR ord.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) {
      queryBuilder.andWhere(
        `${dateExpr} >= :startDate`,
        { startDate },
      );
    }

    if (endDate) {
      queryBuilder.andWhere(
        `${dateExpr} <= :endDate`,
        { endDate },
      );
    }

    queryBuilder
      .orderBy('effective_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      list: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.size', 'supplyItems', 'supplyItems.supply'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  /**
   * CORE BUSINESS LOGIC: Cập nhật trạng thái đơn hàng
   *
   * Khi status chuyển sang "confirmed":
   * 1. Lấy tất cả sản phẩm trong đơn
   * 2. Lấy recipe của từng sản phẩm
   * 3. Tính tổng nguyên liệu cần dùng
   * 4. Kiểm tra tồn kho đủ không
   * 5. Trừ kho (trong transaction)
   * 6. Ghi inventory_transactions
   *
   * Tất cả phải nằm trong 1 database transaction
   */
  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    userId?: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Validate state transitions
    this.validateStatusTransition(order.status, dto.status as OrderStatus);

    // Nếu confirm -> chạy logic trừ kho trong transaction
    if (dto.status === 'confirmed') {
      return this.confirmOrder(order, userId);
    }

    // Các trạng thái khác chỉ cần update
    order.status = dto.status as OrderStatus;
    return this.ordersRepository.save(order);
  }

  /**
   * CONFIRM ORDER - Logic quan trọng nhất
   * Sử dụng database transaction để đảm bảo tính toàn vẹn dữ liệu
   */
  private async confirmOrder(order: Order, userId?: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Chỉ tính định lượng + trừ kho khi đơn có xuất kho
      if (order.deductStock) {
        // Bước 1: Tính tổng nguyên liệu + vật tư cần dùng cho toàn bộ đơn hàng
        const ingredientRequirements = new Map<
          string,
          { ingredient: Ingredient; totalNeeded: number }
        >();
        const recipeSupplyRequirements = new Map<
          string,
          { supply: Supply; totalNeeded: number }
        >();

        for (const orderItem of order.items) {
          // Tìm recipe theo product + size (hoặc mặc định nếu không có size)
          const sizeId = orderItem.sizeId || null;
          const recipeWhere: any = { productId: orderItem.productId };
          if (sizeId) {
            recipeWhere.sizeId = sizeId;
          } else {
            recipeWhere.sizeId = null; // IsNull trong queryRunner
          }

          let recipe = await queryRunner.manager.findOne(Recipe, {
            where: recipeWhere,
            relations: ['items', 'items.ingredient', 'items.supply'],
          });

          // Nếu không tìm thấy recipe cho size cụ thể, thử tìm recipe mặc định
          if (!recipe && sizeId) {
            recipe = await queryRunner.manager.findOne(Recipe, {
              where: { productId: orderItem.productId, sizeId: null as any },
              relations: ['items', 'items.ingredient', 'items.supply'],
            });
          }

          if (!recipe) {
            const sizeName = orderItem.size ? ` (${orderItem.size.name})` : '';
            throw new BadRequestException(
              `Sản phẩm "${orderItem.product.name}"${sizeName} chưa có công thức. Không thể xác nhận đơn.`,
            );
          }

          // Tính nguyên liệu + vật tư = recipe quantity * order quantity
          for (const recipeItem of recipe.items) {
            const needed = Number(recipeItem.quantity) * orderItem.quantity;

            if (recipeItem.ingredientId) {
              const existing = ingredientRequirements.get(recipeItem.ingredientId);
              if (existing) {
                existing.totalNeeded += needed;
              } else {
                ingredientRequirements.set(recipeItem.ingredientId, {
                  ingredient: recipeItem.ingredient,
                  totalNeeded: needed,
                });
              }
            } else if (recipeItem.supplyId) {
              const existing = recipeSupplyRequirements.get(recipeItem.supplyId);
              if (existing) {
                existing.totalNeeded += needed;
              } else {
                recipeSupplyRequirements.set(recipeItem.supplyId, {
                  supply: recipeItem.supply,
                  totalNeeded: needed,
                });
              }
            }
          }
        }

        // Bước 2: Lưu snapshot lịch sử xuất định lượng (trước khi trừ kho)
        const productSummaries: {
          productId: string;
          productName: string;
          sizeName?: string;
          quantity: number;
        }[] = [];
        for (const orderItem of order.items) {
          productSummaries.push({
            productId: orderItem.productId,
            productName: orderItem.product.name,
            sizeName: orderItem.size?.name,
            quantity: orderItem.quantity,
          });
        }

        const ingredientSnapshots: {
          ingredientId?: string;
          supplyId?: string;
          ingredientName: string;
          unit: string;
          totalNeeded: number;
          currentStock: number;
          shortage: number;
          costPerUnit: number;
          estimatedCost: number;
        }[] = [];
        let totalEstimatedCost = 0;
        let hasShortage = false;

        // Snapshot nguyên liệu
        for (const [ingId, req] of ingredientRequirements) {
          const freshIng = await queryRunner.manager.findOne(Ingredient, {
            where: { id: ingId },
          });
          const currentStock = Number(freshIng?.currentStock ?? 0);
          const costPerUnit = Number(freshIng?.costPerUnit ?? 0);
          const shortage = Math.max(0, req.totalNeeded - currentStock);
          const estimatedCost = req.totalNeeded * costPerUnit;
          if (shortage > 0) hasShortage = true;
          totalEstimatedCost += estimatedCost;

          ingredientSnapshots.push({
            ingredientId: ingId,
            ingredientName: req.ingredient.name,
            unit: req.ingredient.unit,
            totalNeeded: req.totalNeeded,
            currentStock,
            shortage,
            costPerUnit,
            estimatedCost,
          });
        }

        // Snapshot vật tư tiêu hao (từ công thức)
        for (const [supId, req] of recipeSupplyRequirements) {
          const freshSup = await queryRunner.manager.findOne(Supply, {
            where: { id: supId },
          });
          const currentStock = Number(freshSup?.currentStock ?? 0);
          const costPerUnit = Number(freshSup?.costPerUnit ?? 0);
          const shortage = Math.max(0, req.totalNeeded - currentStock);
          const estimatedCost = req.totalNeeded * costPerUnit;
          if (shortage > 0) hasShortage = true;
          totalEstimatedCost += estimatedCost;

          ingredientSnapshots.push({
            supplyId: supId,
            ingredientName: req.supply.name,
            unit: req.supply.unit,
            totalNeeded: req.totalNeeded,
            currentStock,
            shortage,
            costPerUnit,
            estimatedCost,
          });
        }

        ingredientSnapshots.sort((a, b) => b.shortage - a.shortage);

        const estimateHistory = this.estimateHistoryRepository.create({
          type: 'ORDER',
          orderId: order.id,
          orderNumber: order.orderNumber,
          products: productSummaries,
          ingredients: ingredientSnapshots,
          totalEstimatedCost,
          hasShortage,
          createdBy: userId || undefined,
          notes: `Xuất định lượng cho đơn hàng ${order.orderNumber}`,
        });
        await queryRunner.manager.save(estimateHistory);

        // Bước 3: Trừ kho nguyên liệu + vật tư
        const insufficientStock: string[] = [];

        // 3a. Trừ kho nguyên liệu
        for (const [ingredientId, req] of ingredientRequirements) {
          const ingredient = await queryRunner.manager
            .createQueryBuilder(Ingredient, 'ingredient')
            .setLock('pessimistic_write')
            .where('ingredient.id = :id', { id: ingredientId })
            .getOne();

          if (!ingredient) {
            throw new BadRequestException(`Ingredient ${ingredientId} not found`);
          }

          const currentStock = Number(ingredient.currentStock);

          if (currentStock < req.totalNeeded) {
            insufficientStock.push(
              `${req.ingredient.name}: cần ${req.totalNeeded}${req.ingredient.unit}, còn ${currentStock}${req.ingredient.unit}`,
            );
            continue;
          }

          ingredient.currentStock = currentStock - req.totalNeeded;
          await queryRunner.manager.save(ingredient);

          const tx = this.inventoryTxRepository.create({
            ingredientId,
            type: 'OUT',
            quantity: req.totalNeeded,
            reason: 'ORDER',
            referenceId: order.id,
            createdBy: userId,
            notes: `Order ${order.orderNumber}`,
          });
          await queryRunner.manager.save(tx);
        }

        // 3b. Trừ kho vật tư tiêu hao (từ công thức)
        for (const [supplyId, req] of recipeSupplyRequirements) {
          const supply = await queryRunner.manager
            .createQueryBuilder(Supply, 'supply')
            .setLock('pessimistic_write')
            .where('supply.id = :id', { id: supplyId })
            .getOne();

          if (!supply) {
            throw new BadRequestException(`Vật tư ${supplyId} không tồn tại`);
          }

          const currentStock = Number(supply.currentStock);

          if (currentStock < req.totalNeeded) {
            insufficientStock.push(
              `${req.supply.name}: cần ${req.totalNeeded} ${req.supply.unit}, còn ${currentStock} ${req.supply.unit}`,
            );
            continue;
          }

          supply.currentStock = currentStock - req.totalNeeded;
          await queryRunner.manager.save(supply);
        }

        // 3c. Trừ kho vật tư tiêu hao (từ đơn hàng - order supply items)
        if (order.supplyItems && order.supplyItems.length > 0) {
          for (const supplyItem of order.supplyItems) {
            const supply = await queryRunner.manager
              .createQueryBuilder(Supply, 'supply')
              .setLock('pessimistic_write')
              .where('supply.id = :id', { id: supplyItem.supplyId })
              .getOne();

            if (!supply) {
              throw new BadRequestException(`Vật tư ${supplyItem.supplyId} không tồn tại`);
            }

            const currentStock = Number(supply.currentStock);
            const needed = Number(supplyItem.quantity);

            if (currentStock < needed) {
              insufficientStock.push(
                `${supply.name}: cần ${needed} ${supply.unit}, còn ${currentStock} ${supply.unit}`,
              );
              continue;
            }

            supply.currentStock = currentStock - needed;
            await queryRunner.manager.save(supply);
          }
        }

        if (insufficientStock.length > 0) {
          throw new BadRequestException({
            message: 'Không đủ tồn kho',
            errors: insufficientStock,
          });
        }
      }

      // Cập nhật trạng thái đơn hàng
      order.status = 'confirmed';
      await queryRunner.manager.save(order);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(
        `Order ${order.orderNumber} confirmed.${order.deductStock ? ' Stock deducted.' : ' No stock deduction (deductStock=false).'}`,
      );

      return this.findOne(order.id);
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to confirm order ${order.orderNumber}: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate state machine cho order status
   */
  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    const allowed = validTransitions[current];
    if (!allowed || !allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from "${current}" to "${next}"`,
      );
    }
  }
}
