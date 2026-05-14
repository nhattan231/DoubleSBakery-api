import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductSize } from '../../products/entities/product-size.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /** Size đã chọn (nullable — nếu sản phẩm không có size) */
  @Column({ name: 'size_id', nullable: true })
  sizeId: string;

  @ManyToOne(() => ProductSize, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'size_id' })
  size: ProductSize;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  /** Đánh dấu món tặng kèm */
  @Column({ name: 'is_gift', type: 'boolean', default: false })
  isGift: boolean;

  /** Giá tùy chỉnh cho món tặng (có thể = 0) */
  @Column({ name: 'custom_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  customPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
