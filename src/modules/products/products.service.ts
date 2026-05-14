import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductSize } from './entities/product-size.entity';
import {
  CreateProductDto,
  CreateProductSizeDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductSize)
    private productSizesRepository: Repository<ProductSize>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    const saved = await this.productsRepository.save(product);
    this.logger.log(`Product created: ${saved.name} (${saved.id})`);
    return saved;
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginationResult<Product>> {
    const { page = 1, limit = 20, status } = query;

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.productsRepository.findAndCount({
      where,
      relations: ['recipes'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['recipes', 'recipes.items', 'recipes.items.ingredient'],
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { sizes, ...rest } = dto;

    if (Object.keys(rest).length > 0) {
      this.productsRepository.merge(product, rest as any);
    }

    // Không dùng orphanRemoval: TypeORM có thể UPDATE product_id = NULL (vi phạm NOT NULL).
    // Xóa size không còn trong payload bằng remove() rồi gán lại collection.
    if (sizes !== undefined) {
      const keepIds = new Set(
        sizes.map((s) => s.id).filter((id): id is string => Boolean(id)),
      );
      const toRemove = (product.sizes ?? []).filter((s) => !keepIds.has(s.id));
      if (toRemove.length > 0) {
        await this.productSizesRepository.remove(toRemove);
      }
      product.sizes = this.buildSizesForUpdate(product, sizes);
    }

    const updated = await this.productsRepository.save(product);
    this.logger.log(`Product updated: ${updated.name} (${updated.id})`);
    return this.findOne(updated.id);
  }

  /** Giữ entity cũ (cùng id) để UPDATE; tạo mới khi không khớp id → phần bị thiếu bị loại khỏi collection */
  private buildSizesForUpdate(
    product: Product,
    incoming: CreateProductSizeDto[],
  ): ProductSize[] {
    const existingById = new Map(
      (product.sizes ?? []).map((s) => [s.id, s]),
    );

    return incoming.map((row) => {
      if (row.id && existingById.has(row.id)) {
        const entity = existingById.get(row.id)!;
        entity.name = row.name;
        entity.price = row.price;
        if (row.sortOrder !== undefined) entity.sortOrder = row.sortOrder;
        if (row.isActive !== undefined) entity.isActive = row.isActive;
        return entity;
      }

      return this.productsRepository.manager.create(ProductSize, {
        name: row.name,
        price: row.price,
        sortOrder: row.sortOrder ?? 0,
        isActive: row.isActive ?? true,
        productId: product.id,
        product,
      });
    });
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    this.logger.log(`Product removed: ${id}`);
  }
}
