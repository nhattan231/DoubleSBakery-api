import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store_settings')
export class StoreSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Thông tin cơ bản
  @Column({ name: 'business_name', length: 200, default: 'Double S Bakery' })
  businessName: string;

  @Column({ length: 500, nullable: true })
  slogan: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'banner_urls', type: 'jsonb', default: '[]' })
  bannerUrls: string[];

  // Liên hệ
  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  zalo: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'google_maps_url', length: 1000, nullable: true })
  googleMapsUrl: string;

  // Mạng xã hội
  @Column({ name: 'facebook_url', length: 500, nullable: true })
  facebookUrl: string;

  @Column({ name: 'instagram_url', length: 500, nullable: true })
  instagramUrl: string;

  @Column({ name: 'tiktok_url', length: 500, nullable: true })
  tiktokUrl: string;

  // Giờ hoạt động
  @Column({ name: 'opening_hours', type: 'jsonb', nullable: true })
  openingHours: Record<string, { open: string; close: string; closed: boolean }>;

  @Column({ name: 'special_notice', type: 'text', nullable: true })
  specialNotice: string;

  // Cài đặt đặt hàng
  @Column({ name: 'is_ordering_enabled', default: false })
  isOrderingEnabled: boolean;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  minOrderAmount: number;

  @Column({ name: 'preparation_time', length: 200, nullable: true })
  preparationTime: string;

  @Column({ name: 'delivery_fee_note', length: 500, nullable: true })
  deliveryFeeNote: string;

  @Column({ name: 'delivery_area', length: 500, nullable: true })
  deliveryArea: string;

  @Column({ name: 'order_note', type: 'text', nullable: true })
  orderNote: string;

  // Phương thức thanh toán
  @Column({ name: 'payment_methods', type: 'jsonb', default: '[]' })
  paymentMethods: string[];

  // Thông tin chuyển khoản
  @Column({ name: 'bank_name', length: 200, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_account_name', length: 200, nullable: true })
  bankAccountName: string;

  // Giao diện
  @Column({ name: 'primary_color', length: 10, default: '#8B6914' })
  primaryColor: string;

  @Column({ name: 'secondary_color', length: 10, default: '#FFF8F0' })
  secondaryColor: string;

  @Column({ name: 'menu_layout', length: 20, default: 'grid' })
  menuLayout: 'grid' | 'list';

  // SEO
  @Column({ name: 'seo_title', length: 200, nullable: true })
  seoTitle: string;

  @Column({ name: 'seo_description', length: 500, nullable: true })
  seoDescription: string;

  @Column({ name: 'favicon_url', length: 500, nullable: true })
  faviconUrl: string;

  // Trạng thái
  @Column({ name: 'is_menu_public', default: false })
  isMenuPublic: boolean;

  @Column({ name: 'show_prices', default: true })
  showPrices: boolean;

  @Column({ name: 'show_description', default: true })
  showDescription: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
