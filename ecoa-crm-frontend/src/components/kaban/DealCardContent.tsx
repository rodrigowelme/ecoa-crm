import { formatCurrency } from '@/lib/formatters';
import type { Deal, Seller } from '@/types/crm';

interface DealCardContentProps {
  deal: Deal;
  seller?: Seller;
  onEdit?: (deal: Deal) => void;
  overlay?: boolean;
}

export function DealCardContent({
  deal,
  seller,
  onEdit,
  overlay = false,
}: DealCardContentProps): React.JSX.Element {
  return (
    <article
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
        overlay ? 'cursor-grabbing shadow-xl ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{deal.title}</h3>

        {overlay && <span className="text-slate-400">⠿</span>}
      </div>

      <p className="mt-3 text-lg font-bold text-slate-900">{formatCurrency(deal.valueCents)}</p>

      <div className="mt-3 space-y-1 text-xs text-slate-500">
        <p>Contato: {deal.contactName}</p>
        <p>Responsável: {seller?.name ?? 'Não informado'}</p>
        <p>Previsão: {deal.expectedCloseDate.split('-').reverse().join('/')}</p>
      </div>

      {!overlay && onEdit && (
        <button
          type="button"
          onClick={() => onEdit(deal)}
          className="mt-4 text-sm font-medium text-blue-600"
        >
          Editar negócio
        </button>
      )}
    </article>
  );
}
