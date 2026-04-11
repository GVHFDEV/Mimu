'use client';

import { useState } from 'react';

interface PasswordStrengthProps {
  password: string;
  show: boolean;
}

export function PasswordStrength({ password, show }: PasswordStrengthProps) {
  if (!show || !password) return null;

  const getStrength = (pwd: string): { level: number; text: string; color: string } => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { level: 1, text: 'Fraca', color: 'bg-red-500' };
    if (strength <= 3) return { level: 2, text: 'Média', color: 'bg-yellow-500' };
    return { level: 3, text: 'Forte', color: 'bg-[#5F7C50]' };
  };

  const strength = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        <div className={`h-1 flex-1 rounded-full transition-all duration-200 ${strength.level >= 1 ? strength.color : 'bg-gray-200'}`} />
        <div className={`h-1 flex-1 rounded-full transition-all duration-200 ${strength.level >= 2 ? strength.color : 'bg-gray-200'}`} />
        <div className={`h-1 flex-1 rounded-full transition-all duration-200 ${strength.level >= 3 ? strength.color : 'bg-gray-200'}`} />
      </div>
      <p className={`text-xs font-['Nunito'] ${strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-yellow-600' : 'text-[#5F7C50]'}`}>
        Senha {strength.text}
      </p>
    </div>
  );
}
