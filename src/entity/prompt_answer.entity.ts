import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TbPrompt } from './prompt.entity';
import { TbUser } from './user.entity';

@Entity('tb_prompt_answer')
export class TbPromptAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  answer: string;

  @ManyToOne(type=>TbPrompt)
  prompt: number;

  @ManyToOne(type => TbUser)
  user: number
}



// prompt: what is your fav fruit: 21
// { id: <uniqye>, answer: "Mango", promptId: 21, user: 1908 }

// 