import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('tb_prompt')
export class TbPrompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

}
