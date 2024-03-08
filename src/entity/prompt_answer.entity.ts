import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('tb_prompt_answer')
export class TbPromptAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  answer: string;

}
