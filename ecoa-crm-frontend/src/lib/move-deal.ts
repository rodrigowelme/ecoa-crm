import type { DealResponse } from '@/types/api/deal-response.type';
import type { Stage } from '@/types/crm';
import type { MoveDealVariables } from '@/types/api/move-deal.type';

export function moveDealLocally(
  deals: DealResponse[],
  stages: Stage[],
  variables: MoveDealVariables,
): DealResponse[] {
  const { dealId, stageId, index, lostReason } = variables;

  const movingDeal = deals.find((deal) => deal.id === dealId);
  const targetStage = stages.find((stage) => stage.id === stageId);

  if (!movingDeal || !targetStage) return deals;

  const changedStage = movingDeal.stageId !== stageId;

  if (changedStage && targetStage.type === 'LOST' && !lostReason) {
    return deals;
  }

  const sortByPosition = (a: DealResponse, b: DealResponse) =>
    a.position - b.position || a.id - b.id;

  const sourceDeals = deals
    .filter((deal) => deal.stageId === movingDeal.stageId && deal.id !== dealId)
    .sort(sortByPosition);

  const targetDeals = changedStage
    ? deals.filter((deal) => deal.stageId === stageId).sort(sortByPosition)
    : [...sourceDeals];

  const finalIndex = Math.max(0, Math.min(index, targetDeals.length));

  const today = new Date().toISOString().slice(0, 10);

  const updatedDeal: DealResponse = {
    ...movingDeal,
    stageId,
    stage: targetStage,

    closedAt:
      targetStage.type === 'OPEN'
        ? null
        : changedStage || !movingDeal.closedAt
          ? today
          : movingDeal.closedAt,

    lostReason: targetStage.type === 'LOST' ? (lostReason ?? movingDeal.lostReason) : null,
  };

  targetDeals.splice(finalIndex, 0, updatedDeal);

  const updatedTarget = targetDeals.map((deal, position) => ({
    ...deal,
    position,
  }));

  const updatedSource = changedStage
    ? sourceDeals.map((deal, position) => ({
        ...deal,
        position,
      }))
    : [];

  const updates = new Map<number, DealResponse>(
    [...updatedSource, ...updatedTarget].map((deal) => [deal.id, deal]),
  );

  return deals.map((deal) => updates.get(deal.id) ?? deal);
}
