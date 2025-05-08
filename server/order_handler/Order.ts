import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  
  import { Grocery } from '../grocery_handler/entities/Grocery.js';
  import { User } from '../user_handler/User.js';

  
  @Entity()
  export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.orders)
    user: User;
  
    @ManyToMany(() => Grocery)
    @JoinTable()
    groceries: Grocery[];
  
    @CreateDateColumn()
    createdAt: Date;
  }
  
  