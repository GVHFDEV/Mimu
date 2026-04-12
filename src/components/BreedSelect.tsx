'use client';

import { useState, useRef, useEffect } from 'react';

interface BreedSelectProps {
  species: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const breedOptions: Record<string, string[]> = {
  dog: ["Sem Raça Definida (SRD)", "Poodle", "Buldogue Francês", "Golden Retriever", "Pastor Alemão", "Labrador", "Shih Tzu", "Pug", "Spitz Alemão", "Pitbull", "Pinscher", "Outra"],
  cat: ["Sem Raça Definida (SRD)", "Siamês", "Persa", "Maine Coon", "Angorá", "Sphynx", "Bengal", "Ragdoll", "British Shorthair", "Outra"],
  rabbit: ["Sem Raça Definida (SRD)", "Lionhead", "Rex", "Holland Lop", "Netherland Dwarf", "Fuzzy Lop", "Outra"],
  hamster: ["Sem Raça Definida (SRD)", "Sírio", "Anão Russo", "Chinês", "Roborovski", "Outra"],
  bird: ["Sem Raça Definida (SRD)", "Lutino", "Cara Branca", "Pérola", "Arlequim", "Outra"],
  guineapig: ["Sem Raça Definida (SRD)", "Inglês", "Abissínio", "Peruano", "Sheltie", "Outra"],
  ferret: ["Sem Raça Definida (SRD)", "Sable", "Albino", "Panda", "Champagne", "Outra"],
  default: ["Sem Raça Definida (SRD)", "Outra"]
};

// Helper function to check if species has specific breeds
export function hasSpecificBreeds(species: string): boolean {
  const breeds = breedOptions[species] || breedOptions.default;
  // Only show breed selector if there are more than just "SRD" and "Outra"
  return breeds.length > 2;
}

export function BreedSelect({ species, value, onChange, error, disabled }: BreedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get breeds based on species
  const breeds = breedOptions[species] || breedOptions.default;

  const filteredBreeds = breeds.filter((breed) =>
    breed.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-white text-left flex items-center justify-between transition-all duration-200 text-sm shadow-sm ${
          error
            ? 'border-2 border-red-400 focus:border-red-500'
            : 'border-2 border-[#4F6D45]/20 focus:border-[#4F6D45] hover:border-[#4F6D45]/30'
        } focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/10 disabled:opacity-50 disabled:cursor-not-allowed font-sans`}
      >
        <span className={value ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'}>
          {value || 'Selecione a raça'}
        </span>
        <svg
          className={`w-5 h-5 text-[#4F6D45] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-lg border border-[#4F6D45]/10 overflow-hidden">
          <div className="p-3 border-b border-[#4F6D45]/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar raça..."
              className="w-full px-3 py-2 rounded-xl bg-[#F5F5F0] border-none focus:outline-none focus:ring-2 focus:ring-[#4F6D45]/20 text-sm text-[#1A1A1A] font-sans"
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredBreeds.length > 0 ? (
              filteredBreeds.map((breed) => (
                <button
                  key={breed}
                  type="button"
                  onClick={() => {
                    onChange(breed);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors font-sans ${
                    value === breed
                      ? 'bg-[#A6B89E]/20 text-[#4F6D45] font-medium'
                      : 'text-[#1A1A1A] hover:bg-[#F5F5F0]'
                  }`}
                >
                  {breed}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#1A1A1A]/50 font-sans">
                Nenhuma raça encontrada
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
