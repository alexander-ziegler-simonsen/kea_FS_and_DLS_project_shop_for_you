import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToMany
} from 'typeorm';
import { Grocery } from './Grocery.js';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Grocery, (grocery) => grocery.categories)
  groceries: Grocery[];
}
