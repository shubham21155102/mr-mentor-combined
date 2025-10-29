import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export enum WithdrawalStatus {
  REQUESTED = 'requested',
  IN_PROCESS = 'in_process',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  EARNING = 'earning',
  WITHDRAWAL = 'withdrawal'
}

@Entity('mentor_earnings')
export class MentorEarnings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column({ type: 'uuid' })
  mentorId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  withdrawnAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('mentor_transactions')
export class MentorTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column({ type: 'uuid' })
  mentorId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: WithdrawalStatus, nullable: true })
  status?: WithdrawalStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankUPI?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string; // 'UPI' or 'Bank'

  @Column({ type: 'uuid', nullable: true })
  slotId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;
}
