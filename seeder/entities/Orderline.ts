import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Order } from './Order';

@Entity()
export class Orderline {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    groceryname: string;

    @Column()
    groceryamount: string;

    @Column('float')
    price: number;

    @ManyToMany(() => Order, (order) => order.orderlines)
    orders: Order[];
}