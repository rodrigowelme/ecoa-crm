import type { LostReason } from '@/types/crm';

export type MoveDealPayload = {
  stageId: number;
  index: number;
  lostReason?: LostReason;
};

export type MoveDealVariables = MoveDealPayload & {
  dealId: number;
};
