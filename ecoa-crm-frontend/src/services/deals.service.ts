import { api } from './api';
import type { Deal } from '@/types/crm';
import type { DealFormData } from '@/schemas/deal.schema';
import type { DealListResponse } from '@/types/api/deal-response.type';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { MoveDealPayload } from '@/types/api/move-deal.type';
import { normalizeDealDates } from '@/lib/deal-dates';

const findAll = async () => {
  const response = await api.get<DealListResponse>(API_ENDPOINTS.DEALS.GET);
  return { ...response, data: response.data.map(normalizeDealDates) };
};

const create = async (data: DealFormData) => {
  const response = await api.post<Deal>(API_ENDPOINTS.DEALS.CREATE, data);
  return { ...response, data: normalizeDealDates(response.data) };
};

const update = async (id: number, payload: Partial<DealFormData>) => {
  const response = await api.patch<Deal>(API_ENDPOINTS.DEALS.UPDATE(id), payload);
  return { ...response, data: normalizeDealDates(response.data) };
};

const move = async (id: number, payload: MoveDealPayload) => {
  const response = await api.patch<Deal>(API_ENDPOINTS.DEALS.MOVE(id), payload);
  return { ...response, data: normalizeDealDates(response.data) };
};

export const dealsService = {
  findAll,
  create,
  update,
  move,
};
