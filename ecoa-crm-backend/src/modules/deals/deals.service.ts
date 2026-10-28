import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { LostReason, Prisma } from '@prisma/client';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { PrismaService } from '../database/prisma.service.js';
import { MoveDealDto } from './dto/move-deal.dto.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private parseDate(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException('Data inválida');
    }

    return date;
  }

  private getLostReason(value?: string | null): LostReason | null {
    if (!value) return null;

    if (!Object.values(LostReason).includes(value as LostReason)) {
      throw new BadRequestException('Motivo de perda inválido');
    }

    return value as LostReason;
  }

  findAll() {
    return this.prisma.deal.findMany({
      include: { stage: true, seller: true },
      orderBy: [{ stage: { order: 'asc' } }, { position: 'asc' }],
    });
  }

  async create(dto: CreateDealDto) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: dto.stageId },
    });

    if (!stage) {
      throw new NotFoundException('Etapa não encontrada.');
    }

    const seller = await this.prisma.seller.findUnique({
      where: { id: dto.sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Vendedor não encontrado');
    }

    const lostReason = this.getLostReason(dto.lostReason);

    if (stage.type === 'LOST' && !lostReason) {
      throw new BadRequestException('Informe o motivo da perda');
    }

    if (stage.type !== 'LOST' && lostReason) {
      throw new BadRequestException(
        'Motivo da perda só é permitido na etapa Perdido',
      );
    }

    const expectedCloseDate = this.parseDate(dto.expectedCloseDate);

    return this.prisma.$transaction(async (tx) => {
      const position = await tx.deal.count({
        where: { stageId: dto.stageId },
      });

      return tx.deal.create({
        data: {
          title: dto.title.trim(),
          valueCents: dto.valueCents,
          contactName: dto.contactName.trim(),
          sellerId: dto.sellerId,
          stageId: dto.stageId,
          expectedCloseDate,
          position,
          closedAt: stage.type === 'OPEN' ? null : new Date(),
          lostReason,
        },
        include: { stage: true, seller: true },
      });
    });
  }

  async update(id: number, dto: UpdateDealDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.deal.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Negócio não encontrado');
      }

      const stageId = dto.stageId ?? existing.stageId;

      const stage = await tx.stage.findUnique({
        where: { id: stageId },
      });

      if (!stage) {
        throw new NotFoundException('Etapa não encontrada');
      }

      if (dto.sellerId !== undefined) {
        const seller = await tx.seller.findUnique({
          where: { id: dto.sellerId },
        });

        if (!seller) {
          throw new NotFoundException('Vendedor não encontrado');
        }
      }

      const changingStage = stageId !== existing.stageId;

      let lostReason: LostReason | null = null;

      if (stage.type === 'LOST') {
        lostReason =
          dto.lostReason !== undefined
            ? this.getLostReason(dto.lostReason)
            : existing.lostReason;

        if (!lostReason) {
          throw new BadRequestException('Informe o motivo da perda');
        }
      } else if (dto.lostReason) {
        throw new BadRequestException(
          'Motivo da perda só é permitido na etapa Perdido',
        );
      }

      let position = existing.position;

      if (changingStage) {
        await tx.deal.updateMany({
          where: {
            stageId: existing.stageId,
            position: { gt: existing.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        position = await tx.deal.count({
          where: { stageId },
        });
      }

      const data: Prisma.DealUncheckedUpdateInput = {
        ...(dto.title !== undefined && {
          title: dto.title.trim(),
        }),
        ...(dto.valueCents !== undefined && {
          valueCents: dto.valueCents,
        }),
        ...(dto.contactName !== undefined && {
          contactName: dto.contactName.trim(),
        }),
        ...(dto.sellerId !== undefined && {
          sellerId: dto.sellerId,
        }),
        ...(dto.expectedCloseDate !== undefined && {
          expectedCloseDate: this.parseDate(dto.expectedCloseDate),
        }),
        stageId,
        position,
        lostReason,
        closedAt:
          stage.type === 'OPEN'
            ? null
            : changingStage || !existing.closedAt
              ? new Date()
              : existing.closedAt,
      };

      return tx.deal.update({
        where: { id },
        data,
        include: { stage: true, seller: true },
      });
    });
  }

  async move(id: number, dto: MoveDealDto) {
    // Simulação de falhas para testar o rollback no React.
    const failRate = Number(this.config.get('CHAOS_FAIL_RATE') ?? 0);

    if (!Number.isFinite(failRate) || failRate < 0 || failRate > 1) {
      throw new Error('CHAOS_FAIL_RATE deve estar entre 0 e 1');
    }

    if (Math.random() < failRate) {
      throw new ServiceUnavailableException('Falha simulada na movimentação.');
    }

    // Repetimos a transação se houver conflito concorrente.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const movingDeal = await tx.deal.findUnique({
              where: { id },
            });

            if (!movingDeal) {
              throw new NotFoundException('Negócio não encontrado.');
            }

            const targetStage = await tx.stage.findUnique({
              where: { id: dto.stageId },
            });

            if (!targetStage) {
              throw new NotFoundException('Etapa não encontrada.');
            }

            const changedStage = movingDeal.stageId !== dto.stageId;

            if (
              targetStage.type === 'LOST' &&
              changedStage &&
              !dto.lostReason
            ) {
              throw new BadRequestException('Informe o motivo da perda.');
            }

            if (targetStage.type !== 'LOST' && dto.lostReason) {
              throw new BadRequestException(
                'Motivo de perda permitido apenas em Perdido.',
              );
            }

            // Ordena as colunas usando o estado atual do banco.
            const sourceDeals = await tx.deal.findMany({
              where: {
                stageId: movingDeal.stageId,
                id: { not: id },
              },
              orderBy: [{ position: 'asc' }, { id: 'asc' }],
              select: { id: true },
            });

            const targetDeals = changedStage
              ? await tx.deal.findMany({
                  where: { stageId: dto.stageId },
                  orderBy: [{ position: 'asc' }, { id: 'asc' }],
                  select: { id: true },
                })
              : [...sourceDeals];

            if (dto.index > targetDeals.length) {
              throw new BadRequestException('Índice de destino inválido.');
            }

            // Insere o negócio na posição final solicitada.
            targetDeals.splice(dto.index, 0, { id });

            // Atualiza as posições da coluna de destino.
            for (const [position, deal] of targetDeals.entries()) {
              await tx.deal.update({
                where: { id: deal.id },
                data: {
                  stageId: dto.stageId,
                  position,
                },
              });
            }

            // Compacta a coluna de origem, quando necessário.
            if (changedStage) {
              for (const [position, deal] of sourceDeals.entries()) {
                await tx.deal.update({
                  where: { id: deal.id },
                  data: { position },
                });
              }
            }

            // Atualiza as informações de fechamento.
            const closedAt =
              targetStage.type === 'OPEN'
                ? null
                : changedStage || !movingDeal.closedAt
                  ? new Date()
                  : movingDeal.closedAt;

            const lostReason =
              targetStage.type === 'LOST'
                ? (dto.lostReason ?? movingDeal.lostReason)
                : null;

            const updated = await tx.deal.update({
              where: { id },
              data: { closedAt, lostReason },
              select: {
                id: true,
                title: true,
                valueCents: true,
                contactName: true,
                expectedCloseDate: true,
                position: true,
                closedAt: true,
                lostReason: true,
                sellerId: true,
                stageId: true,
              },
            });

            // Mesmo contrato de datas do frontend.
            return {
              ...updated,
              expectedCloseDate: updated.expectedCloseDate
                .toISOString()
                .slice(0, 10),
              closedAt: updated.closedAt?.toISOString().slice(0, 10) ?? null,
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000,
          },
        );
      } catch (error) {
        const isConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';

        if (isConflict && attempt < 2) {
          continue;
        }

        throw error;
      }
    }

    throw new ServiceUnavailableException(
      'Não foi possível concluir a movimentação.',
    );
  }
}
