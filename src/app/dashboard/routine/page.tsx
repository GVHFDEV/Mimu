'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { activityCatalog, Activity } from '@/constants/activityCatalog';
import { Pet } from '@/app/dashboard/page';
import Image from 'next/image';
import { PetSelectorModal } from '../health/pet-selector-modal';
import { ActivityPreviewModal } from './activity-preview-modal';

interface DailyLog {
  id: string;
  pet_id: string;
  activity_id: string;
  completed_at: string;
  created_at: string;
}

interface PetProfile extends Pet {
  birth_date: string | null;
}

const RoutinePage = () => {
  const router = useRouter();
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [dailyActivities, setDailyActivities] = useState<{ morning: Activity[], afternoon: Activity[], night: Activity[] }>({
    morning: [],
    afternoon: [],
    night: []
  });
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch pet profile and daily logs
  useEffect(() => {
    let isMounted = true; // Flag para verificar se o componente ainda está montado

    const fetchData = async () => {
      if (!isMounted) return; // Verifica se o componente ainda está montado

      setLoading(true);
      try {
        const supabase = createClient();

        // Get selected pet from localStorage
        const selectedPetId = localStorage.getItem('selectedPetId');
        if (!selectedPetId || !isMounted) {
          if (isMounted) {
            console.log("Nenhum pet selecionado, redirecionando para dashboard");
            router.push('/dashboard');
          }
          return;
        }

        // Fetch pet profile
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('id, name, species, breed, sex, birth_date, weight, photo_url, size')
          .eq('id', selectedPetId)
          .single();

        if (petError) {
          console.error('Error fetching pet data:', petError.message || petError);
          // Verifica se é um erro de que o registro não foi encontrado
          if (petError.code === 'PGRST116' || petError.status === 406) {
            console.log("Pet não encontrado, redirecionando para dashboard");
          }
          router.push('/dashboard');
          return;
        }

        if (!petData) {
          // Pet not found, redirect to dashboard
          console.log("Pet não encontrado, redirecionando para dashboard");
          router.push('/dashboard');
          return;
        }

        setPetProfile(petData as PetProfile);

        // Calculate age group based on birth date
        const calculateAgeGroup = (birthDate: string) => {
          const today = new Date();
          const birth = new Date(birthDate);

          // Calculate difference in years
          let ageYears = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            ageYears--;
          }

          if (ageYears < 1) return 'junior'; // Less than 1 year
          if (ageYears < 7) return 'adult'; // Less than 7 years
          return 'senior'; // 7 years or older
        };

        // Check if activities already exist for today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const activitiesCacheKey = `daily_activities_${selectedPetId}_${today}`;

        // Try to get from localStorage first
        const cachedActivities = localStorage.getItem(activitiesCacheKey);
        if (cachedActivities) {
          try {
            setDailyActivities(JSON.parse(cachedActivities));
          } catch (e) {
            console.warn('Failed to parse cached activities, regenerating...');
          }
        }

        // Generate daily activities based on pet profile
        if (petData) {
          const generateDailyActivities = (pet: PetProfile) => {
            // Filter activities by allowed species
            const filteredActivities = activityCatalog.filter(activity =>
              activity.allowed_species.includes(pet.species)
            );

            // Calculate final scores
            const scoredActivities = filteredActivities.map(activity => {
              let score = activity.base_weight;

              // Apply species modifier
              if (activity.weight_modifiers.species?.[pet.species]) {
                score += activity.weight_modifiers.species[pet.species]!;
              }

              // Apply age group modifier
              const ageGroup = pet.birth_date ? calculateAgeGroup(pet.birth_date) : 'adult'; // Default to adult if no birth date
              const ageGroupKey = ageGroup.toLowerCase() === 'filhote' ? 'junior' :
                                 ageGroup.toLowerCase() === 'adulto' ? 'adult' :
                                 ageGroup.toLowerCase() === 'sênior' ? 'senior' : 'adult';

              if (activity.weight_modifiers.age_group?.[ageGroupKey]) {
                score += activity.weight_modifiers.age_group[ageGroupKey]!;
              }

              // Skip energy level and temperament modifiers since these columns don't exist in the database
              // Future enhancement: could derive these from tags column if needed

              return { ...activity, finalScore: score };
            }).filter(activity => activity.finalScore > 0); // Discard activities with score <= 0

            // Shuffle algorithm using today's date as seed to ensure consistent results for the day
            const seededShuffle = (array: any[], seed: string) => {
              // Simple hash function to generate a number from the seed
              let hash = 0;
              for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0; // Convert to 32bit integer
              }

              const shuffled = [...array];
              for (let i = shuffled.length - 1; i > 0; i--) {
                // Use the hash to influence the shuffle
                hash = (hash * 1664525 + 1013904223) | 0; // Linear congruential generator
                const j = Math.abs(hash) % (i + 1);
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              return shuffled;
            };

            // Group activities by shift and take top 3 for each shift
            const morningActivities = seededShuffle(
              scoredActivities
                .filter(activity => activity.shift === 'morning' || activity.shift === 'any')
                .sort((a, b) => b.finalScore - a.finalScore)
                .slice(0, 10), // Take top 10 then shuffle and pick 3
              `${today}-${pet.id}-morning`
            ).slice(0, 3);

            const afternoonActivities = seededShuffle(
              scoredActivities
                .filter(activity => activity.shift === 'afternoon' || activity.shift === 'any')
                .sort((a, b) => b.finalScore - a.finalScore)
                .slice(0, 10), // Take top 10 then shuffle and pick 3
              `${today}-${pet.id}-afternoon`
            ).slice(0, 3);

            const nightActivities = seededShuffle(
              scoredActivities
                .filter(activity => activity.shift === 'night' || activity.shift === 'any')
                .sort((a, b) => b.finalScore - a.finalScore)
                .slice(0, 10), // Take top 10 then shuffle and pick 3
              `${today}-${pet.id}-night`
            ).slice(0, 3);

            const activities = {
              morning: morningActivities,
              afternoon: afternoonActivities,
              night: nightActivities
            };

            // Cache the activities for today
            localStorage.setItem(activitiesCacheKey, JSON.stringify(activities));

            return activities;
          };

          // Generate activities if not cached
          if (!cachedActivities) {
            const activities = generateDailyActivities(petData as PetProfile);
            setDailyActivities(activities);
          }
        } else {
          // Se não houver petData, redirecionar para o dashboard
          router.push('/dashboard');
        }

        // Fetch daily logs for today
        const { data: logsData, error: logsError } = await supabase
          .from('daily_logs')
          .select('id, activity_id, completed_at')
          .eq('pet_id', selectedPetId)
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`);

        if (logsError) {
          console.error('Error fetching daily logs:', logsError);
          // Não lança o erro, apenas registra, pois pode não haver logs para hoje
        } else {
          setDailyLogs(logsData as DailyLog[]);
          const completedIds = logsData.map(log => log.activity_id);
          setCompletedTasks(completedIds);

          // Calculate progress
          const progressPercentage = Math.min(100, Math.round((completedIds.length / 9) * 100));
          setProgress(progressPercentage);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error?.message || error);
        // Redirecionar em caso de erro crítico
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Reload data when returning from play page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload data when page becomes visible again
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle opening preview modal
  const handleOpenPreview = (activity: Activity) => {
    setPreviewActivity(activity);
    setShowPreviewModal(true);
  };

  // Handle starting activity from preview
  const handleStartActivity = () => {
    if (previewActivity) {
      setShowPreviewModal(false);
      router.push(`/dashboard/routine/play/${previewActivity.id}`);
    }
  };

  // Calculate age group
  const calculateAgeGroup = (birthDate: string) => {
    if (!birthDate) return 'Idade desconhecida';
    const today = new Date();
    const birth = new Date(birthDate);

    // Calculate difference in years
    let ageYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      ageYears--;
    }

    if (ageYears < 1) return 'Filhote'; // Less than 1 year
    if (ageYears < 7) return 'Adulto'; // Less than 7 years
    return 'Sênior'; // 7 years or older
  };

  // Calculate circumference for the progress circle
  const radius = 90; // Radius of the circle in the SVG (cx="100", cy="100", r="90")
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Load all pets for the selector
  useEffect(() => {
    async function loadAllPets() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name, species, photo_url')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true });

        if (petsData) {
          setAllPets(petsData);
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    }

    loadAllPets();
  }, []);

  // Listen for pet changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedPetId' && e.newValue) {
        // Reload the page to update with new pet data
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Function to handle pet selection
  const handleSelectPet = (pet: Pet) => {
    localStorage.setItem('selectedPetId', pet.id);
    window.dispatchEvent(new Event('petChanged'));
    setShowPetSelector(false);
    // Reload data for the new pet
    window.location.reload(); // Simple approach to reload the page with new pet data
  };

  // Calculate time until next day (midnight)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10 pb-8">
      {/* Header Fixo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#5F7C50]/10 sticky top-0 z-40 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Botão Voltar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
          >
            <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Título e Tag */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#5F7C50] font-display">Atividades Diárias</h1>
            {petProfile && (
              <div className="flex items-center gap-2 mt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPetSelector(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#5F7C50]/10 hover:bg-[#5F7C50]/20 transition-colors"
                >
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
                </motion.button>
              </div>
            )}
          </div>

          {/* Botão de teste - Reiniciar atividades */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const selectedPetId = localStorage.getItem('selectedPetId');
              if (selectedPetId) {
                const today = new Date().toISOString().split('T')[0];
                localStorage.removeItem(`daily_activities_${selectedPetId}_${today}`);
                window.location.reload();
              }
            }}
            className="w-10 h-10 rounded-xl bg-[#EBF2B6] flex items-center justify-center hover:bg-[#EBF2B6]/80 transition-colors"
            title="Reiniciar atividades (teste)"
          >
            <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>
      </header>

      {/* Gamification Header - Enhanced Progress Circle */}
      <div className="flex justify-center mt-6 px-4 max-w-7xl mx-auto">
        <div className="relative w-64 h-64 md:w-72 md:h-72">
          <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke="#5F7C50"
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <span className="text-3xl md:text-4xl font-bold text-[#5F7C50] font-display mb-1 pt-4 pb-2">
                {progress}%
              </span>
              <span className="text-sm md:text-base text-[#1A1A1A]/60 font-sans block">Concluído</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple timer caption below progress bar */}
      <div className="text-center mt-4">
        <p className="text-xs text-[#1A1A1A]/50 font-sans">
          Próxima atualização: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 space-y-4 px-4 max-w-7xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-10 w-24 bg-gray-200 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {petProfile ? (
            <div className="mt-8 space-y-6 px-4 max-w-7xl mx-auto">
              {/* Current Activity Section - Only show if there are pending activities */}
              {dailyActivities.morning.concat(dailyActivities.afternoon, dailyActivities.night)
                .filter(activity => !completedTasks.includes(activity.id)).length > 0 && (
                <div className="px-4 max-w-7xl mx-auto">
                  <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-[#5F7C50] mb-4 font-display">Atividade Atual</h2>
                    <div className="space-y-4">
                      {dailyActivities.morning.concat(dailyActivities.afternoon, dailyActivities.night)
                        .filter(activity => !completedTasks.includes(activity.id))
                        .slice(0, 1)
                        .map((activity, index) => (
                          <div key={`current-${activity.id}`} className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#5F7C50]/10">
                            <h3 className="font-bold text-[#5F7C50] font-sans mb-1">{activity.title}</h3>
                            <p className="text-sm text-[#1A1A1A]/70 font-sans mb-2">{activity.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#5F7C50]/80 font-sans">{activity.duration}</span>
                              <span className="text-xs text-[#5F7C50]/80 font-sans capitalize">{activity.shift === 'any' ? 'Qualquer hora' : activity.shift === 'morning' ? 'Manhã' : activity.shift === 'afternoon' ? 'Tarde' : 'Noite'}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Divider between progress section and activities */}
              <div className="pt-2">
                <div className="flex items-center justify-center">
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[#5F7C50]/20 to-transparent"></div>
                  <h2 className="text-xl font-bold text-[#5F7C50] mx-4 font-display whitespace-nowrap">Atividades do Dia</h2>
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[#5F7C50]/20 to-transparent"></div>
                </div>
              </div>
              {/* Morning Activities */}
              <div className="bg-white rounded-3xl shadow-sm p-6 max-w-7xl mx-auto">
                <h2 className="text-lg font-bold text-[#5F7C50] mb-4 font-display flex items-center gap-2">
                  ☀️ Manhã
                </h2>
                <div className="space-y-4">
                  {dailyActivities.morning.map((activity, index) => {
                    const isCompleted = completedTasks.includes(activity.id);
                    return (
                      <motion.div
                        key={`${activity.id}-${index}`}
                        className={`flex justify-between items-center p-4 rounded-2xl border ${
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-[#F5F5F0] border-[#5F7C50]/10'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`${isCompleted ? 'opacity-60 line-through' : ''}`}>
                          <h3 className="font-bold text-[#5F7C50] font-sans">{activity.title}</h3>
                          <p className="text-sm text-[#1A1A1A]/70 font-sans">{activity.duration}</p>
                        </div>
                        <button
                          onClick={() => handleOpenPreview(activity)}
                          disabled={isCompleted}
                          className={`px-4 py-2 rounded-2xl font-sans font-medium text-sm ${
                            isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#5F7C50] text-white hover:bg-[#5F7C50]/90'
                          } transition-colors duration-200`}
                        >
                          {isCompleted ? 'Concluído ✓' : 'Executar'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon Activities */}
              <div className="bg-white rounded-3xl shadow-sm p-6 max-w-7xl mx-auto">
                <h2 className="text-lg font-bold text-[#5F7C50] mb-4 font-display flex items-center gap-2">
                  🌤️ Tarde
                </h2>
                <div className="space-y-4">
                  {dailyActivities.afternoon.map((activity, index) => {
                    const isCompleted = completedTasks.includes(activity.id);
                    return (
                      <motion.div
                        key={`${activity.id}-${index}`}
                        className={`flex justify-between items-center p-4 rounded-2xl border ${
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-[#F5F5F0] border-[#5F7C50]/10'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`${isCompleted ? 'opacity-60 line-through' : ''}`}>
                          <h3 className="font-bold text-[#5F7C50] font-sans">{activity.title}</h3>
                          <p className="text-sm text-[#1A1A1A]/70 font-sans">{activity.duration}</p>
                        </div>
                        <button
                          onClick={() => handleOpenPreview(activity)}
                          disabled={isCompleted}
                          className={`px-4 py-2 rounded-2xl font-sans font-medium text-sm ${
                            isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#5F7C50] text-white hover:bg-[#5F7C50]/90'
                          } transition-colors duration-200`}
                        >
                          {isCompleted ? 'Concluído ✓' : 'Executar'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Night Activities */}
              <div className="bg-white rounded-3xl shadow-sm p-6 max-w-7xl mx-auto">
                <h2 className="text-lg font-bold text-[#5F7C50] mb-4 font-display flex items-center gap-2">
                  🌙 Noite
                </h2>
                <div className="space-y-4">
                  {dailyActivities.night.map((activity, index) => {
                    const isCompleted = completedTasks.includes(activity.id);
                    return (
                      <motion.div
                        key={`${activity.id}-${index}`}
                        className={`flex justify-between items-center p-4 rounded-2xl border ${
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : 'bg-[#F5F5F0] border-[#5F7C50]/10'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`${isCompleted ? 'opacity-60 line-through' : ''}`}>
                          <h3 className="font-bold text-[#5F7C50] font-sans">{activity.title}</h3>
                          <p className="text-sm text-[#1A1A1A]/70 font-sans">{activity.duration}</p>
                        </div>
                        <button
                          onClick={() => handleOpenPreview(activity)}
                          disabled={isCompleted}
                          className={`px-4 py-2 rounded-2xl font-sans font-medium text-sm ${
                            isCompleted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#5F7C50] text-white hover:bg-[#5F7C50]/90'
                          } transition-colors duration-200`}
                        >
                          {isCompleted ? 'Concluído ✓' : 'Executar'}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 px-4 text-center max-w-7xl mx-auto">
              <p className="text-[#1A1A1A]/70 font-sans">Pet não encontrado ou selecionado.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 px-6 py-3 bg-[#5F7C50] text-white rounded-2xl font-sans font-medium hover:bg-[#5F7C50]/90 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="mt-12 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-[#5F7C50]/5 pt-6">
            <p className="text-center text-xs text-[#1A1A1A]/40 font-sans">
              © 2026 Mimu
            </p>
          </div>
        </div>
      </footer>

      {/* Pet Selector Modal */}
      <PetSelectorModal
        isOpen={showPetSelector}
        onClose={() => setShowPetSelector(false)}
        pets={allPets}
        onSelectPet={handleSelectPet}
        currentPetId={petProfile?.id}
      />

      {/* Activity Preview Modal */}
      <ActivityPreviewModal
        activity={previewActivity}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onStart={handleStartActivity}
      />

      {/* Celebration Modal - 100% Complete */}
      {showCelebration && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
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
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Celebration Card */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          >
            <div className="text-center relative z-10">
              <motion.div
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  duration: 0.6,
                  type: 'spring',
                  delay: 0.2,
                }}
              >
                <motion.span
                  className="text-5xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                >
                  🎉
                </motion.span>
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-[#5F7C50] font-display mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Parabéns!
              </motion.h2>

              <motion.p
                className="text-base text-[#1A1A1A]/70 font-sans mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                Você completou 100% das atividades de hoje!
              </motion.p>

              <motion.p
                className="text-sm text-[#1A1A1A]/50 font-sans mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {petProfile?.name} está muito feliz! 🐾
              </motion.p>

              <motion.button
                onClick={() => setShowCelebration(false)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#5F7C50] to-[#5F7C50]/90 text-white font-medium hover:shadow-xl transition-all duration-200 shadow-lg font-sans text-sm"
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RoutinePage;