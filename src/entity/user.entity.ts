import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('tb_user')
export class TbUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string

  @Column()
  age: string

  @Column({ nullable: true })
  about: string

  @Column()
  is_verified: string

  @Column({ nullable: true })
  occupation: string
}



// after organising the data..

// 1. create user in tb_user -> it will give you a unique userId
// 2. fill images table using this above userId
// 3. fill prompt vlaues using above userId, and the promptId should be found using tb_prompt table (pehle prompt scrap hoga uske baad uss string ko tb_prompt table mein dhoondenge ki uss prompt ki id kya hai and then usse tb_prompt_answe mein istemaal karenge)
// 4. fill interests keys and values using above userId

