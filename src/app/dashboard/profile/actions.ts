'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';

function calculateStreakFromLogs(logs: { completed_at: string }[]): number {
  if (!logs || logs.length === 0) return 0;

  const dates = new Set(
    logs.map(log => new Date(log.completed_at).toISOString().split('T')[0])
  );

  const sortedDates = Array.from(dates).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
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

  return streak;
}

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

  const streak = calculateStreakFromLogs(recentLogs || []);

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

export async function getUserAchievements() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  // Get user's unlocked achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user.id);

  const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

  const achievements = (allAchievements || ACHIEVEMENTS).map(achievement => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id),
    unlocked_at: unlockedAchievements?.find(a => a.achievement_id === achievement.id)?.unlocked_at,
  }));

  return { data: achievements };
}

export async function getAchievementProgress() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get user stats
  const statsResult = await getUserStats();
  if (statsResult.error || !statsResult.data) {
    return { error: 'Failed to get stats' };
  }

  const { totalCares, streak, weeklyFrequency } = statsResult.data;

  // Run all queries in parallel
  const [
    { data: pets },
    { count: healthEventsCount },
  ] = await Promise.all([
    supabase
      .from('pets')
      .select('id')
      .eq('user_id', user.id),
    supabase
      .from('health_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const petsCount = pets?.length || 0;

  // TODO: Implement proper morning/night activity filtering
  // For now, using placeholder values until activity shift data is available
  const morningCount = 0;
  const nightCount = 0;

  // Calculate progress for each achievement
  const progress: Record<string, { current: number; required: number; remaining: number }> = {
    first_steps: { current: totalCares, required: 1, remaining: Math.max(0, 1 - totalCares) },
    dedicated_week: { current: streak, required: 7, remaining: Math.max(0, 7 - streak) },
    dedicated_month: { current: streak, required: 30, remaining: Math.max(0, 30 - streak) },
    century_club: { current: totalCares, required: 100, remaining: Math.max(0, 100 - totalCares) },
    half_thousand: { current: totalCares, required: 500, remaining: Math.max(0, 500 - totalCares) },
    morning_person: { current: morningCount, required: 50, remaining: Math.max(0, 50 - morningCount) },
    night_owl: { current: nightCount, required: 50, remaining: Math.max(0, 50 - nightCount) },
    health_guardian: { current: healthEventsCount || 0, required: 10, remaining: Math.max(0, 10 - (healthEventsCount || 0)) },
    multi_pet_master: { current: petsCount, required: 3, remaining: Math.max(0, 3 - petsCount) },
    perfect_week: { current: weeklyFrequency, required: 63, remaining: Math.max(0, 63 - weeklyFrequency) },
  };

  return { data: progress };
}

export async function getPetStats() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: pets, error } = await supabase
    .from('pets')
    .select('id, name, species, birth_date, photo_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  if (!pets || pets.length === 0) {
    return { data: [] };
  }

  // Calculate stats for each pet
  const petStats = await Promise.all(
    pets.map(async (pet) => {
      // Get activity count for this pet
      const { count: activityCount } = await supabase
        .from('daily_logs')
        .select('*', { count: 'exact', head: true })
        .eq('pet_id', pet.id);

      // Get recent logs to calculate streak
      const { data: recentLogs } = await supabase
        .from('daily_logs')
        .select('completed_at')
        .eq('pet_id', pet.id)
        .order('completed_at', { ascending: false })
        .limit(100);

      const streak = calculateStreakFromLogs(recentLogs || []);

      // Calculate age from birth_date
      let age = null;
      if (pet.birth_date) {
        const birthDate = new Date(pet.birth_date);
        const today = new Date();
        const ageInYears = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age = ageInYears - 1;
        } else {
          age = ageInYears;
        }

        // If less than 1 year, show in months
        if (age === 0) {
          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + monthDiff;
          age = ageInMonths;
        }
      }

      return {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        photo_url: pet.photo_url,
        activityCount: activityCount || 0,
        streak,
        age,
        birth_date: pet.birth_date,
      };
    })
  );

  return { data: petStats };
}
