import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DealsController } from '../src/modules/deals/deals.controller.js';
import { DealsService } from '../src/modules/deals/deals.service.js';

// Contrato HTTP e DTOs; regras do serviço são testadas separadamente.
describe('Deals HTTP (serviço simulado, sem PostgreSQL)', () => {
  let app: INestApplication<App>;
  const service = {
    create: vi.fn(async () => ({ id: 1 })),
    update: vi.fn(async () => ({ id: 1 })),
    move: vi.fn(async () => ({ id: 1 })),
  };
  const valid = {
    title: 'Contrato',
    valueCents: 123456,
    contactName: 'Ana',
    sellerId: 1,
    stageId: 1,
    expectedCloseDate: '2026-11-30',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [{ provide: DealsService, useValue: service }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  it('aceita valor inteiro em centavos e data sem horário', async () => {
    await request(app.getHttpServer()).post('/deals').send(valid).expect(201);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining(valid));
  });
  it.each([
    { valueCents: -1 },
    { valueCents: 1.5 },
    { title: '' },
    { title: '   ' },
    { title: '\t\n' },
    { expectedCloseDate: '2026-02-30' },
    { expectedCloseDate: '2026-11-30T00:00:00Z' },
  ])('recusa entrada inválida: %j', async (invalid) => {
    await request(app.getHttpServer())
      .post('/deals')
      .send({ ...valid, ...invalid })
      .expect(400);
    expect(service.create).not.toHaveBeenCalled();
  });
  it.each(['', '   ', '\t\n'])(
    'recusa título vazio na edição: %j',
    async (title) => {
      await request(app.getHttpServer())
        .patch('/deals/1')
        .send({ title })
        .expect(400);
      expect(service.update).not.toHaveBeenCalled();
    },
  );

  it.each([
    { stageId: 1, index: -1 },
    { stageId: 1, index: 0.5 },
    { stageId: 4, index: 0, lostReason: 'INVALID' },
  ])('valida o movimento antes de chamar o serviço: %j', async (payload) => {
    await request(app.getHttpServer())
      .patch('/deals/1/move')
      .send(payload)
      .expect(400);
    expect(service.move).not.toHaveBeenCalled();
  });
  it('encaminha id numérico, índice e motivo para o serviço', async () => {
    const payload = { stageId: 4, index: 0, lostReason: 'PRICE' };
    await request(app.getHttpServer())
      .patch('/deals/1/move')
      .send(payload)
      .expect(200);
    expect(service.move).toHaveBeenCalledWith(
      1,
      expect.objectContaining(payload),
    );
  });
});
