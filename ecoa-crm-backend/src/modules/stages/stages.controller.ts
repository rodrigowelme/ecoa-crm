import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StagesService } from './stages.service.js';

@ApiTags('Stages')
@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar etapas do funil de vendas' })
  findAll() {
    return this.stagesService.findAll();
  }
}
