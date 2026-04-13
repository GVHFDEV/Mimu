'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { activityCatalog } from '@/constants/activityCatalog';
import { completeTask } from '../../actions';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface Pet {
  id: string;
  name: string;
  photo_url: string | null;
}

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;

  // Find activity from catalog
  const activity = activityCatalog.find(a => a.id === activityId);

  // Pet state
  const [petProfile, setPetProfile] = useState<Pet | null>(null);

  // Timer state
  const [totalTime, setTotalTime] = useState(0); // total seconds
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load pet profile
  useEffect(() => {
    async function loadPet() {
      const selectedPetId = localStorage.getItem('selectedPetId');
      if (!selectedPetId) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('pets')
        .select('id, name, photo_url')
        .eq('id', selectedPetId)
        .single();

      if (data) {
        setPetProfile(data);
      }
    }

    loadPet();
  }, []);

  // Parse duration and initialize timer
  useEffect(() => {
    if (activity?.duration) {
      // Parse "5-10 min" → use max value (10 min = 600 seconds)
      const match = activity.duration.match(/(\d+)(?:-(\d+))?\s*min/);
      if (match) {
        const maxMinutes = parseInt(match[2] || match[1]);
        const seconds = maxMinutes * 60;
        setTotalTime(seconds);
        setTimeRemaining(seconds);
      }
    }
  }, [activity]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isPaused) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeRemaining, isPaused]);

  async function handleComplete() {
    setIsCompleting(true);

    const selectedPetId = localStorage.getItem('selectedPetId');
    if (!selectedPetId) {
      router.push('/dashboard/routine');
      return;
    }

    const formData = new FormData();
    formData.append('pet_id', selectedPetId);
    formData.append('activity_id', activityId);

    const result = await completeTask(formData);

    if (result.success) {
      // Show success animation
      setShowSuccess(true);

      // Wait 2 seconds then redirect
      setTimeout(() => {
        router.push('/dashboard/routine');
      }, 2000);
    } else {
      setIsCompleting(false);
      alert('Erro ao concluir atividade. Tente novamente.');
    }
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#5F7C50] font-display mb-4">
            Atividade não encontrada
          </h1>
          <button
            onClick={() => router.push('/dashboard/routine')}
            className="px-6 py-3 rounded-2xl bg-[#5F7C50] text-white font-sans font-medium"
          >
            Voltar para Rotina
          </button>
        </div>
      </div>
    );
  }

  const hasTimer = totalTime > 0;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Calculate progress for circle
  const progress = hasTimer ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10 flex flex-col">
      {/* Header - Same as routine page */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#5F7C50]/10 px-4 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Botão Voltar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
          >
            <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Título e Tag */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#5F7C50] font-display">Executando Atividade</h1>
            {petProfile && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#5F7C50]/10">
                  {petProfile.photo_url ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden">
                      <Image
                        src={petProfile.photo_url}
                        alt={petProfile.name}
                        width={20}
                        height={20}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {petProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-[#5F7C50] font-medium font-sans">
                    {petProfile.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Flex layout to fill remaining space */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-4 md:py-6 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4">
          {/* Activity Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl mb-2">{activity.icon}</div>
            <h2 className="text-xl md:text-2xl font-bold text-[#5F7C50] font-display">
              {activity.title}
            </h2>
          </motion.div>

          {/* Progress Circle with Timer */}
          {hasTimer && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              {/* SVG Progress Circle */}
              <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="110"
                  cy="110"
                  r={radius}
                  stroke="#5F7C50"
                  strokeWidth="12"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>

              {/* Timer in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold text-[#5F7C50] font-display">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-[#1A1A1A]/50 font-sans mt-1">
                  {isPaused ? 'Pausado' : 'Tempo restante'}
                </div>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-xl text-center px-4"
          >
            <p className="text-sm md:text-base text-[#1A1A1A]/70 font-sans leading-relaxed">
              {activity.description}
            </p>
          </motion.div>

          {/* Pause/Resume button (only for timed activities) */}
          {hasTimer && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPaused(!isPaused)}
                className="px-8 py-2.5 rounded-2xl bg-white border-2 border-[#5F7C50]/20 text-[#5F7C50] font-medium hover:bg-[#5F7C50]/5 transition-colors font-sans text-sm"
              >
                {isPaused ? '▶ Retomar' : '⏸ Pausar'}
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Complete button - at bottom */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-md mx-auto mt-4"
        >
          <motion.button
            onClick={handleComplete}
            disabled={isCompleting}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5F7C50] to-[#5F7C50]/90 text-white font-bold text-base md:text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-sans"
          >
            {isCompleting ? 'Concluindo...' : 'Concluir Atividade'}
          </motion.button>
        </motion.div>

        {/* Footer */}
        <footer className="mt-4 mb-8">
          <div className="border-t border-[#5F7C50]/5 pt-4">
            <p className="text-center text-xs text-[#1A1A1A]/40 font-sans">
              © 2026 Mimu
            </p>
          </div>
        </footer>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#5F7C50', '#A6B89E', '#EBF2B6'][i % 3],
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 1,
                  delay: Math.random() * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Success Card */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative z-10"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <span className="text-4xl">✓</span>
            </motion.div>

            <h2 className="text-2xl font-bold text-[#5F7C50] font-display mb-2">
              Atividade Concluída!
            </h2>
            <p className="text-base text-[#1A1A1A]/70 font-sans">
              Ótimo trabalho! 🎉
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
