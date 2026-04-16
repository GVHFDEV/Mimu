'use server';

import { createClient } from '@/lib/supabase/server';

export async function getActivityHeatmap() {
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
    return { data: [] };
  }

  const petIds = pets.map(p => p.id);

  // Get activities from last 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const { data: logs, error } = await supabase
    .from('daily_logs')
    .select('completed_at')
    .in('pet_id', petIds)
    .gte('completed_at', oneYearAgo.toISOString())
    .order('completed_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  // Group by date and count activities
  const heatmapData: Record<string, number> = {};

  logs?.forEach(log => {
    const date = new Date(log.completed_at).toISOString().split('T')[0];
    heatmapData[date] = (heatmapData[date] || 0) + 1;
  });

  // Convert to array format with all 365 days
  const result = [];
  for (let i = 364; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    result.push({
      date: dateStr,
      count: heatmapData[dateStr] || 0,
    });
  }

  return { data: result };
}
