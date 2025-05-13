import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
  } from 'typeorm';
  

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
  }

