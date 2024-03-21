import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbUser } from './entity/user.entity';
import { TbInterest } from './entity/interest.entity';
import { TbPrompt } from './entity/prompt.entity';
import { TbPromptAnswer } from './entity/prompt_answer.entity';
import { TbUserImage } from './entity/user_image.entity';
import { config } from "dotenv";
import { AppService } from './app.service';


config()
 //console.log(process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);
 
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [TbUser,TbInterest,TbPrompt, TbPromptAnswer,TbUserImage],
      synchronize: true, // Caution: Only use in development
    }), 
    TypeOrmModule.forFeature([TbUser,TbInterest,TbPrompt, TbPromptAnswer,TbUserImage])
    
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
