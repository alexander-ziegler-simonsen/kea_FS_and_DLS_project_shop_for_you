import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany, CreateDateColumn
} from 'typeorm';
import { Grocery } from './Grocery.js';

@Entity()
export class GroceryName {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Grocery, (grocery) => grocery.names)
  groceries: Grocery[];

  @CreateDateColumn()
  createdAt: Date;
}
