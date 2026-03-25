import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryTransaction)
    private transactionsRepository: Repository<InventoryTransaction>,
  ) {}

  async getTransactions(
    query: InventoryQueryDto,
  ): Promise<PaginationResult<InventoryTransaction>> {
    const { page = 1, limit = 20, ingredientId, type, reason } = query;

    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.ingredient', 'ingredient');

    if (ingredientId) {
      queryBuilder.andWhere('tx.ingredientId = :ingredientId', {
        ingredientId,
      });
    }

    if (type) {
      queryBuilder.andWhere('tx.type = :type', { type });
    }

    if (reason) {
      queryBuilder.andWhere('tx.reason = :reason', { reason });
    }

    queryBuilder
      .orderBy('tx.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      list: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
