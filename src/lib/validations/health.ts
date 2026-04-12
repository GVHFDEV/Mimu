import { z } from 'zod';

export const healthEventSchema = z.object({
  pet_id: z.string().uuid('ID do pet inválido'),
  type: z.enum(['vaccine', 'medication', 'appointment'], {
    message: 'Tipo de evento inválido',
  }),
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  veterinarian: z.string().max(100, 'Nome muito longo').optional(),
  notes: z.string().max(1000, 'Notas muito longas').optional(),
});

export type HealthEventInput = z.infer<typeof healthEventSchema>;
