'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { healthEventSchema } from '@/lib/validations/health';

export async function addHealthEvent(formData: FormData) {
  const rawData = {
    pet_id: formData.get('pet_id') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    date: formData.get('date') as string,
    description: formData.get('description') as string || undefined,
    veterinarian: formData.get('veterinarian') as string || undefined,
    notes: formData.get('notes') as string || undefined,
  };

  const validation = healthEventSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      field: String(validation.error.issues[0].path[0] || 'general'),
    };
  }

  const supabase = await createClient();

  // Verify pet ownership
  const { data: pet } = await supabase
    .from('pets')
    .select('id')
    .eq('id', validation.data.pet_id)
    .single();

  if (!pet) {
    return { success: false, error: 'Pet não encontrado', field: 'pet_id' };
  }

  const { error } = await supabase
    .from('health_events')
    .insert(validation.data);

  if (error) {
    console.error('Error inserting health event:', error);
    return { success: false, error: 'Erro ao salvar evento', field: 'general' };
  }

  revalidatePath('/dashboard/health', 'page');
  return { success: true };
}

export async function updateHealthEvent(eventId: string, formData: FormData) {
  const rawData = {
    pet_id: formData.get('pet_id') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    date: formData.get('date') as string,
    description: formData.get('description') as string || undefined,
    veterinarian: formData.get('veterinarian') as string || undefined,
    notes: formData.get('notes') as string || undefined,
  };

  const validation = healthEventSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      field: String(validation.error.issues[0].path[0] || 'general'),
    };
  }

  const supabase = await createClient();

  // Verify event ownership through pet
  const { data: event } = await supabase
    .from('health_events')
    .select('pet_id')
    .eq('id', eventId)
    .single();

  if (!event) {
    return { success: false, error: 'Evento não encontrado', field: 'general' };
  }

  const { data: pet } = await supabase
    .from('pets')
    .select('id')
    .eq('id', event.pet_id)
    .single();

  if (!pet) {
    return { success: false, error: 'Pet não encontrado', field: 'pet_id' };
  }

  const { error } = await supabase
    .from('health_events')
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating health event:', error);
    return { success: false, error: 'Erro ao atualizar evento', field: 'general' };
  }

  revalidatePath('/dashboard/health', 'page');
  return { success: true };
}

export async function deleteHealthEvent(eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('health_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting health event:', error);
    return { success: false, error: 'Erro ao excluir evento' };
  }

  revalidatePath('/dashboard/health', 'page');
  return { success: true };
}

export async function getHealthEvents(petId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('health_events')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching health events:', error);
    return [];
  }

  return data || [];
}
