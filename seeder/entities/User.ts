import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

    @Column({ type: "varchar", unique: true })
    email: string;

    @Column({ type: "varchar", nullable: true })
    address: string;
}


