import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TbUser } from './user.entity';

@Entity('tb_interest')
export class TbInterest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type=>TbUser)
  user: number

  @Column()
  interest_type: string

  @Column()
  interest_value: string
}


// { id: unique_id, user: 1908, interest_type: "Smoking", interest_value: "Never" }
// { id: unique_id, user: 1908, interest_type: "Drinking", interest_value: "Occasionaly"  }