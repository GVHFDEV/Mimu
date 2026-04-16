export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'specialty' | 'health' | 'collection' | 'challenge';
  criteria: Record<string, number>;
  xp_reward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Primeiros Passos',
    description: 'Complete sua primeira atividade',
    icon: '🏆',
    category: 'milestone',
    criteria: { total_activities: 1 },
    xp_reward: 10,
  },
  {
    id: 'dedicated_week',
    title: 'Semana Dedicada',
    description: 'Mantenha um streak de 7 dias',
    icon: '🔥',
    category: 'streak',
    criteria: { streak_days: 7 },
    xp_reward: 50,
  },
  {
    id: 'dedicated_month',
    title: 'Mês Exemplar',
    description: 'Mantenha um streak de 30 dias',
    icon: '⭐',
    category: 'streak',
    criteria: { streak_days: 30 },
    xp_reward: 200,
  },
  {
    id: 'century_club',
    title: 'Clube dos 100',
    description: 'Complete 100 atividades',
    icon: '💯',
    category: 'milestone',
    criteria: { total_activities: 100 },
    xp_reward: 100,
  },
  {
    id: 'half_thousand',
    title: 'Meio Milhar',
    description: 'Complete 500 atividades',
    icon: '🌟',
    category: 'milestone',
    criteria: { total_activities: 500 },
    xp_reward: 250,
  },
  {
    id: 'morning_person',
    title: 'Madrugador',
    description: 'Complete 50 atividades matinais',
    icon: '🌅',
    category: 'specialty',
    criteria: { morning_activities: 50 },
    xp_reward: 75,
  },
  {
    id: 'night_owl',
    title: 'Coruja Noturna',
    description: 'Complete 50 atividades noturnas',
    icon: '🌙',
    category: 'specialty',
    criteria: { night_activities: 50 },
    xp_reward: 75,
  },
  {
    id: 'health_guardian',
    title: 'Guardião da Saúde',
    description: 'Registre 10 eventos de saúde',
    icon: '💚',
    category: 'health',
    criteria: { health_events: 10 },
    xp_reward: 100,
  },
  {
    id: 'multi_pet_master',
    title: 'Mestre Multi-Pet',
    description: 'Cuide de 3 ou mais pets',
    icon: '🐾',
    category: 'collection',
    criteria: { total_pets: 3 },
    xp_reward: 150,
  },
  {
    id: 'perfect_week',
    title: 'Semana Perfeita',
    description: 'Complete todas as 63 atividades em uma semana',
    icon: '✨',
    category: 'challenge',
    criteria: { weekly_activities: 63 },
    xp_reward: 300,
  },
];

// Helper function to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Helper function to get achievements by category
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}
