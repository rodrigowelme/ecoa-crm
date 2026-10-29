import { zodResolver } from '@hookform/resolvers/zod';
import { dealSchema, type DealFormData } from '@/schemas/deal.schema';
import type { Deal } from '@/types/crm';
import { Controller, useForm } from 'react-hook-form';
import type { StageListResponse } from '@/types/api/stage-response.type';
import type { SellerListResponse } from '@/types/api/seller-response.type';

interface DealFormProps {
  deal: Deal | null;
  stages: StageListResponse;
  sellers: SellerListResponse;
  onSubmit: (data: DealFormData) => void | Promise<void>;
}

export function DealForm({ deal, stages, sellers, onSubmit }: DealFormProps): React.JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title ?? '',
      contactName: deal?.contactName ?? '',
      valueCents: deal?.valueCents ?? 0,
      sellerId: deal?.sellerId ?? sellers[0]?.id,
      stageId: deal?.stageId ?? stages[0]?.id,
      expectedCloseDate: deal?.expectedCloseDate ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        {deal ? 'Editar negócio' : 'Novo negócio'}
      </h2>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full rounded-lg border border-slate-300 p-3"
          placeholder="Ex.: Implantação de CRM"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="value" className="mb-1 block text-sm font-medium">
          Valor (R$)
        </label>

        <Controller
          name="valueCents"
          control={control}
          render={({ field }) => (
            <input
              id="value"
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={(field.value / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '');
                const cents = Number(digits);

                field.onChange(cents);
              }}
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          )}
        />

        {errors.valueCents && (
          <p className="mt-1 text-sm text-red-600">{errors.valueCents.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact" className="mb-1 block text-sm font-medium">
          Nome do contato
        </label>
        <input
          id="contact"
          {...register('contactName')}
          className="w-full rounded-lg border border-slate-300 p-3"
          placeholder="Nome do cliente"
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="seller" className="mb-1 block text-sm font-medium">
          Responsável
        </label>
        <select
          id="seller"
          {...register('sellerId', { valueAsNumber: true })}
          className="w-full rounded-lg border border-slate-300 p-3"
        >
          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium">
          Previsão de fechamento
        </label>
        <input
          id="date"
          type="date"
          {...register('expectedCloseDate')}
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        {errors.expectedCloseDate && (
          <p className="mt-1 text-sm text-red-600">{errors.expectedCloseDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="stage" className="mb-1 block text-sm font-medium">
          Etapa
        </label>
        <select
          id="stage"
          {...register('stageId', { valueAsNumber: true })}
          className="w-full rounded-lg border border-slate-300 p-3"
        >
          {stages
            .filter((stage) => stage.type === 'OPEN' || stage.id === deal?.stageId)
            .map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {deal ? 'Salvar alterações' : 'Criar negócio'}
      </button>
    </form>
  );
}
