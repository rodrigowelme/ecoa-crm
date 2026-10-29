import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { DealsService } from '../dist/modules/deals/deals.service.js';

// Nunca executa migrations ou seed no banco informado em DATABASE_URL.
const source = new URL(process.env.DATABASE_URL);
const database = `ecoa_test_${randomUUID().replaceAll('-', '')}`;
const adminUrl = new URL(source);
adminUrl.pathname = '/postgres';
const admin = new pg.Client({ connectionString: adminUrl.toString() });
const testUrl = new URL(source);
testUrl.pathname = `/${database}`;
const connectionString = testUrl.toString();
let prisma;
let created = false;
function prismaCommand(args) {
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/prisma/build/index.js',
      ...args,
      '--config',
      'prisma7.config.ts',
    ],
    {
      env: { ...process.env, DATABASE_URL: connectionString },
      encoding: 'utf8',
    },
  );
  if (result.status !== 0)
    throw new Error(`Comando Prisma falhou: ${result.stderr || result.stdout}`);
}

try {
  await admin.connect();
  await admin.query(`CREATE DATABASE "${database}"`);
  created = true;
  prismaCommand(['migrate', 'deploy']);
  prismaCommand(['db', 'seed']);
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  assert.equal(await prisma.stage.count(), 6);
  assert.equal(await prisma.seller.count(), 3);
  assert.equal(await prisma.deal.count(), 15);
  const service = new DealsService(
    prisma,
    new ConfigService({ CHAOS_FAIL_RATE: 0 }),
  );
  const data = {
    title: 'Verificação após seed',
    valueCents: 123456,
    contactName: 'Teste',
    sellerId: 1,
    stageId: 1,
    expectedCloseDate: '2026-11-30',
  };
  const first = await service.create(data);
  assert.ok(first.id > 15);
  assert.equal(
    first.expectedCloseDate.toISOString().slice(0, 10),
    data.expectedCloseDate,
  );
  const second = await service.create({
    ...data,
    title: 'Segundo negócio',
    valueCents: 1,
  });
  const seller = await prisma.seller.create({
    data: { name: 'Vendedor de teste' },
  });
  assert.ok(seller.id > 3);
  await assert.rejects(
    service.move(first.id, { stageId: 6, index: 0 }),
    /Informe o motivo/,
  );
  await service.move(first.id, { stageId: 6, index: 0, lostReason: 'PRICE' });
  const lost = await prisma.deal.findUniqueOrThrow({ where: { id: first.id } });
  assert.equal(lost.lostReason, 'PRICE');
  assert.ok(lost.closedAt);
  await service.update(first.id, { title: 'Editado em Perdido' });
  assert.equal(
    (
      await prisma.deal.findUniqueOrThrow({ where: { id: first.id } })
    ).closedAt.getTime(),
    lost.closedAt.getTime(),
  );
  await service.move(first.id, { stageId: 1, index: 0 });
  const reopened = await prisma.deal.findUniqueOrThrow({
    where: { id: first.id },
  });
  assert.equal(reopened.closedAt, null);
  assert.equal(reopened.lostReason, null);
  await service.move(first.id, { stageId: 1, index: 4 });
  await prisma.$disconnect();
  // Nova conexão simula uma leitura posterior, sem depender do cache do cliente.
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const column = await prisma.deal.findMany({
    where: { stageId: 1 },
    orderBy: { position: 'asc' },
  });
  assert.equal(column.at(-1).id, first.id);
  assert.deepEqual(
    column.map((row) => row.position),
    [0, 1, 2, 3, 4],
  );
  assert.equal(
    column.reduce((sum, row) => sum + row.valueCents, 0),
    2603457,
  );
  const chaos = new DealsService(
    prisma,
    new ConfigService({ CHAOS_FAIL_RATE: 1 }),
  );
  await assert.rejects(
    chaos.move(second.id, { stageId: 2, index: 0 }),
    (error) => error.getStatus() === 500,
  );
  assert.equal(
    (await prisma.deal.findUniqueOrThrow({ where: { id: second.id } })).stageId,
    1,
  );
  console.log(
    'PASS: migrations, seed, IDs automáticos, centavos, datas, ordenação persistida, perda, edição, reabertura e CHAOS 500 (PostgreSQL real).',
  );
} finally {
  await prisma?.$disconnect();
  // O nome só pode ser o banco aleatório criado por esta execução.
  if (created) await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`);
  await admin.end();
}
