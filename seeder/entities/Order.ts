import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    ManyToMany,
  } from 'typeorm';
import { Orderline } from './Orderline';
  

  @Entity()
  export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    address: string;

    @Column('float')
    totalprice: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToMany(() => Orderline, (orderline) => orderline.orders, { cascade: true })
    orderlines: Orderline[];
  }

