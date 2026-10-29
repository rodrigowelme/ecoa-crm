import { getDropTarget, isAfterTarget, type DropTarget } from '@/lib/drop-target';
import { useState } from 'react';
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
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { DealCardContent } from './DealCardContent';
import type { Deal } from '@/types/crm';
import type { StageListResponse } from '@/types/api/stage-response.type';
import type { SellerListResponse } from '@/types/api/seller-response.type';

interface KanbanBoardProps {
  deals: Deal[];
  stages: StageListResponse;
  sellers: SellerListResponse;
  onEdit: (deal: Deal) => void;
  onMove: (dealId: number, stageId: number, index: number) => void;
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  const cardCollisions = pointerCollisions.filter(
    ({ id }) => String(id).startsWith('deal-') && id !== args.active.id,
  );

  if (cardCollisions.length) return cardCollisions;

  const stageCollisions = pointerCollisions.filter(({ id }) => String(id).startsWith('stage-'));

  if (stageCollisions.length) return stageCollisions;

  const intersections = rectIntersection(args).filter(({ id }) => id !== args.active.id);
  const intersectingCards = intersections.filter(({ id }) => String(id).startsWith('deal-'));

  if (intersectingCards.length) return intersectingCards;

  if (intersections.length) return intersections;

  return closestCenter(args).filter(({ id }) => id !== args.active.id);
};

export function KanbanBoard({
  deals,
  stages,
  sellers,
  onEdit,
  onMove,
}: KanbanBoardProps): React.JSX.Element {
  const [activeDealId, setActiveDealId] = useState<number | null>(null);

  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const activeDeal = deals.find((deal) => deal.id === activeDealId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);

    if (!id.startsWith('deal-')) return;

    setActiveDealId(Number(id.replace('deal-', '')));
    setDropTarget(null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (!event.over) {
      setDropTarget(null);
      return;
    }

    const id = String(event.active.id);

    if (!id.startsWith('deal-')) return;

    const dealId = Number(id.replace('deal-', ''));

    const nextTarget = getDropTarget(String(event.over.id), deals, dealId, isAfterTarget(event, deals));

    setDropTarget((previous) => {
      if (previous?.stageId === nextTarget?.stageId && previous?.index === nextTarget?.index) {
        return previous;
      }

      return nextTarget;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);

    const dealId = activeId.startsWith('deal-') ? Number(activeId.replace('deal-', '')) : null;

    const target =
      dealId !== null && event.over
        ? getDropTarget(String(event.over.id), deals, dealId, isAfterTarget(event, deals))
        : dropTarget;

    setActiveDealId(null);
    setDropTarget(null);

    if (dealId === null || !event.over || !target) {
      return;
    }

    if (!stages.some((stage) => stage.id === target.stageId)) {
      return;
    }

    const movingDeal = deals.find((deal) => deal.id === dealId);

    if (!movingDeal) return;

    // Evita enviar uma movimentação sem alteração.
    if (movingDeal.stageId === target.stageId && movingDeal.position === target.index) {
      return;
    }

    onMove(dealId, target.stageId, target.index);
  }

  function handleDragCancel() {
    setActiveDealId(null);
    setDropTarget(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragMove={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-6">
        {sortedStages.map((stage) => {
          const stageDeals = deals
            .filter((deal) => deal.stageId === stage.id)
            .sort((a, b) => a.position - b.position);

          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              sellers={sellers}
              onEdit={onEdit}
              activeDealId={activeDealId}
              dropIndex={dropTarget?.stageId === stage.id ? dropTarget.index : null}
            />
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'ease-out',
        }}
        zIndex={1000}
      >
        {activeDeal ? (
          <div className="w-80 cursor-grabbing rotate-2 opacity-95 shadow-2xl">
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
