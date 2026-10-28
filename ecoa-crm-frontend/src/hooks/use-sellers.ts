import { useQuery } from '@tanstack/react-query';
import { sellersService } from '@/services/sellers.service';

export const sellerKeys = {
  all: ['sellers'] as const,
};

export function useSellers() {
  return useQuery({
    queryKey: sellerKeys.all,
    queryFn: sellersService.findAll,
    staleTime: 1000 * 60 * 5,
  });
}
