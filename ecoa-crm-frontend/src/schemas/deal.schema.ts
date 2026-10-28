import { z } from 'zod';

export const dealSchema = z.object({
  title: z.string().trim().nonempty('O título é obrigatório'),
  valueCents: z
    .number()
    .int('O valor deve ser um número inteiro de centavos')
    .nonnegative('O valor não pode ser negativo'),
  contactName: z.string().trim().nonempty('O nome do contato é obrigatório'),
  sellerId: z.number().int().positive('Selecione um vendedor'),
  stageId: z.number().int().positive('Selecione uma etapa'),
  expectedCloseDate: z.iso.date('Informe uma data válida'),
});

export type DealFormData = z.infer<typeof dealSchema>;
