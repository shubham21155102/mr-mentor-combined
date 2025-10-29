import { UserRole } from '../types/UserTypes';
import { UserStage } from '../types/UserStage';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Token } from './Tokens';
import { Mentor } from './Mentor';
import { TokenUsage } from './TokenUsage';
@Index('IDX_USER_EMAIL_HASH', (user: User) => [user.email])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profession?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'text', nullable: true })
  profilePhoto?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId?: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isProfileComplete: boolean;

  @Column({ type: 'enum', enum: UserStage, default: UserStage.SIGNUP })
  stage: UserStage;

  @Column({ type: 'text', nullable: true })
  deviceInfo?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Token, token => token.user)
  tokens: Token[];

  @OneToMany(() => TokenUsage, tokenUsage => tokenUsage.user)
  tokenUsage: TokenUsage[];

  // Add this inside the User entity class
  @OneToMany(() => Mentor, mentor => mentor.user)
  mentorProfile: Mentor[];
}