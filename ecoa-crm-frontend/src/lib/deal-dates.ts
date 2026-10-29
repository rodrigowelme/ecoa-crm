import type { Deal } from '@/types/crm';

export function normalizeDealDates<T extends Deal>(deal: T): T {
  // Campos DATE representam um dia; não devem passar por conversão de fuso.
  return {
    ...deal,
    expectedCloseDate: deal.expectedCloseDate.slice(0, 10),
    closedAt: deal.closedAt?.slice(0, 10) ?? null,
  };
}
