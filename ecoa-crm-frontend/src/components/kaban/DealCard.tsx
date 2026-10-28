import { formatCurrency } from '@/lib/formatters';
import type { Deal, Seller } from '@/types/crm';

export function DealCard({ deal, seller }: { deal: Deal; seller?: Seller }): React.JSX.Element {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-sm font-semibold text-slate-800">{deal.title}</h3>

      <p className="mt-3 text-lg font-bold text-slate-900">{formatCurrency(deal.valueCents)}</p>

      <div className="mt-3 space-y-1 text-xs text-slate-500">
        <p>Contato: {deal.contactName}</p>
        <p>Responsável: {seller?.name ?? 'Não informado'}</p>
        <p>Previsão: {deal.expectedCloseDate.split('-').reverse().join('/')}</p>
      </div>
    </article>
  );
}
