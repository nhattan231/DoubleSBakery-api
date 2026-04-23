import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('cvs')
export class Cv {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 200, default: 'My CV' })
  title: string;

  @Column({ name: 'template_id', length: 50, default: 'classic' })
  templateId: string;

  @Column({ name: 'font_family', length: 100, default: 'Inter' })
  fontFamily: string;

  @Column({ name: 'font_size', type: 'int', default: 14 })
  fontSize: number;

  @Column({ name: 'primary_color', length: 20, default: '#2563eb' })
  primaryColor: string;

  @Column({ length: 5, default: 'vi' })
  language: string;

  @Column({ name: 'personal_info', type: 'jsonb', default: '{}' })
  personalInfo: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  sections: Record<string, any>[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
