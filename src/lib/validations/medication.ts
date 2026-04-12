import { z } from 'zod';

export const medicationSchema = z.object({
  pet_id: z.string().uuid('ID do pet inválido'),
  name: z.string().min(1, 'Nome do medicamento é obrigatório').max(100, 'Nome muito longo'),
  dose_value: z.string().min(1, 'Dose é obrigatória'),
  dose_unit: z.string().min(1, 'Unidade da dose é obrigatória'),
  frequency_value: z.string().min(1, 'Frequência é obrigatória'),
  frequency_unit: z.string().min(1, 'Unidade da frequência é obrigatória'),
  is_continuous: z.boolean(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional().nullable(),
  notes: z.string().max(1000, 'Observações muito longas').optional().nullable(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
