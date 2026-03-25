import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';
import { generateOrderNumber } from '../../common/utils/order-number.util';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(InventoryTransaction)
    private inventoryTxRepository: Repository<InventoryTransaction>,
    private dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePurchaseOrderDto,
    userId?: string,
  ): Promise<PurchaseOrder> {
    const poNumber = generateOrderNumber('PO');

    let totalCost = 0;
    const items: Partial<PurchaseOrderItem>[] = [];

    for (const item of dto.items) {
      // Validate ingredient exists
      const ingredient = await this.ingredientsRepository.findOne({
        where: { id: item.ingredientId },
      });
      if (!ingredient) {
        throw new BadRequestException(
          `Ingredient ${item.ingredientId} not found`,
        );
      }

      const subtotal = item.quantity * item.unitPrice;
      totalCost += subtotal;

      items.push({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
      });
    }

    const po = this.poRepository.create({
      poNumber,
      supplierId: dto.supplierId,
      notes: dto.notes,
      status: 'draft',
      totalCost,
      createdBy: userId,
      items: items as PurchaseOrderItem[],
    });

    const saved = await this.poRepository.save(po);
    this.logger.log(`Purchase order created: ${poNumber}`);
    return this.findOne(saved.id);
  }

  async findAll(pagination: PaginationDto): Promise<PaginationResult<PurchaseOrder>> {
    const { page = 1, limit = 20 } = pagination;

    const [data, total] = await this.poRepository.findAndCount({
      relations: ['items', 'items.ingredient', 'supplier'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({
      where: { id },
      relations: ['items', 'items.ingredient', 'supplier'],
    });

    if (!po) {
      throw new NotFoundException(`Purchase order #${id} not found`);
    }

    return po;
  }

  /**
   * Cập nhật trạng thái PO
   * - "confirmed" = xác nhận đơn hàng (chưa nhập kho)
   * - "received"  = đã nhận hàng → cộng tồn kho trong transaction
   * - "cancelled" = huỷ phiếu
   */
  async updateStatus(
    id: string,
    dto: UpdatePurchaseOrderStatusDto,
    userId?: string,
  ): Promise<PurchaseOrder> {
    const po = await this.findOne(id);
    this.validateStatusTransition(po.status, dto.status as PurchaseOrderStatus);

    // Chỉ nhập kho khi chuyển sang "received" (đã nhận hàng thực tế)
    if (dto.status === 'received') {
      return this.receivePurchaseOrder(po, userId);
    }

    po.status = dto.status as PurchaseOrderStatus;
    return this.poRepository.save(po);
  }

  /**
   * RECEIVE PURCHASE ORDER - Đã nhận hàng → Nhập kho
   * Cộng tồn kho + ghi inventory transaction trong database transaction
   */
  private async receivePurchaseOrder(
    po: PurchaseOrder,
    userId?: string,
  ): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of po.items) {
        // Lock ingredient row
        const ingredient = await queryRunner.manager
          .createQueryBuilder(Ingredient, 'ingredient')
          .setLock('pessimistic_write')
          .where('ingredient.id = :id', { id: item.ingredientId })
          .getOne();

        if (!ingredient) {
          throw new BadRequestException(
            `Ingredient ${item.ingredientId} not found`,
          );
        }

        // Cộng tồn kho
        ingredient.currentStock =
          Number(ingredient.currentStock) + Number(item.quantity);

        // Cập nhật giá nhập mới nhất
        ingredient.costPerUnit = Number(item.unitPrice);

        await queryRunner.manager.save(ingredient);

        // Ghi inventory transaction
        const tx = queryRunner.manager.create(InventoryTransaction, {
          ingredientId: item.ingredientId,
          type: 'IN',
          quantity: Number(item.quantity),
          reason: 'PURCHASE',
          referenceId: po.id,
          createdBy: userId,
          notes: `PO ${po.poNumber}`,
        });
        await queryRunner.manager.save(tx);
      }

      // Update PO status
      po.status = 'received';
      await queryRunner.manager.save(po);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Purchase order ${po.poNumber} received. ${po.items.length} ingredients restocked.`,
      );

      return this.findOne(po.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to receive PO ${po.poNumber}: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateStatusTransition(
    current: PurchaseOrderStatus,
    next: PurchaseOrderStatus,
  ): void {
    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> =
      {
        draft: ['confirmed', 'cancelled'],
        confirmed: ['received', 'cancelled'],
        received: [],
        cancelled: [],
      };

    if (!validTransitions[current]?.includes(next)) {
      throw new BadRequestException(
        `Cannot transition from "${current}" to "${next}"`,
      );
    }
  }
}
