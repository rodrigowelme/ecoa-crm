import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Deal, Stage } from '@prisma/client';
import { DealsService } from './deals.service.js';
import type { PrismaService } from '../database/prisma.service.js';

const stages: Stage[] = [
  { id: 1, name: 'Lead', color: '#aaa', order: 1, type: 'OPEN' },
  { id: 2, name: 'Proposta', color: '#bbb', order: 2, type: 'OPEN' },
  { id: 3, name: 'Ganho', color: '#ccc', order: 3, type: 'WON' },
  { id: 4, name: 'Perdido', color: '#ddd', order: 4, type: 'LOST' },
];

function deal(id: number, stageId: number, position: number): Deal {
  return {
    id,
    stageId,
    position,
    title: `Negócio ${id}`,
    valueCents: 123456,
    contactName: 'Contato',
    sellerId: 1,
    expectedCloseDate: new Date('2026-11-30T00:00:00Z'),
    closedAt: null,
    lostReason: null,
    createdAt: new Date('2026-10-01T00:00:00Z'),
    updatedAt: new Date('2026-10-01T00:00:00Z'),
  };
}

function setup(
  initial = [deal(1, 1, 0), deal(2, 1, 1), deal(3, 1, 2), deal(4, 2, 0)],
  failRate = 0,
) {
  const rows = initial.map((row) => ({ ...row }));
  const column = (stageId: number) =>
    rows
      .filter((row) => row.stageId === stageId)
      .sort((a, b) => a.position - b.position || a.id - b.id);
  const tx = {
    stage: {
      findUnique: vi.fn(
        async ({ where }: { where: { id: number } }) =>
          stages.find((stage) => stage.id === where.id) ?? null,
      ),
    },
    seller: { findUnique: vi.fn(async () => ({ id: 1, name: 'Ana' })) },
    deal: {
      findUnique: vi.fn(
        async ({ where }: { where: { id: number } }) =>
          rows.find((row) => row.id === where.id) ?? null,
      ),
      findMany: vi.fn(
        async ({
          where,
        }: {
          where: { stageId: number; id?: { not: number } };
        }) =>
          column(where.stageId)
            .filter((row) => row.id !== where.id?.not)
            .map((row) => ({ id: row.id })),
      ),
      count: vi.fn(
        async ({ where }: { where: { stageId: number } }) =>
          column(where.stageId).length,
      ),
      update: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { id: number };
          data: Partial<Deal>;
        }) => {
          const row = rows.find((item) => item.id === where.id);
          if (!row) throw new Error('Registro inexistente');
          Object.assign(row, data);
          return { ...row };
        },
      ),
      updateMany: vi.fn(
        async ({
          where,
        }: {
          where: { stageId: number; position: { gt: number } };
        }) => {
          const matches = rows.filter(
            (row) =>
              row.stageId === where.stageId && row.position > where.position.gt,
          );
          matches.forEach((row) => {
            row.position--;
          });
          return { count: matches.length };
        },
      ),
      create: vi.fn(async ({ data }: { data: Partial<Deal> }) => {
        const row = { ...deal(100, 1, 0), ...data };
        rows.push(row);
        return row;
      }),
    },
  };
  const prisma = {
    ...tx,
    $transaction: vi.fn(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    ),
  };
  const service = new DealsService(
    prisma as unknown as PrismaService,
    new ConfigService({ CHAOS_FAIL_RATE: failRate }),
  );
  return { service, rows, column, tx };
}

describe('DealsService: ordenação e regras do funil', () => {
  it('CHAOS_FAIL_RATE=1 responde 500 sem alterar os negócios', async () => {
    const { service, rows, tx } = setup(undefined, 1);
    const before = structuredClone(rows);
    await expect(
      service.move(1, { stageId: 2, index: 0 }),
    ).rejects.toMatchObject({
      status: 500,
      message: 'Falha simulada na movimentação.',
    });
    expect(rows).toEqual(before);
    expect(tx.deal.update).not.toHaveBeenCalled();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T16:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it.each([
    [1, 2, [2, 3, 1]],
    [3, 0, [3, 1, 2]],
    [2, 1, [1, 2, 3]],
  ])(
    'move o card %i ao índice final %i na mesma coluna',
    async (id, index, expected) => {
      const { service, column } = setup();
      await service.move(id, { stageId: 1, index });
      expect(column(1).map((row) => row.id)).toEqual(expected);
      expect(column(1).map((row) => row.position)).toEqual([0, 1, 2]);
    },
  );

  it.each([0, 1])(
    'insere entre colunas no índice %i e compacta a origem',
    async (index) => {
      const { service, column } = setup();
      const result = await service.move(2, { stageId: 2, index });
      expect(column(1).map((row) => row.id)).toEqual([1, 3]);
      expect(column(1).map((row) => row.position)).toEqual([0, 1]);
      expect(column(2).map((row) => row.id)).toEqual(
        index === 0 ? [2, 4] : [4, 2],
      );
      expect(column(2).map((row) => row.position)).toEqual([0, 1]);
      expect(result.position).toBe(index);
    },
  );

  it('move para uma coluna vazia', async () => {
    const { service, column } = setup();
    await service.move(2, { stageId: 3, index: 0 });
    expect(column(3).map((row) => row.id)).toEqual([2]);
    expect(column(3)[0].position).toBe(0);
  });

  it('mantém posições inteiras e contíguas após mil movimentos', async () => {
    const { service, column } = setup();
    for (let i = 0; i < 1000; i++) {
      await service.move(1, { stageId: 1, index: i % 2 === 0 ? 1 : 0 });
    }
    expect(column(1).map((row) => row.id)).toEqual([1, 2, 3]);
    expect(column(1).map((row) => row.position)).toEqual([0, 1, 2]);
  });

  it('recusa índice fora da coluna sem alterar registros', async () => {
    const { service, rows, tx } = setup();
    const before = structuredClone(rows);
    await expect(service.move(1, { stageId: 2, index: 2 })).rejects.toThrow(
      'Índice de destino inválido',
    );
    expect(rows).toEqual(before);
    expect(tx.deal.update).not.toHaveBeenCalled();
  });

  it('recusa entrar em Perdido sem motivo antes de gravar alterações', async () => {
    const { service, tx } = setup();
    await expect(
      service.move(1, { stageId: 4, index: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.deal.update).not.toHaveBeenCalled();
  });

  it.each(['PRICE', 'COMPETITOR', 'NO_RESPONSE', 'OTHER'] as const)(
    'registra fechamento e motivo %s ao perder',
    async (lostReason) => {
      const { service, rows } = setup();
      const result = await service.move(1, {
        stageId: 4,
        index: 0,
        lostReason,
      });
      expect(rows.find((row) => row.id === 1)).toMatchObject({
        stageId: 4,
        lostReason,
        closedAt: new Date(),
      });
      expect(result.closedAt).toBe('2026-10-29');
    },
  );

  it('registra a data ao ganhar', async () => {
    const { service, rows } = setup();
    await service.move(1, { stageId: 3, index: 0 });
    expect(rows.find((row) => row.id === 1)).toMatchObject({
      closedAt: new Date(),
      lostReason: null,
    });
  });

  it.each([3, 4])(
    'limpa fechamento e motivo ao reabrir da etapa %i',
    async (stageId) => {
      const closed = {
        ...deal(1, stageId, 0),
        closedAt: new Date('2026-10-20T00:00:00Z'),
        lostReason: stageId === 4 ? ('PRICE' as const) : null,
      };
      const { service, rows } = setup([closed]);
      await service.move(1, { stageId: 1, index: 0 });
      expect(rows[0]).toMatchObject({
        stageId: 1,
        closedAt: null,
        lostReason: null,
      });
    },
  );

  it('preserva motivo e fechamento ao reordenar em Perdido', async () => {
    const closedAt = new Date('2026-10-20T00:00:00Z');
    const { service, rows } = setup([
      { ...deal(1, 4, 0), closedAt, lostReason: 'PRICE' },
      { ...deal(2, 4, 1), closedAt, lostReason: 'OTHER' },
    ]);
    await service.move(1, { stageId: 4, index: 1 });
    expect(rows[0]).toMatchObject({
      position: 1,
      closedAt,
      lostReason: 'PRICE',
    });
  });

  it.each([1, 3])('recusa motivo de perda na etapa %i', async (stageId) => {
    const { service, tx } = setup();
    await expect(
      service.move(1, { stageId, index: 0, lostReason: 'PRICE' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.deal.update).not.toHaveBeenCalled();
  });

  it.each([3, 4])(
    'editar negócio encerrado na etapa %i preserva o fechamento',
    async (stageId) => {
      const closedAt = new Date('2026-10-20T00:00:00Z');
      const lostReason = stageId === 4 ? ('PRICE' as const) : null;
      const { service, rows } = setup([
        { ...deal(1, stageId, 0), closedAt, lostReason },
      ]);
      await service.update(1, { title: 'Título editado', stageId });
      expect(rows[0]).toMatchObject({
        title: 'Título editado',
        stageId,
        closedAt,
        lostReason,
      });
    },
  );

  it('a edição não permite contornar o motivo obrigatório', async () => {
    const { service, tx } = setup();
    await expect(service.update(1, { stageId: 4 })).rejects.toThrow(
      'Informe o motivo da perda',
    );
    expect(tx.deal.update).not.toHaveBeenCalled();
  });

  it('a criação também exige motivo na etapa Perdido', async () => {
    const { service, tx } = setup();
    await expect(
      service.create({
        title: 'Teste',
        valueCents: 100,
        contactName: 'Contato',
        sellerId: 1,
        stageId: 4,
        expectedCloseDate: '2026-11-30',
      }),
    ).rejects.toThrow('Informe o motivo da perda');
    expect(tx.deal.create).not.toHaveBeenCalled();
  });
});
