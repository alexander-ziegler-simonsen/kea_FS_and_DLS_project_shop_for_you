import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../order_handler/Order.js';



@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: "varchar", unique: true })
    username: string;
  
    @Column({ type: "varchar" })
    passwordHash: string;
  
    @Column({ type: "varchar", default: "user" })
    role: "admin" | "user";

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}

  
