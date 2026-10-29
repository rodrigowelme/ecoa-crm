# Ecoa CRM

CRM em formato Kanban desenvolvido para o **Desafio Técnico — Desenvolvedor(a) Pleno Full Stack** da Ecoa (empresa fictícia). O objetivo é acompanhar oportunidades comerciais, valores por etapa e motivos de perda, com regras protegidas no backend.

## Stack

- **Frontend:** React, Vite, TypeScript (`strict`), Tailwind CSS, dnd-kit, React Hook Form, Zod, Axios e TanStack React Query.
- **Backend:** Node.js, NestJS, TypeScript (`strict`), Prisma e Swagger/OpenAPI.
- **Dados:** PostgreSQL via Docker Compose, migrations versionadas e seed.
- **Testes:** testes de serviços, HTTP e funções do frontend (Jest/Vitest conforme os projetos).

## Funcionalidades e regras

- Seis etapas fixas, ordenadas: **Lead → Qualificado → Proposta → Negociação → Ganho / Perdido**, com tipos `OPEN`, `WON` e `LOST`.
- Seed com **3 vendedores** (sem autenticação) e **15 negócios** de exemplo.
- Criação e edição de negócios: título, valor, contato, responsável, previsão de fechamento e etapa; validação no servidor.
- Kanban com quantidade e soma em reais no cabeçalho de cada coluna, arraste entre etapas e reordenação dentro da mesma etapa, inclusive para baixo.
- Valores monetários armazenados em **centavos inteiros** (`valueCents`), evitando erros de ponto flutuante.
- Previsão de fechamento tratada como **data civil**: a conversão de entrada/saída evita alteração do dia em função do fuso horário.
- Entrada em `LOST` exige `lostReason` (`PRICE`, `COMPETITOR`, `NO_RESPONSE` ou `OTHER`), também validado na API. Cancelar o diálogo não confirma o movimento.
- Entrada em `WON` ou `LOST` grava `closedAt`; retorno a `OPEN` limpa `closedAt` e `lostReason`.
- Atualização otimista ao mover card, com restauração do estado anterior e mensagem em caso de falha.
- `CHAOS_FAIL_RATE` permite simular respostas **HTTP 500** na movimentação para testar rollback.

## Como executar localmente

**Pré-requisitos:** Node.js 20+, npm e Docker Desktop/Engine com Docker Compose funcionando.

Na raiz do repositório:

```bash
docker compose up -d
```

### Backend

```bash
cd ecoa-crm-backend
npm install
```

Crie `ecoa-crm-backend/.env` a partir do `.env.example` e ajuste a URL conforme as credenciais e a porta configuradas no `docker-compose.yml`. Exemplo **somente para desenvolvimento local**:

```dotenv
DATABASE_URL="postgresql://ecoa:ecoa_dev@localhost:5432/ecoa_crm?schema=public"
CHAOS_FAIL_RATE=0
```

Prepare o banco e inicie a API:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

O seed é necessário na configuração inicial, não em cada inicialização. A API fica, na configuração local utilizada, em `http://localhost:3000`, com Swagger em `http://localhost:3000/docs`.

### Frontend

Abra outro terminal na raiz do repositório:

```bash
cd ecoa-crm-frontend
npm install
```

Configure `VITE_API_URL=http://localhost:3000` em `ecoa-crm-frontend/.env` caso a aplicação exija essa variável, e execute:

```bash
npm run dev
```

Frontend: `http://localhost:5173` na configuração padrão do Vite.

> **Importante:** confirme os scripts de seed/testes nos `package.json` e as variáveis nos `.env.example` da versão entregue. Os comandos acima refletem o fluxo de desenvolvimento registrado; não foi feita nesta conversa uma instalação limpa do checkout final.

## API principal

| Método | Rota | Objetivo |
| --- | --- | --- |
| GET | `/deals` | Listar negócios e suas posições |
| POST | `/deals` | Criar negócio |
| PATCH | `/deals/:id` | Editar negócio |
| PATCH | `/deals/:id/move` | Mover/reordenar negócio |
| GET | `/stages` | Consultar etapas fixas |
| GET | `/sellers` | Consultar vendedores |

Exemplo de movimento (índice baseado em zero):

```json
{ "stageId": 2, "index": 0 }
```

Para Perdido:

```json
{ "stageId": 6, "index": 0, "lostReason": "PRICE" }
```

## Como a ordem dos cards é persistida (R3)

Cada negócio possui `stageId` e um **`position` inteiro** dentro da coluna. Ao mover, o backend remove o card da posição anterior, insere no índice de destino e **reindexa sequencialmente** os negócios das colunas afetadas em transação. A consulta retorna os cards ordenados por etapa e posição.

**E se mover mil vezes entre os mesmos dois vizinhos?** Os índices continuam inteiros e sequenciais; não são calculadas médias ou posições fracionárias. Portanto, não há acúmulo de precisão nem necessidade de renormalizar números fracionários após muitos movimentos. O custo da escolha é atualizar várias linhas em cada reordenação, aceitável para o funil pequeno deste desafio. Movimentos concorrentes exigem transações e tratamento de conflitos.

No frontend, a mutation de movimentação pode atualizar o cache do React Query antes da resposta; se a API falhar, o snapshot anterior é restaurado. Após confirmação, ocorre sincronização com o servidor. Para testar a falha, configure `CHAOS_FAIL_RATE=1`, reinicie a API e tente mover um card; depois retorne a `0`.

## Testes e verificações

Execute os testes nos diretórios de cada aplicação, usando os scripts definidos no respectivo `package.json`:

```bash
cd ecoa-crm-backend
npm test
```

Em outro terminal:

```bash
cd ecoa-crm-frontend
npm test
```

**Resultados registrados no histórico de revisão:** 24 testes de serviço, 15 testes HTTP e 6 testes de funções do frontend aprovados (**45 no total**). Em uma sessão anterior, foram também registrados testes de integração com PostgreSQL para migrations, seed, IDs, valores em centavos, datas, ordenação, fechamento, reabertura e falha simulada, além de verificações manuais no navegador.

**O que não ficou coberto:** os testes HTTP empregam serviço simulado; não há suíte automatizada de navegador nem testes específicos abrangentes de concorrência/retries. A última rodada relatada não repetiu a integração PostgreSQL, os builds nem os testes manuais no navegador. Essas verificações devem ser refeitas no checkout final antes da entrega.

## Decisões e alternativas

| Decisão | Motivo / alternativa considerada |
| --- | --- |
| NestJS modular | Organização de controllers, serviços, validação e injeção de dependências em vez de uma API mínima sem estrutura. |
| Prisma + PostgreSQL | Migrations, relacionamentos e transações explícitas. |
| Centavos inteiros | Somatórios exatos em vez de reais como ponto flutuante. |
| Data civil normalizada | Preservar o dia escolhido em diferentes fusos. |
| `position` inteiro | Simplicidade para poucos cards; alternativa fracionária evitaria reindexações mas exigiria controle de precisão. |
| React Query + Axios | Separar comunicação HTTP, estado do servidor e estado local da interface. |
| dnd-kit | Controle do arraste, colisões e suporte ao teclado. |
| Regras no backend | Impedir que a API seja contornada por requisições diretas. |

## Limites e próximos passos

O foco foi cumprir os itens obrigatórios antes dos diferenciais. Não foram priorizados autenticação, exclusão de negócios, busca/filtro avançados, histórico de mudanças de etapa, aviso de conflito entre duas abas (`409`), CI e empacotamento completo da aplicação em containers. A prioridade com mais tempo seria adicionar testes automatizados de ponta a ponta e de concorrência, além de validar a configuração a partir de um banco vazio e um clone limpo.

## Tempo e uso de IA

**Tempo total de trabalho informado: 6 horas.** O enunciado dimensionava o exercício para até 4 horas; o tempo registrado ultrapassou essa estimativa. O uso específico de IA não foi cronometrado separadamente.

O processo de colaboração, os prompts reais, as correções e os limites das verificações estão documentados no [AI_USAGE.md](./AI_USAGE.md).

## Entrega

Repositório Git privado, com histórico incremental de commits, migrations versionadas, `README.md`, `AI_USAGE.md` e `.env.example`. Nenhuma credencial ou segredo real deve ser versionado. O acesso ao repositório deve ser concedido às pessoas indicadas pela equipe avaliadora.
