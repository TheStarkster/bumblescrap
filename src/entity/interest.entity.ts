import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tb_interest')
export class TbInterest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
