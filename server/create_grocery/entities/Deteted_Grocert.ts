import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToMany, JoinTable
} from 'typeorm';
import { Type } from './Type.js';
import { Price } from './Price.js';
import { Description } from './Description.js';

@Entity()
export class Deteted_Grocert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToMany(() => Type, (type) => type.groceries, { cascade: true })
  @JoinTable()
  types: Type[];

  @ManyToMany(() => Price, (price) => price.groceries, { cascade: true })
  @JoinTable()
  prices: Price[];

  @ManyToMany(() => Description, (desc) => desc.groceries, { cascade: true })
  @JoinTable()
  descriptions: Description[];
}
