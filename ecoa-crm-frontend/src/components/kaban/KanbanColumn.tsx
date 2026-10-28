import { DealCard } from '@/components/kaban/DealCard';
import { formatCurrency } from '@/lib/formatters';
import type { Deal, Seller, Stage } from '@/types/crm';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

export function KanbanColumn({
  stage,
  deals,
  sellers,
  onEdit,
}: {
  stage: Stage;
  deals: Deal[];
  sellers: Seller[];
  onEdit: (deal: Deal) => void;
}): React.JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  });

  const totalCents = deals.reduce((total, deal) => total + deal.valueCents, 0);

  const sortedDeals = [...deals].sort((a, b) => a.position - b.position);

  const sortableIds = sortedDeals.map((deal) => `deal-${deal.id}`);

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
          {sortedDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              seller={sellers.find((seller) => seller.id === deal.sellerId)}
              onEdit={onEdit}
            />
          ))}

          {deals.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">Arraste um negócio para cá</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
