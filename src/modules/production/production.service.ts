import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Product } from '../products/entities/product.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { EstimateHistory } from './entities/estimate-history.entity';
import { ProductionEstimateDto } from './dto/estimate.dto';
import { EstimateHistoryQueryDto } from './dto/estimate-history-query.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

export interface EstimateItemResult {
  ingredientId?: string;
  supplyId?: string;
  ingredientName: string;
  unit: string;
  totalNeeded: number;
  currentStock: number;
  shortage: number;
  costPerUnit: number;
  estimatedCost: number;
}

export interface EstimateResult {
  products: {
    productId: string;
    productName: string;
    sizeName?: string;
    quantity: number;
  }[];
  ingredients: EstimateItemResult[];
  totalEstimatedCost: number;
  hasShortage: boolean;
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(Supply)
    private suppliesRepository: Repository<Supply>,
    @InjectRepository(EstimateHistory)
    private estimateHistoryRepository: Repository<EstimateHistory>,
  ) {}

  async estimate(dto: ProductionEstimateDto, userId?: string): Promise<EstimateResult> {
    const productSummaries: EstimateResult['products'] = [];
    const ingredientMap = new Map<
      string,
      { ingredient: Ingredient; totalNeeded: number }
    >();
    const supplyMap = new Map<
      string,
      { supply: Supply; totalNeeded: number }
    >();

    for (const item of dto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại`);
      }

      // Tìm size name nếu có
      let sizeName: string | undefined;
      if (item.sizeId) {
        const size = product.sizes?.find((s) => s.id === item.sizeId);
        sizeName = size?.name;
      }

      productSummaries.push({
        productId: product.id,
        productName: product.name,
        sizeName,
        quantity: item.quantity,
      });

      // Tìm recipe: ưu tiên recipe cho size, fallback về mặc định
      const sizeId = item.sizeId || null;
      let recipe = await this.recipesRepository.findOne({
        where: {
          productId: item.productId,
          sizeId: sizeId ?? (IsNull() as any),
        },
        relations: ['items', 'items.ingredient', 'items.supply'],
      });

      // Fallback: nếu không có recipe cho size cụ thể → dùng recipe mặc định
      if (!recipe && sizeId) {
        recipe = await this.recipesRepository.findOne({
          where: {
            productId: item.productId,
            sizeId: IsNull() as any,
          },
          relations: ['items', 'items.ingredient', 'items.supply'],
        });
      }

      if (!recipe) {
        throw new NotFoundException(
          `Sản phẩm "${product.name}"${sizeName ? ` (${sizeName})` : ''} chưa có công thức`,
        );
      }

      for (const recipeItem of recipe.items) {
        const needed = Number(recipeItem.quantity) * item.quantity;

        if (recipeItem.ingredientId) {
          const existing = ingredientMap.get(recipeItem.ingredientId);
          if (existing) {
            existing.totalNeeded += needed;
          } else {
            ingredientMap.set(recipeItem.ingredientId, {
              ingredient: recipeItem.ingredient,
              totalNeeded: needed,
            });
          }
        } else if (recipeItem.supplyId) {
          const existing = supplyMap.get(recipeItem.supplyId);
          if (existing) {
            existing.totalNeeded += needed;
          } else {
            supplyMap.set(recipeItem.supplyId, {
              supply: recipeItem.supply,
              totalNeeded: needed,
            });
          }
        }
      }
    }

    const ingredientResults: EstimateResult['ingredients'] = [];
    let totalEstimatedCost = 0;
    let hasShortage = false;

    // Tính nguyên liệu
    for (const [ingredientId, data] of ingredientMap) {
      const freshIngredient = await this.ingredientsRepository.findOne({
        where: { id: ingredientId },
      });

      const currentStock = Number(freshIngredient?.currentStock ?? 0);
      const costPerUnit = Number(freshIngredient?.costPerUnit ?? 0);
      const shortage = Math.max(0, data.totalNeeded - currentStock);
      const estimatedCost = data.totalNeeded * costPerUnit;

      if (shortage > 0) hasShortage = true;
      totalEstimatedCost += estimatedCost;

      ingredientResults.push({
        ingredientId,
        ingredientName: data.ingredient.name,
        unit: data.ingredient.unit,
        totalNeeded: data.totalNeeded,
        currentStock,
        shortage,
        costPerUnit,
        estimatedCost,
      });
    }

    // Tính vật tư tiêu hao
    for (const [supplyId, data] of supplyMap) {
      const freshSupply = await this.suppliesRepository.findOne({
        where: { id: supplyId },
      });

      const currentStock = Number(freshSupply?.currentStock ?? 0);
      const costPerUnit = Number(freshSupply?.costPerUnit ?? 0);
      const shortage = Math.max(0, data.totalNeeded - currentStock);
      const estimatedCost = data.totalNeeded * costPerUnit;

      if (shortage > 0) hasShortage = true;
      totalEstimatedCost += estimatedCost;

      ingredientResults.push({
        supplyId,
        ingredientName: data.supply.name,
        unit: data.supply.unit,
        totalNeeded: data.totalNeeded,
        currentStock,
        shortage,
        costPerUnit,
        estimatedCost,
      });
    }

    ingredientResults.sort((a, b) => b.shortage - a.shortage);

    const result: EstimateResult = {
      products: productSummaries,
      ingredients: ingredientResults,
      totalEstimatedCost,
      hasShortage,
    };

    // Lưu lịch sử estimate
    const history = this.estimateHistoryRepository.create({
      type: 'ESTIMATE',
      products: result.products,
      ingredients: result.ingredients,
      totalEstimatedCost: result.totalEstimatedCost,
      hasShortage: result.hasShortage,
      createdBy: userId || undefined,
    });
    await this.estimateHistoryRepository.save(history);

    return result;
  }

  async getEstimateHistory(
    query: EstimateHistoryQueryDto,
  ): Promise<PaginationResult<EstimateHistory>> {
    const { page = 1, limit = 20, startDate, endDate, type, search } = query;

    const queryBuilder = this.estimateHistoryRepository
      .createQueryBuilder('eh')
      .leftJoinAndSelect('eh.creator', 'creator');

    if (type) {
      queryBuilder.andWhere('eh.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(eh.order_number ILIKE :search OR eh.products::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) {
      queryBuilder.andWhere('eh.createdAt >= :startDate', {
        startDate: `${startDate} 00:00:00`,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('eh.createdAt <= :endDate', {
        endDate: `${endDate} 23:59:59`,
      });
    }

    queryBuilder
      .orderBy('eh.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      list: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEstimateDetail(id: string): Promise<EstimateHistory> {
    const history = await this.estimateHistoryRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!history) {
      throw new NotFoundException('Không tìm thấy lịch sử xuất định lượng');
    }

    return history;
  }

  async getEstimateByOrder(orderId: string): Promise<EstimateHistory | null> {
    return this.estimateHistoryRepository.findOne({
      where: { orderId, type: 'ORDER' as any },
      relations: ['creator'],
    });
  }
}
