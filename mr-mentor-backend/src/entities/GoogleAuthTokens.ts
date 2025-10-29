import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('google_auth_tokens')
export class GoogleAuthTokens {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  
  @Column({ type: 'varchar', length: 255 })
  access_token: string;

  @Column({ type: 'varchar', length: 255 })
  refresh_token: string;

  @Column({ type: 'bigint' })
  expiry_date: number;
}