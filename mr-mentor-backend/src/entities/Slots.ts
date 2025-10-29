import { Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { SlotsFeedBack } from './SlotsFeedBack';
import { TokenUsage } from './TokenUsage';

export enum MeetingStatus {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  CANCELLATION_REQUESTED = 'cancellation_requested'
}

@Entity('slots')
export class Slots {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  // connect with user table with mentor id
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column({ type: 'uuid' })
  mentorId: string;

  @Column({ type: 'uuid', nullable: true })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'studentId' })
  user: User;

  @Column({ type: 'boolean', default: false })
  isAvailable: boolean;

  @Column({ type: 'enum', enum: MeetingStatus, default: MeetingStatus.TENTATIVE })
  status: MeetingStatus;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime?: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  @Column({ type: 'boolean', default: false })
  earningsCredited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  earningsCreditedAt?: Date;

  @OneToOne(() => SlotsFeedBack, feedback => feedback.slot, { onDelete: 'CASCADE' })
  feedback: SlotsFeedBack;

  @OneToMany(() => TokenUsage, tokenUsage => tokenUsage.slot)
  tokenUsage: TokenUsage[];
}
