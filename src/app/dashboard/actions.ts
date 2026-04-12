'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface RoutineEvent {
  id: string;
  type: 'medication' | 'vaccine' | 'appointment';
  title: string;
  date: string;
  time?: string;
  description?: string;
}

export async function getNextRoutineEvent(petId: string): Promise<RoutineEvent | null> {
  const supabase = await createClient();

  // Buscar eventos de saúde para o pet
  const { data: healthEvents } = await supabase
    .from('health_events')
    .select('id, title, date, type, description')
    .eq('pet_id', petId)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(1);

  // Buscar medicamentos ativos para o pet
  const { data: medications } = await supabase
    .from('medications')
    .select('id, name as title, start_date, end_date, frequency, notes as description')
    .eq('pet_id', petId)
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`) // Medicamentos contínuos ou não expirados
    .order('start_date', { ascending: false })
    .limit(5); // Pegar alguns medicamentos recentes

  // Processar medicamentos para determinar próximas doses
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const medicationEvents: RoutineEvent[] = [];

  if (medications) {
    for (const med of medications) {
      // Para simplificar, assumimos que medicamentos ativos precisam ser administrados regularmente
      // Podemos expandir esta lógica no futuro para calcular datas exatas de doses
      medicationEvents.push({
        id: med.id,
        type: 'medication' as const,
        title: `Medicamento: ${med.title}`,
        date: todayStr, // Considerando que medicamentos contínuos precisam ser administrados hoje
        description: med.description || med.frequency,
      });
    }
  }

  // Combinar e encontrar o evento mais próximo
  const allEvents: RoutineEvent[] = [
    ...medicationEvents,
    ...(healthEvents?.map(event => ({
      id: event.id,
      type: event.type as 'vaccine' | 'appointment',
      title: event.title,
      date: event.date,
      description: event.description,
    })) || [])
  ];

  if (allEvents.length === 0) {
    return null;
  }

  // Ordenar por data e retornar o mais próximo
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return allEvents[0];
}

export async function updateLocation(formData: FormData) {
  const location = formData.get('location') as string;

  if (!location) {
    return { success: false, error: 'Localização é obrigatória', field: 'location' };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Usuário não autenticado', field: 'general' };
  }

  // Update the location in the profiles table
  const { error } = await supabase
    .from('profiles')
    .update({ location })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating location:', error);
    return { success: false, error: 'Erro ao atualizar localização', field: 'general' };
  }

  revalidatePath('/dashboard', 'page');
  return { success: true };
}

export async function getUserProfile() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get user profile including location
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, location')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}