import { User } from '../auth/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 400 })
  quote: string;

  @Column({ type: 'smallint' })
  upvotes: number;

  @Column({ type: 'smallint' })
  downvotes: number;

  @ManyToOne((_type) => User, (user) => user.quotes, { eager: false })
  user: User;
}
