import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany,
  CreateDateColumn
} from 'typeorm';
import { Grocery } from './Grocery';

@Entity()
export class GroceryName {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  name: string;

  @ManyToMany(() => Grocery, (grocery) => grocery.names)
  groceries: Grocery[];
}
