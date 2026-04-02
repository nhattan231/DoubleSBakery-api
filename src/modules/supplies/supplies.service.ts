import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supply } from './entities/supply.entity';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class SuppliesService {
  private readonly logger = new Logger(SuppliesService.name);

  constructor(
    @InjectRepository(Supply)
    private suppliesRepository: Repository<Supply>,
  ) {}

  async create(dto: CreateSupplyDto): Promise<Supply> {
    const supply = this.suppliesRepository.create(dto);
    const saved = await this.suppliesRepository.save(supply);
    this.logger.log(`Supply created: ${saved.name}`);
    return saved;
  }

  async findAll(pagination: PaginationDto): Promise<PaginationResult<Supply>> {
    const { page = 1, limit = 20, search } = pagination;

    const where: any = {};
    if (search?.trim()) {
      where.name = ILike(`%${search.trim()}%`);
    }

    const [data, total] = await this.suppliesRepository.findAndCount({
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

  async findOne(id: string): Promise<Supply> {
    const supply = await this.suppliesRepository.findOne({
      where: { id },
    });

    if (!supply) {
      throw new NotFoundException(`Supply #${id} not found`);
    }

    return supply;
  }

  async update(id: string, dto: UpdateSupplyDto): Promise<Supply> {
    const supply = await this.findOne(id);
    Object.assign(supply, dto);
    return this.suppliesRepository.save(supply);
  }

  async remove(id: string): Promise<void> {
    const supply = await this.findOne(id);
    await this.suppliesRepository.remove(supply);
    this.logger.log(`Supply removed: ${id}`);
  }

  /**
   * Lấy danh sách vật tư tiêu hao có tồn kho thấp hơn mức cảnh báo
   */
  async getLowStockSupplies(): Promise<Supply[]> {
    return this.suppliesRepository
      .createQueryBuilder('supply')
      .where('supply.current_stock <= supply.min_stock')
      .andWhere('supply.min_stock > 0')
      .orderBy('supply.current_stock', 'ASC')
      .getMany();
  }
}
