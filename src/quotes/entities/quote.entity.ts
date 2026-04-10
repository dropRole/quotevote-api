import { User } from 'src/auth/entities/user.entity';
import CommonEntity from 'src/common/entities/common.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Vote } from './vote.entity';

@Entity('quotes')
export class Quote extends CommonEntity {
  @Column({ type: 'character varying', length: 400 })
  quote: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  written: string;

  @Column({ type: 'timestamp', nullable: true })
  updated: string;

  @Column({ type: 'smallint' })
  upvotes: number;

  @Column({ type: 'smallint' })
  downvotes: number;

  @ManyToOne((_type) => User, (user) => user.quotes, {
    eager: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  user: User;

  @OneToMany((_type) => Vote, (vote) => vote.quote, { eager: true })
  votes: Vote[];
}
