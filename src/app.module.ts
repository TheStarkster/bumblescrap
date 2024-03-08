import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbUser } from './entity/user.entity';
import { TbInterest } from './entity/interest.entity';
import { TbPrompt } from './entity/prompt.entity';
import { TbPromptAnswer } from './entity/prompt_answer.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'bumblescrap_db',
      entities: [TbUser,TbInterest,TbPrompt, TbPromptAnswer],
      synchronize: true, // Caution: Only use in development
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
