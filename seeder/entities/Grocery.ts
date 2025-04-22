import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToMany, JoinTable
} from 'typeorm';
import { Type } from './Type';
import { Price } from './Price';
import { Description } from './Description';

@Entity()
export class Grocery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Type, (type) => type.groceries, { cascade: true })
  @JoinTable()
  types: Type[];

  @ManyToMany(() => Price, (price) => price.groceries, { cascade: true })
  @JoinTable()
  prices: Price[];

  @ManyToMany(() => Description, (desc) => desc.groceries, { cascade: true })
  @JoinTable()
  descriptions: Description[];

  @Column({ nullable: true })
  image: string;
}