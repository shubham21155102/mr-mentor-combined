import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Slots } from './Slots';

export enum TokenUsageType {
  MEETING_BOOKING = 'meeting_booking',
  PENALTY = 'penalty',
  REFUND = 'refund',
  BONUS = 'bonus'
}

@Entity('token_usage')
export class TokenUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.tokenUsage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Slots, slot => slot.tokenUsage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'slotId' })
  slot: Slots | null;

  @Column({ type: 'uuid', nullable: true })
  slotId: string | null;

  @Column({ type: 'enum', enum: TokenUsageType })
  usageType: TokenUsageType;

  @Column({ type: 'int' })
  tokensUsed: number;

  @Column({ type: 'int' })
  balanceBefore: number;

  @Column({ type: 'int' })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}