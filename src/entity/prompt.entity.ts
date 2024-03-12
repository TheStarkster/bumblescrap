import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// this table will be seeded or prefilled by us... with 49 entries
@Entity('tb_prompt')
export class TbPrompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prompt: string;
}
