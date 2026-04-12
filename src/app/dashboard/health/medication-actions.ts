'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { medicationSchema } from '@/lib/validations/medication';

export async function addMedication(formData: FormData) {
  const rawData = {
    pet_id: formData.get('pet_id') as string,
    name: formData.get('name') as string,
    dose_value: formData.get('dose_value') as string,
    dose_unit: formData.get('dose_unit') as string,
    frequency_value: formData.get('frequency_value') as string,
    frequency_unit: formData.get('frequency_unit') as string,
    is_continuous: formData.get('is_continuous') === 'true',
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    notes: formData.get('notes') as string || null,
  };

  const validation = medicationSchema.safeParse(rawData);
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
    .select('id, owner_id')
    .eq('id', validation.data.pet_id)
    .single();

  if (!pet) {
    return { success: false, error: 'Pet não encontrado', field: 'pet_id' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || pet.owner_id !== user.id) {
    return { success: false, error: 'Acesso negado', field: 'general' };
  }

  const { error } = await supabase
    .from('medications')
    .insert({
      ...validation.data,
      owner_id: user.id,
    });

  if (error) {
    console.error('Error inserting medication:', error);
    return { success: false, error: 'Erro ao salvar medicamento', field: 'general' };
  }

  revalidatePath('/dashboard/health', 'page');
  return { success: true };
}

export async function updateMedication(medicationId: string, formData: FormData) {
  const rawData = {
    pet_id: formData.get('pet_id') as string,
    name: formData.get('name') as string,
    dose_value: formData.get('dose_value') as string,
    dose_unit: formData.get('dose_unit') as string,
    frequency_value: formData.get('frequency_value') as string,
    frequency_unit: formData.get('frequency_unit') as string,
    is_continuous: formData.get('is_continuous') === 'true',
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    notes: formData.get('notes') as string || null,
  };

  const validation = medicationSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      field: String(validation.error.issues[0].path[0] || 'general'),
    };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: medication } = await supabase
    .from('medications')
    .select('owner_id')
    .eq('id', medicationId)
    .single();

  if (!medication) {
    return { success: false, error: 'Medicamento não encontrado', field: 'general' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || medication.owner_id !== user.id) {
    return { success: false, error: 'Acesso negado', field: 'general' };
  }

  const { error } = await supabase
    .from('medications')
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', medicationId);

  if (error) {
    console.error('Error updating medication:', error);
    return { success: false, error: 'Erro ao atualizar medicamento', field: 'general' };
  }

  revalidatePath('/dashboard/health', 'page');
  return { success: true };
}

export async function deleteMedication(medicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', medicationId);

  if (error) {
    console.error('Error deleting medication:', error);
    return { success: false, error: 'Erro ao excluir medicamento' };
  }

  revalidatePath('/dashboard/health', 'page');
  return { success: true };
}

export async function getMedications(petId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('pet_id', petId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching medications:', error);
    return [];
  }

  return data || [];
}
