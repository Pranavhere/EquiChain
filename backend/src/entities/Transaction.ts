import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'simple-enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({ default: 'MRFf' })
  tokenSymbol!: string;

  @Column({ type: 'varchar' })
  quantity!: string; // Store as string to handle BigInt

  @Column({ type: 'bigint' })
  pricePaise!: number; // Price at time of transaction

  @Column({ type: 'varchar', nullable: true })
  txHash!: string; // Blockchain transaction hash

  @Column({ type: 'bigint', nullable: true })
  blockNumber!: number; // Block number where tx was mined

  @Column({ type: 'varchar', nullable: true })
  gasUsed!: string; // Gas consumed by transaction

  @Column({ type: 'varchar', nullable: true })
  gasPrice!: string; // Gas price in wei

  @Column({ type: 'varchar', nullable: true })
  from!: string; // Sender address

  @Column({ type: 'varchar', nullable: true })
  to!: string; // Contract address

  @CreateDateColumn()
  createdAt!: Date;
}
