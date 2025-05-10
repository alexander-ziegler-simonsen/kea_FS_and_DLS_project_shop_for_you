import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToMany
} from 'typeorm';
import { Grocery } from './Grocery.js';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Grocery, (grocery) => grocery.prices)
  groceries: Grocery[];
}
