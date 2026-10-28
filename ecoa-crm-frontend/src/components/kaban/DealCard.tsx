import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { DealCardContent } from '@/components/kaban/DealCardContent';
import type { Deal, Seller } from '@/types/crm';

export function DealCard({
  deal,
  seller,
  onEdit,
}: {
  deal: Deal;
  seller?: Seller;
  onEdit: (deal: Deal) => void;
}): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `deal-${deal.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`relative ${isDragging ? 'opacity-30' : ''}`}
    >
      <DealCardContent deal={deal} seller={seller} onEdit={onEdit} />

      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar ${deal.title}`}
        className="absolute right-3 top-3 z-20 flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 active:cursor-grabbing"
      >
        ⠿
      </button>
    </div>
  );
}
