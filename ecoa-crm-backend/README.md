# Ecoa CRM - Backend

API NestJS com Prisma e PostgreSQL. Consulte o [README principal](../README.md)
para configuração, execução, decisões e limitações.

## Comandos (nesta pasta)

```sh
npm ci
npm run db:setup
npm run start:dev
```

O banco precisa estar disponível e DATABASE_URL configurada no .env.
O seed só é executado em banco vazio e não sobrescreve dados.

## Testes

```sh
npm test
npm run test:e2e
npm run test:db
```

Os testes de serviço usam um substituto do Prisma e cobrem ordenação, mil
movimentos, motivo de perda, fechamento, reabertura, edição de encerrados e CHAOS.
Os testes HTTP usam serviço simulado e verificam rotas e DTOs. test:db cria um
banco PostgreSQL temporário, aplica migrations e seed, verifica os fluxos reais e
remove apenas esse banco. Requer permissão para criar bancos.

Sem cobertura automatizada: navegador, concorrência e retries, rollback visual,
interação completa entre HTTP e PostgreSQL. Consulte o README principal.
