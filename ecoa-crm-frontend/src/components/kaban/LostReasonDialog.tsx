import { useState } from 'react';
import type { LostReason } from '@/types/crm';

interface LostReasonDialogProps {
  dealTitle: string;
  onConfirm: (reason: LostReason) => void;
  onCancel: () => void;
}

const reasons: { value: LostReason; label: string }[] = [
  { value: 'PRICE', label: 'Preço' },
  { value: 'COMPETITOR', label: 'Concorrente' },
  { value: 'NO_RESPONSE', label: 'Sem resposta' },
  { value: 'OTHER', label: 'Outro' },
];

export function LostReasonDialog({
  dealTitle,
  onConfirm,
  onCancel,
}: LostReasonDialogProps): React.JSX.Element {
  const [reason, setReason] = useState<LostReason | ''>('');

  function handleConfirm() {
    if (!reason) return;

    onConfirm(reason);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lost-dialog-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="lost-dialog-title" className="text-xl font-semibold text-slate-900">
          Marcar negócio como perdido
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Informe o motivo da perda do negócio:
          <strong className="mt-1 block text-slate-900">{dealTitle}</strong>
        </p>

        <fieldset className="mt-5 space-y-3">
          <legend className="mb-3 text-sm font-medium text-slate-700">Motivo da perda</legend>

          {reasons.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="lostReason"
                value={item.value}
                checked={reason === item.value}
                onChange={() => setReason(item.value)}
                className="h-4 w-4 accent-blue-600"
              />

              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirmar perda
          </button>
        </div>
      </div>
    </div>
  );
}
