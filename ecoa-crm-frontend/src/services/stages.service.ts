import type { StageListResponse } from '@/types/api/stage-response.type';
import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api.constants';

const findAll = async () => {
  return await api.get<StageListResponse>(API_ENDPOINTS.STAGES.GET);
};

export const stagesService = {
  findAll,
};
