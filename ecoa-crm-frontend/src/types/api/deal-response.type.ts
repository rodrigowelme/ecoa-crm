import type { LostReason, StageType } from '../crm';

export type DealResponse = {
  id: number;
  title: string;
  valueCents: number;
  contactName: string;
  expectedCloseDate: string;
  position: number;
  closedAt: string | null;
  lostReason: LostReason | null;
  sellerId: number;
  stageId: number;
  createdAt: string;
  updatedAt: string;
  stage: {
    id: number;
    name: string;
    color: string;
    order: number;
    type: StageType;
  };
  seller: {
    id: number;
    name: string;
  };
};

export type DealListResponse = DealResponse[];
