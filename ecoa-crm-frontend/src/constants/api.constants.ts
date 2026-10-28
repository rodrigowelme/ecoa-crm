export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  TIMEOUT: 10_000,
} as const;

export const API_ENDPOINTS = {
  STAGES: {
    GET: '/stages',
  },
  SELLERS: {
    GET: '/sellers',
  },
  DEALS: {
    GET: '/deals',
    CREATE: '/deals',
    UPDATE: (id: number) => `/deals/${id}`,
    MOVE: (id: number) => `/deals/${id}/move`,
  },
  DEAL_BY_ID: (id: number) => `/deals/${id}`,
  MOVE_DEAL: (id: number) => `/deals/${id}/move`,
} as const;
