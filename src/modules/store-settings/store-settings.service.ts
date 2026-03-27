import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSettings } from './entities/store-settings.entity';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

@Injectable()
export class StoreSettingsService {
  private readonly logger = new Logger(StoreSettingsService.name);

  constructor(
    @InjectRepository(StoreSettings)
    private settingsRepository: Repository<StoreSettings>,
  ) {}

  /**
   * Lấy settings (singleton - chỉ có 1 record)
   * Nếu chưa có thì tạo mới với giá trị mặc định
   */
  async get(): Promise<StoreSettings> {
    let settings = await this.settingsRepository.findOne({ where: {} });

    if (!settings) {
      settings = this.settingsRepository.create({
        businessName: 'Double S Bakery',
        slogan: 'Tiệm bánh thủ công - Ngọt ngào từ tâm',
        openingHours: {
          monday: { open: '07:00', close: '21:00', closed: false },
          tuesday: { open: '07:00', close: '21:00', closed: false },
          wednesday: { open: '07:00', close: '21:00', closed: false },
          thursday: { open: '07:00', close: '21:00', closed: false },
          friday: { open: '07:00', close: '21:00', closed: false },
          saturday: { open: '07:00', close: '22:00', closed: false },
          sunday: { open: '08:00', close: '20:00', closed: false },
        },
      });
      settings = await this.settingsRepository.save(settings);
      this.logger.log('Created default store settings');
    }

    return settings;
  }

  /**
   * Cập nhật settings
   */
  async update(dto: UpdateStoreSettingsDto): Promise<StoreSettings> {
    let settings = await this.get();
    Object.assign(settings, dto);
    settings = await this.settingsRepository.save(settings);
    this.logger.log('Store settings updated');
    return settings;
  }

  /**
   * API công khai - Lấy thông tin cửa hàng cho khách xem
   * Chỉ trả về khi isMenuPublic = true
   */
  async getPublic(): Promise<StoreSettings | null> {
    const settings = await this.get();
    if (!settings.isMenuPublic) {
      return null;
    }
    return settings;
  }
}
