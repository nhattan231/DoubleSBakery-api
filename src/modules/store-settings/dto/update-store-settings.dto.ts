import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreSettingsDto {
  // Thông tin cơ bản
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  bannerUrls?: string[];

  // Liên hệ
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zalo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  // Mạng xã hội
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  // Giờ hoạt động
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialNotice?: string;

  // Cài đặt đặt hàng
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOrderingEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preparationTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryFeeNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryArea?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderNote?: string;

  // Phương thức thanh toán
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  paymentMethods?: string[];

  // Thông tin chuyển khoản
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  // Giao diện
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  menuLayout?: 'grid' | 'list';

  // SEO
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  // Trạng thái
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMenuPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPrices?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showDescription?: boolean;
}
