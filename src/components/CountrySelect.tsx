'use client';

import { useState, useRef, useEffect } from 'react';
import { countries } from '@/lib/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, error, disabled }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((c) => c.code === value);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
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
        className={`w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-white text-left flex items-center justify-between transition-all duration-200 ${
          error
            ? 'border border-red-400 focus:border-red-500'
            : 'border border-[#5F7C50]/20 focus:border-[#5F7C50]/40'
        } focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-[#141414] font-sans">
          {selectedCountry ? (
            <>
              <span className="mr-2">{selectedCountry.flag}</span>
              {selectedCountry.name}
            </>
          ) : (
            <span className="text-[#141414]/50">Selecione seu país</span>
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
        <div className="absolute z-50 w-full mt-2 bg-white rounded-3xl shadow-md border border-[#5F7C50]/10 overflow-hidden">
          <div className="p-3 border-b border-[#5F7C50]/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar país..."
              className="w-full px-4 py-2 rounded-2xl bg-[#F4F7F6] border-none focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 text-[#141414] font-sans"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-[#EBF2B6]/30 transition-colors flex items-center ${
                    value === country.code ? 'bg-[#EBF2B6]/50' : ''
                  }`}
                >
                  <span className="mr-3 text-xl">{country.flag}</span>
                  <span className="text-[#141414] font-sans">
                    {country.name}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-[#141414]/50 font-sans">
                Nenhum país encontrado
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
