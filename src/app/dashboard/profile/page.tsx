'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUserProfile, getUserPets, getUserStats, updateUserBio } from './actions';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Image from 'next/image';

interface Profile {
  id: string;
  username: string;
  country: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Pet {
  id: string;
  name: string;
  photo_url: string | null;
}

interface Stats {
  totalCares: number;
  streak: number;
  weeklyFrequency: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileResult, petsResult, statsResult] = await Promise.all([
          getUserProfile(),
          getUserPets(),
          getUserStats(),
        ]);

        if (profileResult.error) {
          router.push('/login');
          return;
        }

        if (profileResult.data) {
          setProfile(profileResult.data);
          setBio(profileResult.data.bio || '');
        }

        if (petsResult.data) {
          setPets(petsResult.data);
        }

        if (statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleSaveBio() {
    setError('');
    setSuccess(false);

    startTransition(async () => {
      const result = await updateUserBio(bio);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setIsEditingBio(false);

      setTimeout(() => setSuccess(false), 3000);
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header de Identidade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-md p-8 mb-6 border border-[#5F7C50]/10"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center">
                  <span className="text-5xl text-white font-bold font-display">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info do Usuário */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#1A1A1A] font-display mb-2">
                {profile.username}
              </h1>
              <p className="text-[#1A1A1A]/60 font-sans mb-4">
                {profile.country}
              </p>

              {/* Bio */}
              <div className="mt-4">
                {isEditingBio ? (
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você e sua relação com seus pets..."
                      className="w-full h-32 px-4 py-3 rounded-2xl border-2 border-[#5F7C50]/20 focus:border-[#5F7C50] focus:outline-none resize-none font-sans text-[#1A1A1A]"
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-[#1A1A1A]/60 font-sans">
                        {bio.length}/500 caracteres
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBio(profile.bio || '');
                            setIsEditingBio(false);
                            setError('');
                          }}
                          disabled={isPending}
                          className="min-h-[48px] px-6 py-3 rounded-2xl bg-white border-2 border-[#5F7C50]/20 text-[#5F7C50] text-sm font-medium hover:bg-[#5F7C50]/5 transition-colors font-sans disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveBio}
                          disabled={isPending}
                          className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#5F7C50] text-white text-sm font-medium hover:bg-[#5F7C50]/90 transition-colors font-sans disabled:opacity-50 flex items-center gap-2"
                        >
                          {isPending ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span>Salvando...</span>
                            </>
                          ) : (
                            'Salvar'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#1A1A1A]/80 font-sans leading-relaxed mb-3">
                      {profile.bio || 'Nenhuma biografia adicionada ainda. Clique em "Editar Bio" para adicionar.'}
                    </p>
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#5F7C50]/10 text-[#5F7C50] text-sm font-medium hover:bg-[#5F7C50]/20 transition-colors font-sans"
                    >
                      Editar Bio
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-sans">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm text-green-600 font-sans">Bio salva com sucesso!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vitrine de Pets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-display mb-4">
            Minha Família
          </h2>
          {pets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pets.map((pet, index) => (
                <motion.button
                  key={pet.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => {
                    localStorage.setItem('selectedPetId', pet.id);
                    router.push('/dashboard');
                  }}
                  className="min-h-[48px] bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:border-[#5F7C50]/30 transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-3">
                    {pet.photo_url ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden">
                        <Image
                          src={pet.photo_url}
                          alt={pet.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center">
                        <span className="text-2xl text-white font-bold font-display">
                          {pet.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-bold text-[#1A1A1A] font-display">
                      {pet.name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10 text-center">
              <p className="text-[#1A1A1A]/60 font-sans mb-4">
                Você ainda não cadastrou nenhum pet.
              </p>
              <button
                onClick={() => router.push('/onboarding')}
                className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#5F7C50] text-white font-medium hover:bg-[#5F7C50]/90 transition-colors font-sans"
              >
                Adicionar Primeiro Pet
              </button>
            </div>
          )}
        </motion.div>

        {/* Motor de Estatísticas */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] font-display mb-4">
              Seu Histórico de Dedicação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total de Cuidados */}
              <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-full bg-[#5F7C50]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-[#5F7C50] font-display">
                      {stats.totalCares}
                    </p>
                    <p className="text-sm text-[#1A1A1A]/60 font-sans">Total de Cuidados</p>
                  </div>
                </div>
              </div>

              {/* Streak Atual */}
              <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-full bg-[#A6B89E]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-[#5F7C50] font-display">
                      {stats.streak}
                    </p>
                    <p className="text-sm text-[#1A1A1A]/60 font-sans">Dias Seguidos</p>
                  </div>
                </div>
              </div>

              {/* Frequência Semanal */}
              <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-full bg-[#EBF2B6]/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-[#5F7C50] font-display">
                      {stats.weeklyFrequency}
                    </p>
                    <p className="text-sm text-[#1A1A1A]/60 font-sans">Esta Semana</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
