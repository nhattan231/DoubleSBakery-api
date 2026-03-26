import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
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

    // Cập nhật fields đơn giản
    const { sizes, ...rest } = dto;
    Object.assign(product, rest);

    // Nếu có sizes mới → xử lý cascade
    if (sizes !== undefined) {
      product.sizes = sizes as any;
    }

    const updated = await this.productsRepository.save(product);
    this.logger.log(`Product updated: ${updated.name} (${updated.id})`);
    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    this.logger.log(`Product removed: ${id}`);
  }
}
