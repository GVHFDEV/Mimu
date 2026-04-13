'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function completeTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado', field: 'general' };
  }

  const petId = formData.get('pet_id') as string;
  const activityId = formData.get('activity_id') as string;

  if (!petId || !activityId) {
    return { success: false, error: 'Dados insuficientes para completar a tarefa', field: 'general' };
  }

  // Verify that the pet belongs to the user
  const { data: petData, error: petError } = await supabase
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('owner_id', user.id)
    .single();

  if (petError || !petData) {
    return { success: false, error: 'Pet não encontrado ou não autorizado', field: 'general' };
  }

  // Check if the activity exists in the catalog
  const { activityCatalog } = await import('@/constants/activityCatalog');
  const activityExists = activityCatalog.some(activity => activity.id === activityId);

  if (!activityExists) {
    return { success: false, error: 'Atividade não encontrada', field: 'general' };
  }

  // Insert the log record
  const { error } = await supabase
    .from('daily_logs')
    .insert([
      {
        pet_id: petId,
        activity_id: activityId,
        completed_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error completing task:', error);
    return { success: false, error: 'Erro ao registrar conclusão da tarefa', field: 'general' };
  }

  revalidatePath('/dashboard/routine', 'page');
  return { success: true };
}