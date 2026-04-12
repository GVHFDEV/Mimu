'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Image from 'next/image';

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
}

export function PetSelectorModal({
  isOpen,
  onClose,
  pets,
  onSelectPet,
  currentPetId,
}: {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
  currentPetId?: string;
}) {
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet (mobile) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-[#1A1A1A]/20 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#5F7C50] font-display">Selecionar Pet</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#1A1A1A]/50 font-sans text-sm">
                    Nenhum pet cadastrado
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <motion.button
                      key={pet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectPet(pet)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        currentPetId === pet.id
                          ? 'bg-[#5F7C50]/10 border-[#5F7C50] shadow-md'
                          : 'bg-white border-[#5F7C50]/10 hover:shadow-md'
                      }`}
                    >
                      {pet.photo_url ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={pet.photo_url}
                            alt={pet.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 flex items-center justify-center text-lg">
                          {getSpeciesEmoji(pet.species)}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-[#5F7C50] font-display">{pet.name}</h3>
                        <p className="text-xs text-[#1A1A1A]/50 font-sans">{pet.species}</p>
                      </div>
                      {currentPetId === pet.id && (
                        <div className="w-6 h-6 rounded-full bg-[#5F7C50] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Side Panel (desktop) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="hidden md:block fixed top-0 right-0 bottom-0 w-[400px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#5F7C50] font-display">Selecionar Pet</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#1A1A1A]/50 font-sans text-sm">
                    Nenhum pet cadastrado
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <motion.button
                      key={pet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectPet(pet)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        currentPetId === pet.id
                          ? 'bg-[#5F7C50]/10 border-[#5F7C50] shadow-md'
                          : 'bg-white border-[#5F7C50]/10 hover:shadow-md'
                      }`}
                    >
                      {pet.photo_url ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={pet.photo_url}
                            alt={pet.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 flex items-center justify-center text-lg">
                          {getSpeciesEmoji(pet.species)}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-[#5F7C50] font-display">{pet.name}</h3>
                        <p className="text-xs text-[#1A1A1A]/50 font-sans">{pet.species}</p>
                      </div>
                      {currentPetId === pet.id && (
                        <div className="w-6 h-6 rounded-full bg-[#5F7C50] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}