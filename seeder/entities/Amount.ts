import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from 'typeorm';
import { Grocery } from './Grocery';

@Entity()
export class Amount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Grocery, (grocery) => grocery.amounts)
  groceries: Grocery[];
}