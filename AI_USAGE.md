# Uso de IA

## Ferramentas e modelos

Codex neste chat para comparar o código com o enunciado, corrigir o front e o back,
escrever testes e revisar a entrega. TypeScript, ESLint, oxlint, Vitest e Prisma
foram usados para verificar resultados. O identificador exato do modelo e outras
ferramentas anteriores a esta conversa não foram informados pelo candidato.

## Como trabalhei

Primeiro pedi uma análise das pendências em relação ao enunciado. Depois conduzi
as correções em etapas, enviando os números dos itens. A IA leu os arquivos do
projeto, implementou alterações e executou verificações. Nesta conversa não foi
criado arquivo de instruções AGENTS.md ou equivalente. A revisão humana e o
entendimento do código devem ser confirmados pelo candidato antes da apresentação.

## Dois prompts importantes

1. Prompt real: `o que falta ainda fazer?`, com o PDF do desafio e o repositório.
   Resultado: comparação dos requisitos com o código, identificando ausência de
   atualização otimista, testes e documentação, além de erros de datas e reabertura.
2. Prompt real: `implemente essas correções`, após a segunda análise das pendências.
   Resultado: ajustes do seed e configuração, tratamento de erros e carregamento,
   revisão do destino do arraste, documentação e teste de integração PostgreSQL.

## Onde a IA errou

Na etapa de testes, a IA tentou substituir o teste do template usando remoção e
adição do mesmo caminho em um patch. A ferramenta removeu o arquivo e falhou ao
recriá-lo. A IA detectou a ausência com `git status` e a listagem do diretório,
recriou o arquivo em uma operação separada e executou a suíte HTTP com sucesso.
Os testes corrigidos estão no commit `f2d46c8`.

Outro erro detectado na revisão: a colisão do arraste por teclado priorizava a
coluna em vez do card, enviando o negócio ao fim. A IA observou esse comportamento
no navegador, priorizou colisões com cards e distinguiu subir/descer no cálculo do
índice final. Foram adicionados testes das funções de destino e conferida a
persistência no navegador após recarregar.
Correção e testes no commit `187da22`.

## Limites da verificação

Os comandos e resultados efetivamente executados são relatados ao final desta
conversa. Testes de serviço/HTTP simulados não demonstram que o arraste real no
navegador funciona. O tempo de trabalho informado pelo candidato é de 6 horas.
