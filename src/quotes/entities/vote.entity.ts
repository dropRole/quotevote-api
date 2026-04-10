import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Quote } from './quote.entity';
import CommonEntity from 'src/common/common.entity';

@Entity('votes')
export class Vote extends CommonEntity {
  @Column({ type: 'boolean' })
  vote: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  voted: string;

  @Column({ type: 'timestamp', nullable: true })
  reVoted: string;

  @ManyToOne((_type) => User, (user) => user.votes, { eager: false })
  @JoinColumn({ name: 'username' })
  user: User;

  @ManyToOne((_type) => Quote, (quote) => quote.votes, { eager: false })
  @JoinColumn({ name: 'quoteId' })
  quote: Quote;
}
