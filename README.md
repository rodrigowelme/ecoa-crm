# Ecoa CRM

CRM em Kanban com React, TypeScript estrito, NestJS, Prisma e PostgreSQL.
Seis etapas fixas, três vendedores e quinze negócios iniciais; criação e edição,
movimentação otimista com rollback, motivo da perda e reabertura.

## Executar localmente

Requisitos: Node.js 22.12+ e Docker Compose. Comandos abaixo em PowerShell, a partir
da raiz do repositório. As credenciais de exemplo são apenas de desenvolvimento.

```powershell
Copy-Item .env.example .env
Copy-Item .env.example ecoa-crm-backend/.env
Copy-Item ecoa-crm-frontend/.env.example ecoa-crm-frontend/.env
docker compose up -d --wait
npm --prefix ecoa-crm-backend ci
npm --prefix ecoa-crm-frontend ci
npm --prefix ecoa-crm-backend run db:setup
```

Em dois terminais:

```powershell
npm --prefix ecoa-crm-backend run start:dev
```

```powershell
npm --prefix ecoa-crm-frontend run dev
```

Interface: http://localhost:5173. API: http://localhost:3000. Swagger:
http://localhost:3000/docs. O Compose sobe o PostgreSQL; front e back rodam localmente.
O seed só aceita banco vazio e recusa sobrescrever registros. Nas próximas execuções,
use apenas `docker compose up -d --wait` e os dois comandos de desenvolvimento.
Para aplicar migrations posteriores: `npm --prefix ecoa-crm-backend run db:migrate`.

Se alterar usuário, senha, porta ou banco no `.env` da raiz, ajuste também a
`DATABASE_URL` no `.env` do backend. O Compose usa essas variáveis na criação do
banco; alterar o arquivo não troca a senha de um volume já inicializado.

## Verificações

```powershell
npm --prefix ecoa-crm-backend test
npm --prefix ecoa-crm-backend run test:e2e
npm --prefix ecoa-crm-backend run test:db
npm --prefix ecoa-crm-frontend test
npm --prefix ecoa-crm-backend run build
npm --prefix ecoa-crm-frontend run build
npm --prefix ecoa-crm-backend run lint
npm --prefix ecoa-crm-frontend run lint
```

`test:db` requer PostgreSQL e permissão de criar bancos: cria um banco temporário,
aplica migrations e seed, verifica criação após o seed, dinheiro, datas, ordem,
fechamento, reabertura e CHAOS, e remove apenas esse banco ao terminar.
Os dados do CRM não são usados nem alterados. As suítes Vitest usam substitutos do
Prisma/serviço e não precisam do banco.

## Decisões

- Dinheiro é armazenado e somado em centavos inteiros. Ponto flutuante em reais
  foi descartado para evitar divergências de arredondamento. O banco limita cada
  valor ao intervalo de um inteiro PostgreSQL.
- Previsão e fechamento usam `DATE`; o front preserva `YYYY-MM-DD` sem conversão
  de fuso. Datas de criação/atualização são instantes distintos desses campos.
- A ordem usa posições inteiras contíguas por coluna. Cada movimento remove o
  negócio da origem, insere no índice final e regrava as posições em transação
  serializável, com até três tentativas em conflito. Após mil inserções entre os
  mesmos vizinhos, continuam existindo posições inteiras, sem perda de precisão.
  Índices fracionários foram descartados para evitar rebalanceamento por precisão;
  o custo de regravar a coluna é aceitável para este CRM pequeno.
- O destino do arraste considera a metade superior/inferior do card para inserir
  antes/depois. A posição enviada é o índice final, após remover o próprio card.
- React Query aplica a mudança no cache, guarda o estado anterior e restaura em
  falha. Uma movimentação por vez evita sobreposição de rollbacks; ao terminar,
  a consulta é invalidada para sincronizar com o servidor.
- Encerrar pelo formulário foi descartado: o Kanban centraliza essa interação e
  pede o motivo ao entrar em Perdido. O formulário permite editar encerrados sem
  mudar a etapa ou reabri-los. O backend aplica as regras também em chamadas diretas.
- Sem login, conforme o escopo. Etapas e vendedores são preparados pelo seed.

## Teste manual de falha

No `.env` do backend, use `CHAOS_FAIL_RATE=1` e reinicie a API. Um movimento deve
aparecer imediatamente, retornar ao estado anterior e mostrar a mensagem da API
após o HTTP 500. Use latência de rede no navegador para observar a atualização.
Volte a variável para `0` para testar persistência após recarregar.

## Limitações e próximos passos

Não há testes automatizados de navegador para arraste real, cancelamento da perda,
formulários, carregamento parcial e rollback visual. Conflitos concorrentes e
retries da transação ainda precisam de testes específicos. Os testes HTTP usam o
serviço simulado; a integração PostgreSQL testa o serviço real sem HTTP.
Há seis testes de funções do frontend para destino do arraste por teclado/ponteiro,
datas e mensagens da API, usando o executor nativo do Node.js.
Em falha de rede depois do commit, a consulta posterior prevalece sobre o rollback
local, pois a gravação pode ter ocorrido no servidor.

Ficaram de fora os diferenciais: filtros/busca, histórico de etapas, conflito 409,
Dockerfiles da aplicação e CI. Com mais tempo, priorizaria testes de navegador e
concorrência antes desses diferenciais.

## Tempo e uso de IA

Tempo informado pelo candidato: **6 horas**, acima da estimativa de 4 horas do
enunciado. Uso de IA e exemplos reais desta conversa estão em [AI_USAGE.md](AI_USAGE.md).
O modelo exato e eventuais ferramentas usadas antes desta conversa não foram
informados; o documento não atribui ferramentas ou verificações sem evidência.

## Validação realizada nesta revisão

39 testes Vitest no backend, seis testes no frontend e a integração com PostgreSQL
real passaram. Typecheck e lint passaram no front e no back; builds foram verificados.
No navegador, foi conferida a edição de negócio perdido mantendo a etapa e a
persistência de reordenação por teclado após recarregar, com restauração da ordem
inicial. Também foram conferidos no navegador o rollback com
`CHAOS_FAIL_RATE=1`, o toast de erro da API e o cancelamento do motivo da perda,
com a etapa original preservada após recarregar. Essa conferência usou instâncias
temporárias nas portas 3001/5174; a aplicação principal continua em 3000/5173.
