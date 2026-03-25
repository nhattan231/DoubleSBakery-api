import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { ProductSize } from './product-size.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  /** Giá mặc định (khi không có size) */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  /** Danh sách nhiều ảnh sản phẩm (lưu JSON array) */
  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'inactive';

  /** Tất cả công thức của sản phẩm (mặc định + theo size) */
  @OneToMany(() => Recipe, (recipe) => recipe.product)
  recipes: Recipe[];

  @OneToMany(() => ProductSize, (size) => size.product, {
    cascade: true,
    eager: true,
  })
  sizes: ProductSize[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
