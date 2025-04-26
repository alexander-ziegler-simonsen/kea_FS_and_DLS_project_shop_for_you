import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany
} from 'typeorm';
import { Grocery } from './Grocery';

@Entity()
export class GroceryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  image: string;

  @ManyToMany(() => Grocery, (grocery) => grocery.images)
  groceries: Grocery[];
}
