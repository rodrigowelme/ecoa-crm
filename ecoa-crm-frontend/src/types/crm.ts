export type StageType = 'OPEN' | 'WON' | 'LOST';

export type LostReason = 'PRICE' | 'COMPETITOR' | 'NO_RESPONSE' | 'OTHER';

export interface Stage {
  id: number;
  name: string;
  color: string;
  order: number;
  type: StageType;
}

export interface Seller {
  id: number;
  name: string;
}

export interface Deal {
  id: number;
  title: string;
  valueCents: number;
  contactName: string;
  sellerId: number;
  stageId: number;
  expectedCloseDate: string;
  position: number;
  closedAt: string | null;
  lostReason: LostReason | null;
}
