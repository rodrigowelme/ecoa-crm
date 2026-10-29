import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/deals.service';
import type { DealFormData } from '@/schemas/deal.schema';
import type { MoveDealVariables } from '@/types/api/move-deal.type';
import { dealKeys } from './use-deals';
import { stageKeys } from './use-stages';
import { moveDealLocally } from '@/lib/move-deal';
import type { AxiosResponse } from 'axios';
import type { DealListResponse } from '@/types/api/deal-response.type';
import type { StageListResponse } from '@/types/api/stage-response.type';

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
    onMutate: async (variables) => {
      // Uma consulta em andamento não deve sobrescrever a posição otimista.
      await queryClient.cancelQueries({ queryKey: dealKeys.findAll });

      const previous = queryClient.getQueryData<AxiosResponse<DealListResponse>>(
        dealKeys.findAll,
      );
      const stages = queryClient.getQueryData<AxiosResponse<StageListResponse>>(
        stageKeys.all,
      );

      if (previous && stages) {
        queryClient.setQueryData<AxiosResponse<DealListResponse>>(dealKeys.findAll, {
          ...previous,
          data: moveDealLocally(previous.data, stages.data, variables),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dealKeys.findAll, context.previous);
      }
    },
    onSettled: refresh,
  });

  return { create, update, move };
}
