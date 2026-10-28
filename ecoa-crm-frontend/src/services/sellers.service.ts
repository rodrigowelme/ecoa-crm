import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api.constants';

const findAll = async () => {
  return await api.get(API_ENDPOINTS.SELLERS.GET);
};

export const sellersService = {
  findAll,
};
