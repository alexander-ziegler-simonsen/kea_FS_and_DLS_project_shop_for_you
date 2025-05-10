import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany,
  CreateDateColumn
} from 'typeorm';
import { Grocery } from './Grocery';

@Entity()
export class GroceryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  image: string;

  @ManyToMany(() => Grocery, (grocery) => grocery.images)
  groceries: Grocery[];
}
