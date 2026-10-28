import { useState } from 'react';
import { KanbanBoard } from '@/components/kaban/KanbanBoard';
import { DealForm } from '@/components/kaban/DealForm';
import { LostReasonDialog } from '@/components/kaban/LostReasonDialog';
import { useStages } from '@/hooks/use-stages';
import { useSellers } from '@/hooks/use-sellers';
import { useDeals } from '@/hooks/use-deals';
import { useDealMutations } from '@/hooks/use-deal-mutations';
import type { Deal, LostReason } from '@/types/crm';
import type { DealFormData } from '@/schemas/deal.schema';

type PendingMove = {
  dealId: number;
  stageId: number;
  index: number;
};

export default function App() {
  const { data: dealsResponse, isPending, isError, error } = useDeals();
  const { data: stagesResponse, isPending: stagesPending } = useStages();
  const { data: sellersResponse, isPending: sellersPending } = useSellers();

  const deals = dealsResponse?.data ?? [];
  const stages = stagesResponse?.data ?? [];
  const sellers = sellersResponse?.data ?? [];

  const { create, update, move } = useDealMutations();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const isSaving = create.isPending || update.isPending;

  function handleEditDeal(deal: Deal) {
    setSelectedDeal(deal);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleNewDeal() {
    setSelectedDeal(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    if (isSaving) return;

    setSelectedDeal(null);
    setFormError(null);
    setIsFormOpen(false);
  }

  async function handleSaveDeal(data: DealFormData): Promise<void> {
    const targetStage = stages.find((stage) => stage.id === data.stageId);

    if (!targetStage || targetStage.type !== 'OPEN') {
      setFormError('Selecione uma etapa aberta.');
      return;
    }

    setFormError(null);

    try {
      if (selectedDeal) {
        await update.mutateAsync({
          id: selectedDeal.id,
          data,
        });
      } else {
        await create.mutateAsync(data);
      }

      handleCloseForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o negócio.');
    }
  }

  async function applyMoveDeal(
    dealId: number,
    stageId: number,
    index: number,
    lostReason?: LostReason,
  ): Promise<void> {
    setMoveError(null);

    try {
      await move.mutateAsync({
        dealId,
        stageId,
        index,
        lostReason,
      });
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : 'Não foi possível movimentar o negócio.');
    }
  }

  function handleMoveDeal(dealId: number, stageId: number, index: number) {
    const targetStage = stages.find((stage) => stage.id === stageId);

    const movingDeal = deals.find((deal) => deal.id === dealId);

    if (!targetStage || !movingDeal) return;

    // Solicita motivo somente ao entrar em Perdido.
    if (targetStage.type === 'LOST' && movingDeal.stageId !== stageId) {
      setPendingMove({ dealId, stageId, index });
      return;
    }

    void applyMoveDeal(dealId, stageId, index, movingDeal.lostReason ?? undefined);
  }

  function handleConfirmLostReason(reason: LostReason) {
    if (!pendingMove) return;

    void applyMoveDeal(pendingMove.dealId, pendingMove.stageId, pendingMove.index, reason);

    setPendingMove(null);
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p>Carregando negócios...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="text-red-600" role="alert">
          Erro ao carregar negócios: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ecoa CRM</h1>

          <p className="mt-1 text-sm text-slate-500">Gerenciamento do funil de vendas</p>
        </div>

        <button
          type="button"
          onClick={handleNewDeal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Novo negócio
        </button>
      </header>

      {moveError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span>{moveError}</span>

          <button type="button" onClick={() => setMoveError(null)} aria-label="Fechar mensagem">
            ✕
          </button>
        </div>
      )}

      <KanbanBoard deals={deals} onEdit={handleEditDeal} onMove={handleMoveDeal} />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white">
            <button
              type="button"
              onClick={handleCloseForm}
              disabled={isSaving}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 disabled:opacity-50"
              aria-label="Fechar formulário"
            >
              ✕
            </button>

            <DealForm
              key={selectedDeal?.id ?? 'new'}
              deal={selectedDeal}
              onSubmit={handleSaveDeal}
            />

            {isSaving && <p className="px-6 pb-3 text-sm text-slate-500">Salvando negócio...</p>}

            {formError && (
              <p role="alert" className="px-6 pb-4 text-sm text-red-600">
                {formError}
              </p>
            )}
          </div>
        </div>
      )}

      {pendingMove && (
        <LostReasonDialog
          dealTitle={deals.find((deal) => deal.id === pendingMove.dealId)?.title ?? 'Negócio'}
          onConfirm={handleConfirmLostReason}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </main>
  );
}
