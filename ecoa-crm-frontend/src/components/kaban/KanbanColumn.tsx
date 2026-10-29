import { DealCard } from '@/components/kaban/DealCard';
import { formatCurrency } from '@/lib/formatters';

import type { Deal, Seller, Stage } from '@/types/crm';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  sellers: Seller[];
  onEdit: (deal: Deal) => void;
  activeDealId?: number | null;
  dropIndex?: number | null;
}

function DropIndicator() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-2 left-0 right-0 z-20 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
    />
  );
}

export function KanbanColumn({
  stage,
  deals,
  sellers,
  onEdit,
  activeDealId = null,
  dropIndex = null,
}: KanbanColumnProps): React.JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  });

  const sortedDeals = [...deals].sort((a, b) => a.position - b.position);

  const totalCents = deals.reduce((total, deal) => total + deal.valueCents, 0);

  const sortableIds = sortedDeals.map((deal) => `deal-${deal.id}`);

  const visibleDeals = sortedDeals.filter((deal) => deal.id !== activeDealId);

  const lastVisibleDealId = visibleDeals.at(-1)?.id;

  return (
    <section className="flex w-80 min-w-80 flex-col rounded-xl bg-slate-100 p-3">
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />

          <h2 className="font-semibold text-slate-800">{stage.name}</h2>

          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">
            {deals.length}
          </span>
        </div>

        <p className="mt-2 text-sm font-semibold text-slate-600">{formatCurrency(totalCents)}</p>
      </header>

      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-32 flex-1 flex-col gap-3 rounded-lg p-1 transition-colors ${
            isOver ? 'bg-blue-100' : ''
          }`}
        >
          {sortedDeals.map((deal) => {
            const isActive = deal.id === activeDealId;

            const visibleIndex = visibleDeals.findIndex((item) => item.id === deal.id);

            const showIndicator = dropIndex !== null && !isActive && visibleIndex === dropIndex;

            const showEndIndicator =
              dropIndex === visibleDeals.length && deal.id === lastVisibleDealId;

            return (
              <div key={deal.id} className={`relative ${isActive ? 'opacity-20' : ''}`}>
                {showIndicator && <DropIndicator />}

                <DealCard
                  deal={deal}
                  seller={sellers.find((seller) => seller.id === deal.sellerId)}
                  onEdit={onEdit}
                />

                {showEndIndicator && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-2 left-0 right-0 z-20 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  />
                )}
              </div>
            );
          })}

          {visibleDeals.length === 0 && dropIndex !== null && (
            <div className="pointer-events-none flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-blue-100/50">
              <span className="text-xs font-medium text-blue-600">Soltar negócio aqui</span>
            </div>
          )}

          {deals.length === 0 && dropIndex === null && (
            <p className="py-8 text-center text-sm text-slate-400">Arraste um negócio para cá</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
