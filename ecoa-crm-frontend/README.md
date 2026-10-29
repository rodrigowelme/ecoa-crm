# Ecoa CRM - Frontend

React, Vite, TypeScript estrito, React Query e dnd-kit.
Consulte o [README principal](../README.md) para execução e decisões.

```sh
npm ci
npm run dev
npm test
npm run build
npm run lint
```

Configure VITE_API_URL conforme .env.example. A API usa http://localhost:3000
por padrão; o frontend abre em http://localhost:5173.

Os testes usam o executor nativo do Node.js e cobrem funções de destino do arraste,
datas e mensagens de erro. Ainda não há suíte automatizada de navegador.
