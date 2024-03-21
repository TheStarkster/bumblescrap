import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('open-bumble')
  openBumble() {
    return this.appService.openBumble();
  }

  @Get('extract-users')
  getExtractUsers() {
    return this.appService.extractUsers();
  } 

  @Get('/fix-images')
  fixImages(){
    return this.appService.fixImages();
  }
}





