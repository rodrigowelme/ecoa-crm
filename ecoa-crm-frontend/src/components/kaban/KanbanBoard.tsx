import { useState } from 'react';

import { KanbanColumn } from '@/components/kaban/KanbanColumn';
import { DealCardContent } from '@/components/kaban/DealCardContent';
import { sellers, stages } from '@/data/mocks';
import type { Deal } from '@/types/crm';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  rectIntersection,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';

import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface KanbanBoardProps {
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onMove: (dealId: number, stageId: number, index: number) => void;
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  // Prioriza cards diferentes daquele que está sendo arrastado.
  const cardCollisions = pointerCollisions.filter(
    ({ id }) => String(id).startsWith('deal-') && id !== args.active.id,
  );

  if (cardCollisions.length > 0) {
    return cardCollisions;
  }

  // Se não encontrou outro card, procura a coluna.
  const stageCollisions = pointerCollisions.filter(({ id }) => String(id).startsWith('stage-'));

  if (stageCollisions.length > 0) {
    return stageCollisions;
  }

  // Suporte para teclado ou situações sem pointer.
  const intersections = rectIntersection(args).filter(({ id }) => id !== args.active.id);

  if (intersections.length > 0) {
    return intersections;
  }

  return closestCenter(args).filter(({ id }) => id !== args.active.id);
};

export function KanbanBoard({ deals, onEdit, onMove }: KanbanBoardProps): React.JSX.Element {
  const [activeDealId, setActiveDealId] = useState<number | null>(null);

  const activeDeal = deals.find((deal) => deal.id === activeDealId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);

    if (!activeId.startsWith('deal-')) return;

    const dealId = Number(activeId.replace('deal-', ''));

    setActiveDealId(dealId);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDealId(null);

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith('deal-')) return;

    const dealId = Number(activeId.replace('deal-', ''));

    const movingDeal = deals.find((deal) => deal.id === dealId);

    if (!movingDeal) return;

    let targetStageId: number;
    let targetIndex: number;

    if (overId.startsWith('stage-')) {
      // Soltou na área livre da coluna.
      targetStageId = Number(overId.replace('stage-', ''));

      const targetDeals = deals.filter(
        (deal) => deal.stageId === targetStageId && deal.id !== dealId,
      );

      targetIndex = targetDeals.length;
    } else if (overId.startsWith('deal-')) {
      // Soltou sobre outro card.
      const overDealId = Number(overId.replace('deal-', ''));

      const overDeal = deals.find((deal) => deal.id === overDealId);

      if (!overDeal) return;

      targetStageId = overDeal.stageId;

      // Mantém o card arrastado na lista original.
      const targetDeals = deals
        .filter((deal) => deal.stageId === targetStageId)
        .sort((a, b) => a.position - b.position);

      targetIndex = targetDeals.findIndex((deal) => deal.id === overDealId);

      if (targetIndex < 0) return;
    } else {
      return;
    }

    const targetStage = stages.find((stage) => stage.id === targetStageId);

    if (!targetStage) return;

    onMove(dealId, targetStageId, targetIndex);
  }

  function handleDragCancel() {
    setActiveDealId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-6">
        {sortedStages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stageId === stage.id);

          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              sellers={sellers}
              onEdit={onEdit}
            />
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'ease-out',
        }}
        zIndex={1000}
      >
        {activeDeal ? (
          <div className="w-80 cursor-grabbing">
            <DealCardContent
              deal={activeDeal}
              seller={sellers.find((seller) => seller.id === activeDeal.sellerId)}
              overlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
