export interface Level {
  level: number;
  title: string;
  xp_required: number;
  description: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Aprendiz', xp_required: 0, description: 'Começando a jornada de cuidados' },
  { level: 2, title: 'Cuidador', xp_required: 100, description: 'Aprendendo o básico' },
  { level: 3, title: 'Dedicado', xp_required: 250, description: 'Mostrando compromisso' },
  { level: 4, title: 'Atencioso', xp_required: 500, description: 'Cuidados consistentes' },
  { level: 5, title: 'Protetor', xp_required: 1000, description: 'Sempre presente' },
  { level: 6, title: 'Companheiro', xp_required: 2000, description: 'Vínculo forte' },
  { level: 7, title: 'Guardião', xp_required: 3500, description: 'Defensor incansável' },
  { level: 8, title: 'Mentor', xp_required: 5500, description: 'Exemplo para outros' },
  { level: 9, title: 'Mestre', xp_required: 8000, description: 'Sabedoria em cuidados' },
  { level: 10, title: 'Lenda', xp_required: 12000, description: 'Tutor lendário' },
];

// Helper function to get level info from XP
export function getLevelFromXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp_required) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

// Helper function to get next level info
export function getNextLevel(currentLevel: number): Level | null {
  if (currentLevel >= 10) return null;
  return LEVELS[currentLevel]; // currentLevel is 1-indexed, array is 0-indexed
}

// Helper function to calculate XP progress to next level
export function getXPProgress(xp: number): {
  currentLevel: Level;
  nextLevel: Level | null;
  currentLevelXP: number;
  nextLevelXP: number;
  progressXP: number;
  progressPercentage: number;
} {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = getNextLevel(currentLevel.level);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      currentLevelXP: currentLevel.xp_required,
      nextLevelXP: currentLevel.xp_required,
      progressXP: 0,
      progressPercentage: 100,
    };
  }

  const currentLevelXP = currentLevel.xp_required;
  const nextLevelXP = nextLevel.xp_required;
  const progressXP = xp - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.round((progressXP / totalXPNeeded) * 100));

  return {
    currentLevel,
    nextLevel,
    currentLevelXP,
    nextLevelXP,
    progressXP,
    progressPercentage,
  };
}
