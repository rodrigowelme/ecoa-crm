import { Module } from '@nestjs/common';
import { StagesController } from './stages.controller.js';
import { StagesService } from './stages.service.js';

@Module({
  controllers: [StagesController],
  providers: [StagesService]
})
export class StagesModule {}
