import { Test, TestingModule } from '@nestjs/testing';
import { AppNodeController } from './app.controller';
import { AppNodeService } from './app.service';

describe('AppController', () => {
  let appController: AppNodeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppNodeController],
      providers: [AppNodeService],
    }).compile();

    appController = app.get<AppNodeController>(AppNodeController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
