import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import CommonEntity from '../../common/entities/common.entity';
import User from '../../auth/entities/user.entity';
import Quote from './quote.entity';

@Entity('votes')
export default class Vote extends CommonEntity {
  @Index()
  @Column('boolean')
  up: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  at: string;

  @Index()
  @ManyToOne((_type) => User, (user) => user.votes, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'voter' })
  user: User;

  @ManyToOne((_type) => Quote, (quote) => quote.votes, { nullable: false })
  quote: Quote;
}
