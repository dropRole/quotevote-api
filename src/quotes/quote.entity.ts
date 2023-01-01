import { User } from '../auth/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Vote } from './vote.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 400 })
  quote: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  written: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated: Date;

  @ManyToOne((_type) => User, (user) => user.quotes, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'username' })
  user: User;

  @OneToMany((_type) => Vote, (vote) => vote.quote, { eager: true })
  votes: Vote[];
}
