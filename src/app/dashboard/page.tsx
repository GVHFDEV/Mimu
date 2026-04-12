'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
  sex: string;
  weight: number;
  breed: string;
  size: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePetSelect = (petId: string) => {
    setSelectedPet(petId);
    // Save to localStorage for persistence across pages
    localStorage.setItem('selectedPetId', petId);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('petChanged'));
  };

  useEffect(() => {
    async function loadPets() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name, species, photo_url, sex, weight, breed, size')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true });

        if (petsData && petsData.length > 0) {
          setPets(petsData);

          // Check if there's a saved selection in localStorage
          const savedPetId = localStorage.getItem('selectedPetId');
          if (savedPetId && petsData.find(p => p.id === savedPetId)) {
            setSelectedPet(savedPetId);
          } else {
            setSelectedPet(petsData[0].id);
            localStorage.setItem('selectedPetId', petsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPets();
  }, []);

  const getSpeciesEmoji = (species: string) => {
    const emojiMap: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      rabbit: '🐰',
      hamster: '🐹',
      bird: '🐦',
      guineapig: '🐹',
      ferret: '🦦',
    };
    return emojiMap[species] || '🐾';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Pet Selector - Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-2 font-display">
          Meus Pets
        </h2>

        {isLoading ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-16 h-16 rounded-xl bg-[#5F7C50]/10 animate-pulse"
              />
            ))}
          </div>
        ) : pets.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {pets.map((pet, index) => (
              <motion.button
                key={pet.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePetSelect(pet.id)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all duration-200 ${
                  selectedPet === pet.id
                    ? 'border-[#5F7C50] bg-gradient-to-br from-[#5F7C50]/10 to-[#A6B89E]/10 shadow-md'
                    : 'border-[#5F7C50]/20 bg-white hover:border-[#5F7C50]/40 hover:shadow-md'
                }`}
              >
                <div className="w-full h-full flex items-center justify-center p-1">
                  {pet.photo_url ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image
                        src={pet.photo_url}
                        alt={pet.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-2xl">{getSpeciesEmoji(pet.species)}</div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-[#1A1A1A]/50 font-sans text-sm">
            Nenhum pet cadastrado ainda
          </div>
        )}
      </motion.div>

      {/* Pet ID Card - Grande e em destaque */}
      {pets.length > 0 && selectedPet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          {(() => {
            const pet = pets.find(p => p.id === selectedPet);
            if (!pet) return null;

            return (
              <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-[#5F7C50]/10">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Mobile: Foto + Nome lado a lado / Desktop: Foto à esquerda */}
                  <div className="flex md:flex-col gap-4 md:gap-0 items-center md:items-start">
                    {/* Foto do Pet */}
                    <div className="flex-shrink-0">
                      {pet.photo_url ? (
                        <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-[#5F7C50]/20 shadow-lg">
                          <Image
                            src={pet.photo_url}
                            alt={pet.name}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 flex items-center justify-center ring-4 ring-[#5F7C50]/20 shadow-lg">
                          <span className="text-5xl md:text-7xl">{getSpeciesEmoji(pet.species)}</span>
                        </div>
                      )}
                    </div>

                    {/* Nome e Espécie - ao lado da foto no mobile */}
                    <div className="flex-1 md:hidden">
                      <h3 className="text-2xl font-bold text-[#5F7C50] mb-1 font-display">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-[#1A1A1A]/70 font-sans capitalize">
                        {pet.species === 'dog' ? 'Cão' : pet.species === 'cat' ? 'Gato' : pet.species === 'rabbit' ? 'Coelho' : pet.species === 'hamster' ? 'Hamster' : pet.species === 'bird' ? 'Pássaro' : pet.species === 'guineapig' ? 'Porquinho-da-índia' : pet.species === 'ferret' ? 'Furão' : 'Outro'}
                      </p>
                    </div>
                  </div>

                  {/* Informações do Pet */}
                  <div className="flex-1 w-full">
                    {/* Nome e Espécie - desktop apenas */}
                    <div className="mb-4 hidden md:block">
                      <h3 className="text-3xl md:text-4xl font-bold text-[#5F7C50] mb-2 font-display">
                        {pet.name}
                      </h3>
                      <p className="text-base text-[#1A1A1A]/70 font-sans capitalize">
                        {pet.species === 'dog' ? 'Cão' : pet.species === 'cat' ? 'Gato' : pet.species === 'rabbit' ? 'Coelho' : pet.species === 'hamster' ? 'Hamster' : pet.species === 'bird' ? 'Pássaro' : pet.species === 'guineapig' ? 'Porquinho-da-índia' : pet.species === 'ferret' ? 'Furão' : 'Outro'}
                      </p>
                    </div>

                    {/* Informações adicionais em grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-[#F5F5F0] rounded-xl p-3">
                        <p className="text-[10px] text-[#1A1A1A]/50 font-sans mb-1">Peso</p>
                        <p className="text-xs font-semibold text-[#5F7C50] font-sans">
                          {pet.weight ? `${pet.weight} kg` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-[#F5F5F0] rounded-xl p-3">
                        <p className="text-[10px] text-[#1A1A1A]/50 font-sans mb-1">Raça</p>
                        <p className="text-xs font-semibold text-[#5F7C50] font-sans truncate">
                          {pet.breed || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-[#F5F5F0] rounded-xl p-3 col-span-2 md:col-span-1">
                        <p className="text-[10px] text-[#1A1A1A]/50 font-sans mb-1">Gênero</p>
                        <p className="text-xs font-semibold text-[#5F7C50] font-sans">
                          {pet.sex === 'male' ? '♂ Macho' : pet.sex === 'female' ? '♀ Fêmea' : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Featured Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] rounded-3xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <span className="text-sm font-medium font-sans opacity-90">Dica do Dia</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 font-display">
              Mantenha a rotina de vacinas em dia
            </h3>
            <p className="text-white/90 font-sans text-sm md:text-base leading-relaxed">
              Vacinas são essenciais para proteger seu pet contra doenças graves. Consulte o veterinário regularmente.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-3 font-display">
          Acesso Rápido
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Saúde */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/health')}
            className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-all duration-200 text-left cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">💊</span>
            </div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-display">
              Saúde
            </h3>
            <p className="text-[#1A1A1A]/70 font-sans text-sm">
              Vacinas, medicamentos e histórico médico
            </p>
          </motion.button>

          {/* Rotina */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-display">
              Rotina
            </h3>
            <p className="text-[#1A1A1A]/70 font-sans text-sm">
              Agenda de passeios, alimentação e cuidados
            </p>
          </motion.button>

          {/* Alimentação */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🍖</span>
            </div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-display">
              Alimentação
            </h3>
            <p className="text-[#1A1A1A]/70 font-sans text-sm">
              Controle de dieta e recomendações nutricionais
            </p>
          </motion.button>

          {/* Atividades */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎾</span>
            </div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-display">
              Atividades
            </h3>
            <p className="text-[#1A1A1A]/70 font-sans text-sm">
              Exercícios, brincadeiras e socialização
            </p>
          </motion.button>

          {/* Documentos */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-display">
              Documentos
            </h3>
            <p className="text-[#1A1A1A]/70 font-sans text-sm">
              Carteira de vacinação e documentação
            </p>
          </motion.button>

          {/* Emergência */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-400/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="text-lg font-bold text-red-600 mb-2 font-display">
              Emergência
            </h3>
            <p className="text-[#1A1A1A]/70 font-sans text-sm">
              Contatos de emergência e primeiros socorros
            </p>
          </motion.button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-8 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="border-t border-[#5F7C50]/5 pt-6">
            <p className="text-center text-xs text-[#1A1A1A]/40 font-sans">
              © 2026 Mimu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
