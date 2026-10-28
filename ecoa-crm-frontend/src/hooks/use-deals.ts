import { useQuery } from '@tanstack/react-query';
import { dealsService } from '@/services/deals.service';

export const dealKeys = {
  findAll: ['deals'] as const,
};

export function useDeals() {
  return useQuery({
    queryKey: dealKeys.findAll,
    queryFn: dealsService.findAll,
    staleTime: 1000 * 60 * 5,
  });
}
