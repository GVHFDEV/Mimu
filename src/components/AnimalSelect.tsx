'use client';

import { useState, useRef, useEffect } from 'react';

interface AnimalSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const animals = [
  { value: 'fish', label: 'Peixe', emoji: '🐠' },
  { value: 'bird', label: 'Pássaro', emoji: '🐦' },
  { value: 'hamster', label: 'Hamster', emoji: '🐹' },
  { value: 'rabbit', label: 'Coelho', emoji: '🐰' },
  { value: 'turtle', label: 'Tartaruga', emoji: '🐢' },
  { value: 'guinea_pig', label: 'Porquinho-da-Índia', emoji: '🐹' },
  { value: 'cockatiel', label: 'Calopsita', emoji: '🦜' },
  { value: 'parrot', label: 'Papagaio', emoji: '🦜' },
  { value: 'ferret', label: 'Furão', emoji: '🦦' },
  { value: 'iguana', label: 'Iguana', emoji: '🦎' },
  { value: 'snake', label: 'Cobra', emoji: '🐍' },
  { value: 'spider', label: 'Aranha', emoji: '🕷️' },
  { value: 'rat', label: 'Rato', emoji: '🐀' },
  { value: 'tortoise', label: 'Jabuti', emoji: '🐢' },
  { value: 'horse', label: 'Cavalo', emoji: '🐴' },
];

export function AnimalSelect({ value, onChange, error, disabled }: AnimalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAnimal = animals.find((a) => a.value === value);

  const filteredAnimals = animals;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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
        className={`w-full px-5 py-3 rounded-2xl bg-white text-left flex items-center justify-between transition-all duration-200 ${
          error
            ? 'border-2 border-red-400 focus:border-red-500'
            : 'border-2 border-[#5F7C50]/20 focus:border-[#5F7C50]'
        } focus:outline-none focus:ring-4 focus:ring-[#5F7C50]/10 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-[#141414] font-sans">
          {selectedAnimal ? (
            <>
              <span className="mr-2">{selectedAnimal.emoji}</span>
              {selectedAnimal.label}
            </>
          ) : (
            <span className="text-[#141414]/50">Selecione o animal</span>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-[#5F7C50] transition-transform ${
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
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-md border-2 border-[#5F7C50]/10 overflow-hidden">
          <div className="max-h-[150px] overflow-y-auto">
            {filteredAnimals.length > 0 ? (
              filteredAnimals.map((animal) => (
                <button
                  key={animal.value}
                  type="button"
                  onClick={() => {
                    onChange(animal.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-[#EBF2B6]/30 transition-colors flex items-center ${
                    value === animal.value ? 'bg-[#EBF2B6]/50' : ''
                  }`}
                >
                  <span className="mr-3 text-xl">{animal.emoji}</span>
                  <span className="text-[#141414] font-sans">
                    {animal.label}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-[#141414]/50 font-sans">
                Nenhum animal encontrado
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500 font-sans">{error}</p>
      )}
    </div>
  );
}
