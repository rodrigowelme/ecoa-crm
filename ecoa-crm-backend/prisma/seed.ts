import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não configurada');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Usamos UTC porque os campos do banco são DATE (sem horário).
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function main() {
  const stages = [
    { id: 1, name: 'Lead', color: '#94A3B8', order: 1, type: 'OPEN' },
    { id: 2, name: 'Qualificado', color: '#38BDF8', order: 2, type: 'OPEN' },
    { id: 3, name: 'Proposta', color: '#A78BFA', order: 3, type: 'OPEN' },
    { id: 4, name: 'Negociação', color: '#F59E0B', order: 4, type: 'OPEN' },
    { id: 5, name: 'Ganho', color: '#22C55E', order: 5, type: 'WON' },
    { id: 6, name: 'Perdido', color: '#EF4444', order: 6, type: 'LOST' },
  ] as const;

  const sellers = [
    { id: 1, name: 'Ana Souza' },
    { id: 2, name: 'Bruno Lima' },
    { id: 3, name: 'Carla Mendes' },
  ];

  const deals = [
    {
      id: 1,
      title: 'Implantação CRM',
      valueCents: 1250000,
      contactName: 'João Silva',
      sellerId: 1,
      stageId: 1,
      position: 0,
      expectedCloseDate: '2026-11-10',
    },
    {
      id: 2,
      title: 'Licenças de software',
      valueCents: 480000,
      contactName: 'Maria Costa',
      sellerId: 2,
      stageId: 1,
      position: 1,
      expectedCloseDate: '2026-11-12',
    },
    {
      id: 3,
      title: 'Consultoria comercial',
      valueCents: 750000,
      contactName: 'Pedro Alves',
      sellerId: 3,
      stageId: 1,
      position: 2,
      expectedCloseDate: '2026-11-15',
    },

    {
      id: 4,
      title: 'Automação de vendas',
      valueCents: 2300000,
      contactName: 'Fernanda Rocha',
      sellerId: 1,
      stageId: 2,
      position: 0,
      expectedCloseDate: '2026-11-18',
    },
    {
      id: 5,
      title: 'Treinamento de equipe',
      valueCents: 320000,
      contactName: 'Ricardo Gomes',
      sellerId: 2,
      stageId: 2,
      position: 1,
      expectedCloseDate: '2026-11-20',
    },
    {
      id: 6,
      title: 'Integração ERP',
      valueCents: 1850000,
      contactName: 'Juliana Martins',
      sellerId: 3,
      stageId: 2,
      position: 2,
      expectedCloseDate: '2026-11-22',
    },

    {
      id: 7,
      title: 'Plataforma de atendimento',
      valueCents: 980000,
      contactName: 'Carlos Oliveira',
      sellerId: 1,
      stageId: 3,
      position: 0,
      expectedCloseDate: '2026-11-25',
    },
    {
      id: 8,
      title: 'Dashboard gerencial',
      valueCents: 640000,
      contactName: 'Patrícia Nunes',
      sellerId: 2,
      stageId: 3,
      position: 1,
      expectedCloseDate: '2026-11-28',
    },
    {
      id: 9,
      title: 'Portal de clientes',
      valueCents: 1450000,
      contactName: 'Lucas Ferreira',
      sellerId: 3,
      stageId: 3,
      position: 2,
      expectedCloseDate: '2026-12-02',
    },

    {
      id: 10,
      title: 'Migração de dados',
      valueCents: 890000,
      contactName: 'Beatriz Ramos',
      sellerId: 1,
      stageId: 4,
      position: 0,
      expectedCloseDate: '2026-11-05',
    },
    {
      id: 11,
      title: 'Sistema de relatórios',
      valueCents: 1100000,
      contactName: 'André Pereira',
      sellerId: 2,
      stageId: 4,
      position: 1,
      expectedCloseDate: '2026-11-08',
    },

    {
      id: 12,
      title: 'Contrato de suporte',
      valueCents: 560000,
      contactName: 'Renata Dias',
      sellerId: 3,
      stageId: 5,
      position: 0,
      expectedCloseDate: '2026-10-20',
      closedAt: '2026-10-20',
    },
    {
      id: 13,
      title: 'Projeto de integração',
      valueCents: 1750000,
      contactName: 'Eduardo Lopes',
      sellerId: 1,
      stageId: 5,
      position: 1,
      expectedCloseDate: '2026-10-23',
      closedAt: '2026-10-23',
    },

    {
      id: 14,
      title: 'Pacote de consultoria',
      valueCents: 420000,
      contactName: 'Camila Ribeiro',
      sellerId: 2,
      stageId: 6,
      position: 0,
      expectedCloseDate: '2026-10-18',
      closedAt: '2026-10-18',
      lostReason: 'PRICE',
    },
    {
      id: 15,
      title: 'Implantação de BI',
      valueCents: 1350000,
      contactName: 'Roberto Almeida',
      sellerId: 3,
      stageId: 6,
      position: 1,
      expectedCloseDate: '2026-10-21',
      closedAt: '2026-10-21',
      lostReason: 'COMPETITOR',
    },
  ] as const;

  await prisma.$transaction(async (tx) => {
    const [stageCount, sellerCount, dealCount] = await Promise.all([
      tx.stage.count(),
      tx.seller.count(),
      tx.deal.count(),
    ]);

    if (stageCount || sellerCount || dealCount) {
      throw new Error(
        'O banco já contém registros. Seed interrompido para preservar os dados.',
      );
    }

    for (const stage of stages) {
      await tx.stage.create({ data: stage });
    }

    for (const seller of sellers) {
      await tx.seller.create({ data: seller });
    }

    for (const deal of deals) {
      await tx.deal.create({
        data: {
          ...deal,
          expectedCloseDate: date(deal.expectedCloseDate),
          closedAt: 'closedAt' in deal ? date(deal.closedAt) : null,
          lostReason: 'lostReason' in deal ? deal.lostReason : null,
        },
      });
    }
  });

  console.log('Seed concluído com sucesso!');
  console.log('6 etapas, 3 vendedores e 15 negócios cadastrados.');
}

main()
  .catch((error: unknown) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
