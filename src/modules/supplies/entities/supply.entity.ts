import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SupplyUnit = 'piece' | 'pack' | 'roll' | 'sheet' | 'box' | 'bag';

@Entity('supplies')
export class Supply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20 })
  unit: SupplyUnit;

  @Column({
    name: 'current_stock',
    type: 'decimal',
    precision: 12,
    scale: 3,
    default: 0,
  })
  currentStock: number;

  @Column({
    name: 'min_stock',
    type: 'decimal',
    precision: 12,
    scale: 3,
    default: 0,
  })
  minStock: number;

  @Column({
    name: 'cost_per_unit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  costPerUnit: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ length: 500, nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
