import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellersService } from './sellers.service.js';

@ApiTags('Sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vendedores' })
  findAll() {
    return this.sellersService.findAll();
  }
}
