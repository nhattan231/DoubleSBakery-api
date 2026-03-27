import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StoreSettingsService } from './store-settings.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from '../categories/categories.service';

@ApiTags('Store Settings')
@Controller('store-settings')
export class StoreSettingsController {
  constructor(
    private readonly settingsService: StoreSettingsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /** Lấy settings (cần đăng nhập) */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get store settings (admin)' })
  get() {
    return this.settingsService.get();
  }

  /** Cập nhật settings (cần đăng nhập) */
  @Patch()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update store settings (admin)' })
  update(@Body() dto: UpdateStoreSettingsDto) {
    return this.settingsService.update(dto);
  }

  /** API công khai - thông tin cửa hàng */
  @Get('public')
  @ApiOperation({ summary: 'Get public store info (no auth)' })
  getPublic() {
    return this.settingsService.getPublic();
  }

  /** API công khai - menu với sản phẩm (đặt ở đây để tránh route conflict với categories/:id) */
  @Get('public/menu')
  @ApiOperation({ summary: 'Get public menu with products (no auth)' })
  getPublicMenu() {
    return this.categoriesService.getPublicMenu();
  }
}
