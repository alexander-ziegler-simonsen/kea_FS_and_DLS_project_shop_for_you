import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToMany
} from 'typeorm';
import { Grocery } from './Grocery.js';

@Entity()
export class Type {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Grocery, (grocery) => grocery.types)
  groceries: Grocery[];
}
