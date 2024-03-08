import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('tb_user')
export class TbUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

}
