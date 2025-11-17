import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Position } from './Position';
import { Transaction } from './Transaction';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'bigint', default: 100000 })
  balanceInPaise!: number; // ₹1000 starting balance (100,000 paise)

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Position, (position) => position.user)
  positions!: Position[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];
}
