import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { DealsService } from './deals.service.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { MoveDealDto } from './dto/move-deal.dto.js';

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os negócios' })
  findAll() {
    return this.dealsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo negócio' })
  create(@Body() dto: CreateDealDto) {
    return this.dealsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um negócio' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do negócio' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Patch(':id/move')
  @ApiOperation({
    summary: 'Movimentar ou reordenar um negócio no Kanban',
  })
  move(@Param('id', ParseIntPipe) id: number, @Body() dto: MoveDealDto) {
    return this.dealsService.move(id, dto);
  }
}
