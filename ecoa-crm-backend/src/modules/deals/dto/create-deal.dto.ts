import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateDealDto {
  @ApiProperty({
    example: 'Implantação de CRM',
    description: 'Título do negócio',
  })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @Matches(/\S/, { message: 'O título não pode conter apenas espaços' })
  title: string;

  @ApiProperty({
    example: 150050,
    description: 'Valor do negócio em centavos (R$ 1.500,50)',
    minimum: 0,
    maximum: 2147483647,
  })
  @IsInt()
  @Min(0)
  @Max(2147483647)
  valueCents: number;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do contato',
  })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({
    example: 1,
    description: 'ID do vendedor responsável',
  })
  @IsInt()
  @IsPositive()
  sellerId: number;

  @ApiProperty({
    example: 1,
    description: 'ID da etapa do funil',
  })
  @IsInt()
  @IsPositive()
  stageId: number;

  @ApiProperty({
    example: '2026-11-15',
    format: 'date',
  })
  @IsISO8601({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  expectedCloseDate: string;

  @ApiPropertyOptional({
    example: 'PRICE',
    description: 'Motivo da perda, obrigatório quando a etapa é Perdido',
    enum: ['PRICE', 'COMPETITOR', 'NO_RESPONSE', 'OTHER'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['PRICE', 'COMPETITOR', 'NO_RESPONSE', 'OTHER'])
  lostReason?: string;
}
