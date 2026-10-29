# Uso de IA

## Ferramentas e modelos

Codex (baseado em GPT-6, conforme a identificação desta sessão) neste chat para comparar o código com o enunciado, corrigir o front e o back,
escrever testes e revisar a entrega. TypeScript, ESLint, oxlint, Vitest e Prisma
foram usados para verificar resultados. A variante exata do modelo não foi
confirmada. Não há informação sobre outras ferramentas anteriores a esta conversa.

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

Na validação final, o navegador foi usado para confirmar o rollback com
`CHAOS_FAIL_RATE=1` e o aviso de erro do React Toastify, além do cancelamento da
perda sem alterar a etapa após recarregar. As instâncias temporárias de teste não
alteraram a configuração do frontend principal na porta 5173.
