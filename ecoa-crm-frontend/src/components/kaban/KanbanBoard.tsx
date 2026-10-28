import { KanbanColumn } from '@/components/kaban/KanbanColumn';
import { deals, sellers, stages } from '@/data/mocks';

export function KanbanBoard() {
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {sortedStages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stageId === stage.id);

        return <KanbanColumn key={stage.id} stage={stage} deals={stageDeals} sellers={sellers} />;
      })}
    </div>
  );
}
