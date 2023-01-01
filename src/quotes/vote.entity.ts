import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quote } from './quote.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  vote: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  voted: Date;

  @Column({ type: 'timestamp', nullable: true })
  reVoted: Date;

  @ManyToOne((_type) => User, (user) => user.votes, { eager: false })
  @JoinColumn({ name: 'username' })
  user: User;

  @ManyToOne((_type) => Quote, (quote) => quote.votes, { eager: false })
  @JoinColumn({ name: 'quoteId' })
  quote: Quote;
}
