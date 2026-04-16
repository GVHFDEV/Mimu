'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: profile };
}

export async function getUserPets() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: pets, error } = await supabase
    .from('pets')
    .select('id, name, photo_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data: pets || [] };
}

export async function getUserStats() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get all pets for this user
  const { data: pets } = await supabase
    .from('pets')
    .select('id')
    .eq('user_id', user.id);

  if (!pets || pets.length === 0) {
    return {
      data: {
        totalCares: 0,
        streak: 0,
        weeklyFrequency: 0,
      }
    };
  }

  const petIds = pets.map(p => p.id);

  // Total de cuidados
  const { count: totalCares } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .in('pet_id', petIds);

  // Atividades dos últimos 7 dias para calcular frequência semanal
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weeklyActivities } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .in('pet_id', petIds)
    .gte('completed_at', weekAgo.toISOString());

  // Calcular streak (dias consecutivos)
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('completed_at')
    .in('pet_id', petIds)
    .order('completed_at', { ascending: false })
    .limit(100);

  let streak = 0;
  if (recentLogs && recentLogs.length > 0) {
    const dates = new Set(
      recentLogs.map(log => new Date(log.completed_at).toISOString().split('T')[0])
    );

    const sortedDates = Array.from(dates).sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    data: {
      totalCares: totalCares || 0,
      streak,
      weeklyFrequency: weeklyActivities || 0,
    }
  };
}

export async function updateUserBio(bio: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ bio })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}
