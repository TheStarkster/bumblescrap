import { Entity, PrimaryGeneratedColumn,Column, OneToMany, ManyToOne } from "typeorm";
import { TbUser } from "./user.entity";

@Entity("tb_user_image")
export class TbUserImage{
    
    @PrimaryGeneratedColumn()
    id: number
     
    @Column()
    url: string

    @ManyToOne(() => TbUser)  // connect with user entity , one user have many photos so we use OneToMany
    user: number;

}

