import { PrimaryGeneratedColumn } from 'typeorm';

export default abstract class CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
