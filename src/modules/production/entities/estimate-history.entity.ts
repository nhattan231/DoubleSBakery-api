import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type EstimateType = 'ESTIMATE' | 'ORDER';

@Entity('estimate_history')
export class EstimateHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, default: 'ESTIMATE' })
  type: EstimateType;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  @Column({ name: 'order_number', length: 50, nullable: true })
  orderNumber: string;

  @Column({ type: 'jsonb' })
  products: {
    productId: string;
    productName: string;
    sizeName?: string;
    quantity: number;
  }[];

  @Column({ type: 'jsonb' })
  ingredients: {
    ingredientId: string;
    ingredientName: string;
    unit: string;
    totalNeeded: number;
    currentStock: number;
    shortage: number;
    costPerUnit: number;
    estimatedCost: number;
  }[];

  @Column({
    name: 'total_estimated_cost',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalEstimatedCost: number;

  @Column({ name: 'has_shortage', default: false })
  hasShortage: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
