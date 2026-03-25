import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(RecipeItem)
    private recipeItemsRepository: Repository<RecipeItem>,
  ) {}

  async create(dto: CreateRecipeDto): Promise<Recipe> {
    const sizeId = dto.sizeId || null;

    const existing = await this.recipesRepository.findOne({
      where: {
        productId: dto.productId,
        sizeId: sizeId ?? (IsNull() as any),
      },
    });

    if (existing) {
      throw new ConflictException(
        sizeId
          ? 'Size này đã có công thức rồi'
          : 'Sản phẩm này đã có công thức mặc định rồi',
      );
    }

    const recipe = this.recipesRepository.create({
      productId: dto.productId,
      sizeId,
      notes: dto.notes,
      items: dto.items.map((item) =>
        this.recipeItemsRepository.create({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        }),
      ),
    });

    const saved = await this.recipesRepository.save(recipe);
    this.logger.log(`Recipe created for product ${dto.productId}, size ${sizeId || 'default'}`);
    return this.findOne(saved.id);
  }

  async findAll(): Promise<Recipe[]> {
    return this.recipesRepository.find({
      relations: ['product', 'size', 'items', 'items.ingredient'],
    });
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipesRepository.findOne({
      where: { id },
      relations: ['product', 'size', 'items', 'items.ingredient'],
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe #${id} not found`);
    }
    return recipe;
  }

  async findByProductId(productId: string): Promise<Recipe[]> {
    return this.recipesRepository.find({
      where: { productId },
      relations: ['size', 'items', 'items.ingredient'],
      order: { sizeId: 'ASC' },
    });
  }

  async findByProductAndSize(productId: string, sizeId: string | null): Promise<Recipe | null> {
    return this.recipesRepository.findOne({
      where: {
        productId,
        sizeId: sizeId ?? (IsNull() as any),
      },
      relations: ['items', 'items.ingredient'],
    });
  }

  async update(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.findOne(id);
    if (dto.notes !== undefined) {
      recipe.notes = dto.notes;
    }
    if (dto.items) {
      await this.recipeItemsRepository.delete({ recipeId: id });
      recipe.items = dto.items.map((item) =>
        this.recipeItemsRepository.create({
          recipeId: id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        }),
      );
    }
    await this.recipesRepository.save(recipe);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const recipe = await this.findOne(id);
    await this.recipesRepository.remove(recipe);
  }
}
