import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Injectable()
export class CvsService {
  private readonly logger = new Logger(CvsService.name);

  constructor(
    @InjectRepository(Cv)
    private readonly cvsRepository: Repository<Cv>,
  ) {}

  async create(userId: string, dto: CreateCvDto): Promise<Cv> {
    const cv = this.cvsRepository.create({
      ...dto,
      userId,
    });
    const saved = await this.cvsRepository.save(cv);
    this.logger.log(`CV created: ${saved.id} by user ${userId}`);
    return saved;
  }

  async findAll(userId: string): Promise<Cv[]> {
    return this.cvsRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Cv> {
    const cv = await this.cvsRepository.findOne({ where: { id, userId } });
    if (!cv) {
      throw new NotFoundException(`CV #${id} not found`);
    }
    return cv;
  }

  async update(id: string, userId: string, dto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id, userId);
    Object.assign(cv, dto);
    return this.cvsRepository.save(cv);
  }

  async remove(id: string, userId: string): Promise<void> {
    const cv = await this.findOne(id, userId);
    await this.cvsRepository.remove(cv);
    this.logger.log(`CV deleted: ${id} by user ${userId}`);
  }
}
