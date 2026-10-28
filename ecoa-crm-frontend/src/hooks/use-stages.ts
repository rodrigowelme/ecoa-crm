import { useQuery } from '@tanstack/react-query';
import { stagesService } from '@/services/stages.service';

export const stageKeys = {
  all: ['stages'] as const,
};

export function useStages() {
  return useQuery({
    queryKey: stageKeys.all,
    queryFn: stagesService.findAll,
    staleTime: 1000 * 60 * 5,
  });
}
