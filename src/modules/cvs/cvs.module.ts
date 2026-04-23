import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cv])],
  controllers: [CvsController],
  providers: [CvsService],
  exports: [CvsService],
})
export class CvsModule {}
