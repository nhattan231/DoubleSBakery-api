import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('CVs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CV' })
  create(
    @Body() dto: CreateCvDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CVs of current user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.cvsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CV by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CV' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCvDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CV' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.cvsService.remove(id, userId);
  }
}
