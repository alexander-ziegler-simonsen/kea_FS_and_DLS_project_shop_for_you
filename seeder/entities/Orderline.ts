import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Orderline {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", unique: true })
    username: string;

    @Column({ type: "varchar", unique: true })
    email: string;

    @Column({ type: "varchar", nullable: true })
    address: string;

    @Column()
    groceryname: string;

    @Column()
    groceryamount: string;

    @Column()
    pricename: string;
}