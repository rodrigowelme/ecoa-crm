import type { StageType } from '../crm';

export type StageResponse = {
  id: number;
  name: string;
  color: string;
  order: number;
  type: StageType;
};

export type StageListResponse = StageResponse[];
