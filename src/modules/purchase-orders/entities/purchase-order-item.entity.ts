import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Supply } from '../../supplies/entities/supply.entity';
import { Equipment } from '../../equipment/entities/equipment.entity';

export type PurchaseOrderItemType = 'ingredient' | 'supply' | 'equipment';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'purchase_order_id' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column({ name: 'item_type', length: 20, default: 'ingredient' })
  itemType: PurchaseOrderItemType;

  @Column({ name: 'ingredient_id', nullable: true })
  ingredientId: string | null;

  @ManyToOne(() => Ingredient, { eager: true, nullable: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient | null;

  @Column({ name: 'supply_id', nullable: true })
  supplyId: string | null;

  @ManyToOne(() => Supply, { eager: true, nullable: true })
  @JoinColumn({ name: 'supply_id' })
  supply: Supply | null;

  @Column({ name: 'equipment_id', nullable: true })
  equipmentId: string | null;

  @ManyToOne(() => Equipment, { eager: true, nullable: true })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment | null;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
