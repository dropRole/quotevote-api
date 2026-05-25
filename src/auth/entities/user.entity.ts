import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import Quote from '../../quotes/entities/quote.entity';
import Vote from '../../quotes/entities/vote.entity';

@Entity('users')
export default class User {
  @PrimaryColumn('varchar', { length: 20 })
  username: string;

  @Column('varchar', { length: 64 })
  @Exclude({ toPlainOnly: true })
  pass: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 100 })
  surname: string;

  @Column('varchar', { length: 255 })
  email: string;

  @Column('text', { nullable: true })
  avatar: string | null;

  @OneToMany((_type) => Quote, (quote) => quote.user)
  quotes: Quote[];

  @OneToMany((_type) => Vote, (vote) => vote.user)
  votes: Vote[];
}
