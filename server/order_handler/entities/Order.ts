import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
import { Orderline } from './Orderline.js';
  

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
    @JoinTable()
    orderlines: Orderline[];
  }

