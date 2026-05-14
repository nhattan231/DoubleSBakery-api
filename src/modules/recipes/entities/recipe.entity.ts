import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductSize } from '../../products/entities/product-size.entity';
import { RecipeItem } from './recipe-item.entity';

/**
 * Recipe - Công thức định lượng
 *
 * Mỗi recipe gắn với 1 product + 1 size (hoặc null nếu không có size).
 * - product_id + size_id = NULL → công thức mặc định (sản phẩm không phân size)
 * - product_id + size_id = uuid → công thức riêng cho size đó
 */
@Entity('recipes')
@Unique(['productId', 'sizeId'])
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /** Null = công thức mặc định, có giá trị = công thức cho size cụ thể */
  @Column({ name: 'size_id', nullable: true })
  sizeId: string | null;

  @ManyToOne(() => ProductSize, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'size_id' })
  size: ProductSize | null;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => RecipeItem, (item) => item.recipe, {
    cascade: true,
    eager: true,
  })
  items: RecipeItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
