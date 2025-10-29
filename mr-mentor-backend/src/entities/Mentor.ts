import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('mentors')
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  company: string;

  @Column({ type: 'varchar', length: 255 })
  role: string;

  @Column({ type: 'varchar', length: 255 })
  institute: string;

  @Column({ type: 'int' })
  slotsLeft: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'varchar', length: 255 })
  subCategory: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  @ManyToOne(() => User, user => user.mentorProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}