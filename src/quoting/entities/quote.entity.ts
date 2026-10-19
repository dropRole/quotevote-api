import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import CommonEntity from '../../common/entities/common.entity';
import User from '../../auth/entities/user.entity';
import Vote from './vote.entity';

@Entity('quotes')
export default class Quote extends CommonEntity {
  @Column('varchar', { length: 500 })
  content: string;

  @Index()
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  written: string;

  @Column('timestamp', { nullable: true })
  updated: string | null;

  @Index()
  @ManyToOne((_type) => User, (user) => user.quotes, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'author' })
  user: User;

  @OneToMany((_type) => Vote, (vote) => vote.quote)
  votes: Vote[];
}
