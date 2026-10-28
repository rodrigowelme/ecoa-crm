import { api } from './api';
import type { Deal } from '@/types/crm';
import type { DealFormData } from '@/schemas/deal.schema';
import type { DealListResponse } from '@/types/api/deal-response.type';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { MoveDealPayload } from '@/types/api/move-deal.type';

const findAll = async () => {
  return await api.get<DealListResponse>(API_ENDPOINTS.DEALS.GET);
};

const create = async (data: DealFormData) => {
  return await api.post(API_ENDPOINTS.DEALS.CREATE, data);
};

const update = async (id: number, payload: Partial<DealFormData>): Promise<Deal> => {
  return await api.patch(API_ENDPOINTS.DEALS.UPDATE(id), payload);
};

const move = async (id: number, payload: MoveDealPayload) => {
  return await api.patch<Deal>(API_ENDPOINTS.DEALS.MOVE(id), payload);
};

export const dealsService = {
  findAll,
  create,
  update,
  move,
};
