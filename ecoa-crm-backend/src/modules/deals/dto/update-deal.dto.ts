import { PartialType } from '@nestjs/swagger';
import { CreateDealDto } from './create-deal.dto.js';

export class UpdateDealDto extends PartialType(CreateDealDto) {}
