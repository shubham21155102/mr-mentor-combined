import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('issues')
export class Issues {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    issueType: string;

    @Column({ nullable: true })
    imageUrl: string;
    
    @Column()
    description: string;
}