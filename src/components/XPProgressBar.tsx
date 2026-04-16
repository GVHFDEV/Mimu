'use client';

import { motion } from 'framer-motion';

interface XPProgressBarProps {
  currentXP: number;
  nextLevelXP: number;
  currentLevelXP: number;
  percentage: number;
  levelTitle: string;
  level: number;
}

export function XPProgressBar({
  currentXP,
  nextLevelXP,
  currentLevelXP,
  percentage,
  levelTitle,
  level,
}: XPProgressBarProps) {
  const progressXP = currentXP - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;

  return (
    <div className="w-full">
      {/* Level Badge and XP Text */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-sm font-bold text-white font-display">
              Nível {level}
            </span>
          </div>
          <span className="text-sm text-white/90 font-sans">
            {levelTitle}
          </span>
        </div>
        <span className="text-sm text-white/80 font-sans">
          {progressXP} / {totalXPNeeded} XP
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/90 to-white/70 rounded-full"
        />
      </div>

      {/* Percentage Text */}
      <div className="mt-1 text-right">
        <span className="text-xs text-white/70 font-sans">
          {percentage}% para o próximo nível
        </span>
      </div>
    </div>
  );
}
