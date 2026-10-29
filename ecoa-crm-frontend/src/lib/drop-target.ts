import type { Deal } from '@/types/crm';
import type { DragOverEvent, DragEndEvent } from '@dnd-kit/core';

export type DropTarget = {
  stageId: number;
  index: number;
};

export function getDropTarget(overId: string, deals: Deal[], activeDealId: number, insertAfter = false): DropTarget | null {
  if (overId.startsWith('stage-')) {
    const stageId = Number(overId.replace('stage-', ''));

    const index = deals.filter(
      (deal) => deal.stageId === stageId && deal.id !== activeDealId,
    ).length;

    return { stageId, index };
  }

  if (overId.startsWith('deal-')) {
    const overDealId = Number(overId.replace('deal-', ''));

    const overDeal = deals.find((deal) => deal.id === overDealId);

    if (!overDeal) return null;

    const targetDeals = deals
      .filter((deal) => deal.stageId === overDeal.stageId && deal.id !== activeDealId)
      .sort((a, b) => a.position - b.position);

    const index = targetDeals.findIndex((deal) => deal.id === overDealId);

    if (index < 0) return null;

    return {
      stageId: overDeal.stageId,
      index: index + (insertAfter ? 1 : 0),
    };
  }

  return null;
}

export function isAfterTarget(event: DragOverEvent | DragEndEvent, deals: Deal[]): boolean {
  if (event.activatorEvent.type === 'keydown' && event.over) {
    const moving = deals.find((deal) => `deal-${deal.id}` === String(event.active.id));
    const targetDeal = deals.find((deal) => `deal-${deal.id}` === String(event.over?.id));
    return Boolean(moving && targetDeal && moving.stageId === targetDeal.stageId && moving.position < targetDeal.position);
  }
  const dragged = event.active.rect.current.translated;
  const target = event.over?.rect;
  return Boolean(dragged && target && dragged.top + dragged.height / 2 > target.top + target.height / 2);
}

