import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToMany, CreateDateColumn
} from 'typeorm';
import { Grocery } from './Grocery.js';


@Entity()
export class GroceryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  image: string;

  @ManyToMany(() => Grocery, (grocery) => grocery.images)
  groceries: Grocery[];

  @CreateDateColumn()
  createdAt: Date;
}
