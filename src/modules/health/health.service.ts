import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async check(): Promise<{
    status: string;
    timestamp: string;
    adminUserName: string | null;
  }> {
    const admin = await this.usersRepository.findOne({
      where: { role: 'admin', isActive: true },
      order: { createdAt: 'ASC' },
      select: ['id', 'name'],
    });

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      adminUserName: admin?.name ?? null,
    };
  }
}
