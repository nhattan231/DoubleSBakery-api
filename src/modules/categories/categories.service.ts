import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { ProductCategory } from './entities/product-category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    // Auto set sortOrder nếu không có (max + 1)
    if (dto.sortOrder === undefined || dto.sortOrder === null) {
      const maxSort = await this.categoryRepository
        .createQueryBuilder('c')
        .select('MAX(c.sort_order)', 'max')
        .getRawOne();
      dto.sortOrder = (Number(maxSort?.max) || 0) + 1;
    }

    // Nếu isFeatured = true: tắt featured của tất cả category khác
    if (dto.isFeatured === true) {
      await this.categoryRepository
        .createQueryBuilder()
        .update(Category)
        .set({ isFeatured: false, featuredBadgeText: null })
        .execute();
    } else if (dto.isFeatured === false) {
      // Nếu tắt featured thì clear badge text cho data sạch
      dto.featuredBadgeText = undefined;
    }

    const category = this.categoryRepository.create(dto);
    const saved = await this.categoryRepository.save(category);
    this.logger.log(`Category created: ${saved.name} (${saved.id})`);
    return saved;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Nếu bật isFeatured: tắt featured của tất cả category khác
    if (dto.isFeatured === true) {
      await this.categoryRepository
        .createQueryBuilder()
        .update(Category)
        .set({ isFeatured: false, featuredBadgeText: null })
        .where('id != :id', { id })
        .execute();
    } else if (dto.isFeatured === false) {
      // Nếu tắt featured thì clear badge text
      dto.featuredBadgeText = undefined;
      category.featuredBadgeText = null;
    }

    Object.assign(category, dto);
    const updated = await this.categoryRepository.save(category);
    this.logger.log(`Category updated: ${updated.name} (${updated.id})`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    this.logger.log(`Category deleted: ${id}`);
  }

  async reorder(items: { id: string; sortOrder: number }[]): Promise<Category[]> {
    for (const item of items) {
      await this.categoryRepository.update(item.id, { sortOrder: item.sortOrder });
    }
    return this.findAll();
  }

  // ===== Product-Category Relations =====

  async getProductCategories(productId: string): Promise<ProductCategory[]> {
    return this.productCategoryRepository.find({
      where: { productId },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
    });
  }

  async setProductCategories(productId: string, categoryIds: string[]): Promise<void> {
    // Xóa tất cả liên kết cũ
    await this.productCategoryRepository.delete({ productId });

    // Tạo liên kết mới
    if (categoryIds.length > 0) {
      const entities = categoryIds.map((categoryId, index) =>
        this.productCategoryRepository.create({
          productId,
          categoryId,
          sortOrder: index,
        }),
      );
      await this.productCategoryRepository.save(entities);
    }

    this.logger.log(`Product ${productId} categories updated: ${categoryIds.join(', ')}`);
  }

  async getCategoryProducts(categoryId: string): Promise<ProductCategory[]> {
    return this.productCategoryRepository.find({
      where: { categoryId },
      relations: ['product'],
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * API công khai - Lấy danh mục kèm sản phẩm cho khách xem
   * Tối ưu: chỉ 2 queries thay vì N+1
   */
  async getPublicMenu(): Promise<any[]> {
    // Query 1: Lấy tất cả danh mục active
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    if (categories.length === 0) return [];

    // Query 2: Lấy TẤT CẢ product-category relations cùng lúc (eager load)
    const allProductCategories = await this.productCategoryRepository.find({
      where: { categoryId: In(categories.map((c) => c.id)) },
      relations: ['product'],
      order: { sortOrder: 'ASC' },
    });

    // Group theo categoryId trong memory
    const productsByCat = new Map<string, any[]>();
    for (const pc of allProductCategories) {
      if (pc.product && pc.product.status === 'active') {
        if (!productsByCat.has(pc.categoryId)) {
          productsByCat.set(pc.categoryId, []);
        }
        productsByCat.get(pc.categoryId)!.push(pc.product);
      }
    }

    return categories.map((cat) => ({
      ...cat,
      products: productsByCat.get(cat.id) || [],
    }));
  }
}
