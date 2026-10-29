# Uso de IA

Este relato considera esta conversa e a conversa anterior fornecida pelo candidato, intitulada **“Identificar tarefas pendentes”**. O objetivo é descrever como a IA foi utilizada e o que foi efetivamente verificado, sem atribuir ao candidato ou às ferramentas ações não registradas.

## Ferramentas e modelos

Utilizei **Codex** para comparar o projeto com o enunciado, identificar pendências, implementar correções em etapas, criar testes e revisar a entrega. Também utilizei **ChatGPT** como apoio na elaboração e revisão de código e documentação. A sessão atual se identifica como baseada em **GPT-6**; a variante exata e o modelo da conversa anterior não foram confirmados.

Nos históricos fornecidos, foram utilizadas verificações com **TypeScript, ESLint, oxlint e Vitest**, além de **Prisma/PostgreSQL** para integração com o banco e automação de navegador para conferir fluxos de interface.

## Como trabalhei

Preferi trabalhar **por etapas**, em vez de pedir toda a aplicação em um único prompt. Primeiro solicitei uma análise do que faltava; depois avancei item a item com mensagens como “vamos por etapa primeiro item 1”, “item 2” e os números seguintes. Após outra revisão, pedi “implemente essas correções”.

A IA auxiliou nas correções de atualização otimista e rollback, reabertura de negócios perdidos, normalização de datas, edição de negócios encerrados, ordenação e regras do funil, modo estrito no frontend, validação de títulos, falha simulada HTTP 500, sequências de IDs, mensagens de API, carregamento de dados, cálculo do destino do arraste e documentação.

Os resultados foram analisados por meio de erros apresentados na aplicação, testes automatizados, logs, execução com PostgreSQL e conferências de fluxos no navegador. A revisão e a compreensão do código entregue continuam sendo de minha responsabilidade.

Não foi criado um arquivo de instruções `AGENTS.md`, `CLAUDE.md` ou equivalente nos históricos fornecidos.

## Dois prompts importantes

### 1. “vamos por etapa primeiro item 1”

Esse prompt deu início à implementação gradual das pendências, incluindo a movimentação otimista no React Query, a restauração do estado anterior em caso de erro, a apresentação de mensagem ao usuário e o controle de movimentações simultâneas. Foram registradas verificações de cache, rollback, TypeScript e lint.

### 2. “implemente essas correções”

Depois de uma nova revisão, usei esse prompt para consolidar problemas identificados. As mudanças registradas incluíram correções do seed, mensagens da API, carregamento do formulário, configuração de execução a partir do zero, destino do arraste, documentação e testes de integração com PostgreSQL.

## Onde a IA errou

### Sequências de IDs em banco existente — commit `c1ade8e`

A primeira correção da sequência automática de IDs foi aplicada ao seed e resolvia a preparação de **bancos novos**, mas não corrigia um banco **já populado**. Ao tentar criar um negócio, encontrei um erro de conflito de chave primária e compartilhei o log.

A partir desse problema, foi criada uma **migration** para reparar as sequências já existentes, preservando os registros. O comportamento de geração automática de IDs foi testado novamente.

### Reordenação por teclado — commit `187da22`

Outra falha ocorreu no drag-and-drop pelo teclado: a estratégia de colisão priorizava a coluna em vez de um card específico, levando o negócio para o final da etapa. A verificação no navegador revelou o problema; a lógica de colisão e o cálculo do destino foram revisados e novos testes foram acrescentados.

### Revisão do relato

Nesta conversa, o primeiro relato sobre IA considerava apenas o chat atual. Depois que forneci o histórico anterior, o documento foi atualizado para incluir implementações e verificações registradas naquela etapa. Isso evita atribuir ao histórico errado decisões e testes.

## Verificações e limites

Na conversa anterior, foram registrados testes com **PostgreSQL real** envolvendo migrations, seed, IDs automáticos, centavos, datas, ordenação persistida, fechamento, reabertura e falha simulada. Também houve verificações manuais no navegador para edição de negócio perdido, reordenação por teclado após recarregar, rollback com toast e cancelamento do motivo de perda.

Nesta conversa, os testes existentes foram executados novamente, com os seguintes resultados relatados:

- **24 testes de serviço** aprovados;
- **15 testes HTTP** aprovados;
- **6 testes de funções do frontend** aprovados.

**Total: 45 testes aprovados.** A integração com PostgreSQL, os builds e a conferência no navegador **não foram refeitos nesta última sessão**.

Os testes HTTP utilizam um serviço simulado. Não há suíte automatizada de navegador nem testes específicos completos de concorrência e novas tentativas. As verificações manuais não substituem testes automatizados desses cenários.

## Tempo

O tempo total informado de desenvolvimento do projeto foi de **6 horas**, incluindo trabalho de implementação, revisão e verificação. Esse valor não é uma medição específica de tempo de IA. O tempo de uso de IA não foi cronometrado.

O enunciado estimava até 4 horas; a duração relatada ultrapassou a estimativa, e este documento a registra sem ajustes.
