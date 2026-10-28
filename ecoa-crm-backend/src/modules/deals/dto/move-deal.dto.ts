import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import type { LostReason } from '@prisma/client';

export class MoveDealDto {
  @ApiProperty({
    example: 2,
    description: 'ID da etapa de destino',
  })
  @IsInt()
  @IsPositive()
  stageId: number;

  @ApiProperty({
    example: 1,
    minimum: 0,
    description: 'Índice final do negócio na coluna (base zero)',
  })
  @IsInt()
  @Min(0)
  index: number;

  @ApiPropertyOptional({
    example: 'PRICE',
    enum: ['PRICE', 'COMPETITOR', 'NO_RESPONSE', 'OTHER'],
    description: 'Obrigatório ao mover para Perdido',
  })
  @IsOptional()
  @IsIn(['PRICE', 'COMPETITOR', 'NO_RESPONSE', 'OTHER'])
  lostReason?: LostReason;
}
