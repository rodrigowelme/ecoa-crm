import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/deals.service';
import type { DealFormData } from '@/schemas/deal.schema';
import type { MoveDealVariables } from '@/types/api/move-deal.type';
import { dealKeys } from './use-deals';

export function useDealMutations() {
  const queryClient = useQueryClient();

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: dealKeys.findAll,
    });

  const create = useMutation({
    mutationFn: (data: DealFormData) => {
      return dealsService.create(data);
    },
    onSuccess: refresh,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DealFormData> }) => {
      return dealsService.update(id, data);
    },
    onSuccess: refresh,
  });

  const move = useMutation({
    mutationFn: ({ dealId, ...data }: MoveDealVariables) => {
      return dealsService.move(dealId, data);
    },
    onSuccess: refresh,
  });

  return { create, update, move };
}
