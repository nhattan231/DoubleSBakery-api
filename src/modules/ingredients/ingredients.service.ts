import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, ILike } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
  ) {}

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientsRepository.create(dto);
    const saved = await this.ingredientsRepository.save(ingredient);
    this.logger.log(`Ingredient created: ${saved.name}`);
    return saved;
  }

  async findAll(pagination: PaginationDto): Promise<PaginationResult<Ingredient>> {
    const { page = 1, limit = 20, search } = pagination;

    const where: any = {};
    if (search?.trim()) {
      where.name = ILike(`%${search.trim()}%`);
    }

    const [data, total] = await this.ingredientsRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list: data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { id },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient #${id} not found`);
    }

    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.findOne(id);
    Object.assign(ingredient, dto);
    return this.ingredientsRepository.save(ingredient);
  }

  async remove(id: string): Promise<void> {
    const ingredient = await this.findOne(id);
    await this.ingredientsRepository.remove(ingredient);
    this.logger.log(`Ingredient removed: ${id}`);
  }

  /**
   * Lấy danh sách nguyên liệu có tồn kho thấp hơn mức cảnh báo
   */
  async getLowStockIngredients(): Promise<Ingredient[]> {
    return this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.current_stock <= ingredient.min_stock')
      .andWhere('ingredient.min_stock > 0')
      .orderBy('ingredient.current_stock', 'ASC')
      .getMany();
  }
}
