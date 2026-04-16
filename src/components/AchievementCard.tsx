'use client';

import { motion } from 'framer-motion';

interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: {
    current: number;
    required: number;
    remaining: number;
  };
}

export function AchievementCard({
  id,
  title,
  description,
  icon,
  unlocked,
  progress,
}: AchievementCardProps) {
  const progressPercentage = progress
    ? Math.min(100, Math.round((progress.current / progress.required) * 100))
    : 0;

  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-white rounded-2xl p-6 border transition-all ${
        unlocked
          ? 'border-[#5F7C50]/20 shadow-md hover:shadow-lg'
          : 'border-[#1A1A1A]/10 opacity-60 grayscale'
      }`}
    >
      {/* Lock Icon for Locked Achievements */}
      {!unlocked && (
        <div className="absolute top-3 right-3">
          <svg
            className="w-4 h-4 text-[#1A1A1A]/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}

      {/* Checkmark for Unlocked Achievements */}
      {unlocked && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-[#5F7C50] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="text-5xl mb-3 text-center">{icon}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#1A1A1A] text-center mb-2 font-display">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#1A1A1A]/70 text-center mb-3 font-sans">
        {description}
      </p>

      {/* Progress for Locked Achievements */}
      {!unlocked && progress && progress.remaining > 0 && (
        <div className="mt-4">
          {/* Progress Bar */}
          <div className="relative h-2 bg-[#1A1A1A]/10 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-[#5F7C50] rounded-full"
            />
          </div>

          {/* Progress Text */}
          <p className="text-xs text-[#1A1A1A]/60 text-center font-sans">
            {progress.remaining === 1 ? (
              <>Falta <span className="font-bold text-[#5F7C50]">{progress.remaining}</span> {getUnitText(id)}</>
            ) : (
              <>Faltam <span className="font-bold text-[#5F7C50]">{progress.remaining}</span> {getUnitText(id)}</>
            )}
          </p>
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#5F7C50]/10 text-[#5F7C50] text-xs font-medium font-sans">
            ✓ Desbloqueado
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Helper function to get the correct unit text for each achievement
function getUnitText(achievementId: string): string {
  switch (achievementId) {
    case 'first_steps':
    case 'century_club':
    case 'half_thousand':
      return 'atividades';
    case 'dedicated_week':
    case 'dedicated_month':
      return 'dias';
    case 'morning_person':
    case 'night_owl':
      return 'atividades';
    case 'health_guardian':
      return 'eventos de saúde';
    case 'multi_pet_master':
      return 'pets';
    case 'perfect_week':
      return 'atividades';
    default:
      return 'unidades';
  }
}
