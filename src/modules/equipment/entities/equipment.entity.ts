import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type EquipmentCondition = 'good' | 'worn' | 'broken' | 'replaced';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    length: 20,
    default: 'good',
  })
  condition: EquipmentCondition;

  @Column({
    name: 'purchase_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  purchasePrice: number;

  @Column({
    name: 'purchase_date',
    type: 'date',
    nullable: true,
  })
  purchaseDate: Date;

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
