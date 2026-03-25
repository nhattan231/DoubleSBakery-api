import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';

export type PurchaseOrderStatus = 'draft' | 'confirmed' | 'received' | 'cancelled';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'po_number', length: 50, unique: true })
  poNumber: string;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: string;

  @ManyToOne(() => Supplier, { nullable: true, eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ length: 30, default: 'draft' })
  status: PurchaseOrderStatus;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
