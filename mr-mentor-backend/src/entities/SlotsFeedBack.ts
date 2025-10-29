import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Slots } from "./Slots";


enum Experience {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  BELOW_AVERAGE = 'below_average',
  POOR = 'poor'
}
@Entity('slots_feedback')
export class SlotsFeedBack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  slotId: string;

  @OneToOne(() => Slots, slot => slot.feedback, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slotId' })
  slot: Slots;

  @Column({type:'boolean',name:'is_mentor_joined_on_time'})
  isMentorJoinedOnTime: boolean;

  @Column({type:'float4',name:'rating'})
  rating: number;

  @Column({type:'enum',enum:Experience,name:'experience'})
  experience: Experience;
  
  @Column({type:'text',name:'comments'})
  comments: string;
  
}