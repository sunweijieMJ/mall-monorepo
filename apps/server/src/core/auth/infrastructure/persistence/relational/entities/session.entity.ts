import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('auth_session')
@Index(['userId', 'userType'])
export class SessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ length: 10 })
  userType: string; // 'admin' | 'member'

  @Column({ length: 512 })
  hash: string; // bcrypt hash of jti (JWT ID) for token verification

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
