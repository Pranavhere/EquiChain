import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.positions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ default: 'MRFf' })
  tokenSymbol!: string;

  @Column({ type: 'varchar' })
  quantity!: string; // Store as string to handle BigInt

  @Column({ type: 'bigint' })
  avgPricePaise!: number; // Average price paid in paise
}
