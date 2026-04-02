import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Equipment } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async create(dto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(dto);
    const saved = await this.equipmentRepository.save(equipment);
    this.logger.log(`Equipment created: ${saved.name}`);
    return saved;
  }

  async findAll(pagination: PaginationDto): Promise<PaginationResult<Equipment>> {
    const { page = 1, limit = 20, search } = pagination;

    const where: any = {};
    if (search?.trim()) {
      where.name = ILike(`%${search.trim()}%`);
    }

    const [data, total] = await this.equipmentRepository.findAndCount({
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

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment #${id} not found`);
    }

    return equipment;
  }

  async update(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findOne(id);
    Object.assign(equipment, dto);
    return this.equipmentRepository.save(equipment);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.findOne(id);
    await this.equipmentRepository.remove(equipment);
    this.logger.log(`Equipment removed: ${id}`);
  }
}
