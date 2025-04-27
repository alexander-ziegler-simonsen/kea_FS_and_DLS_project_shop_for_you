import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany
} from 'typeorm';
import { Grocery } from './Grocery';

@Entity()
export class GroceryName {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Grocery, (grocery) => grocery.names)
  groceries: Grocery[];
}
