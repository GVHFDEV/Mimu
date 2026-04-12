'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface GeocodingResult {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
  };
}

interface LocationAutocompleteProps {
  onSelect: (location: { formatted: string; lat: number; lon: number }) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({ onSelect, placeholder = 'Digite sua cidade ou endereço...', className = '' }: LocationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isMouseOverDropdown, setIsMouseOverDropdown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false); // Track if we're in the middle of a selection
  const [lastSelectedValue, setLastSelectedValue] = useState<string | null>(null); // Track the last selected value

  // Use a ref to track the debounce timer so we can cancel it
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Manually implement debouncing to have more control
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    if (isSelecting) {
      // Don't debounce when we're in the middle of a selection
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, isSelecting]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling the modal when scrolling in the dropdown
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isMouseOverDropdown && dropdownRef.current) {
        const scrollTop = dropdownRef.current.scrollTop;
        const scrollHeight = dropdownRef.current.scrollHeight;
        const height = dropdownRef.current.clientHeight;
        const isTop = scrollTop === 0;
        const isBottom = Math.abs(scrollHeight - height - scrollTop) < 1;

        if ((isTop && e.deltaY < 0) || (isBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isMouseOverDropdown]);

  // Fetch geocoding results when debounced query changes
  useEffect(() => {
    // Don't fetch if the query is empty, we're in the middle of a selection, or the query matches the last selected value
    if (!debouncedQuery.trim() || isSelecting || (lastSelectedValue && debouncedQuery === lastSelectedValue)) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if API key is available
        if (!process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY) {
          setError('Chave da API Geoapify não configurada. Por favor, insira sua chave no arquivo .env.local');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(debouncedQuery.trim())}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Chave da API Geoapify inválida ou não autorizada. Verifique sua chave no arquivo .env.local');
          } else {
            throw new Error(`Erro na API: ${response.status}`);
          }
        }

        const data = await response.json();

        if (data.features && Array.isArray(data.features)) {
          // Format the results to match our interface expectations
          const formattedResults = data.features.slice(0, 2).map((feature: any) => ({
            properties: {
              formatted: feature.properties.formatted,
              lat: feature.properties.lat,
              lon: feature.properties.lon,
            }
          }));

          setResults(formattedResults);
          setIsOpen(true);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Erro ao buscar resultados de geocodificação:', err);
        setError('Falha ao buscar locais. Tente novamente.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, isSelecting, lastSelectedValue]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, results]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    const { formatted, lat, lon } = result.properties;

    // Cancel any pending debounce timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set the flag to prevent further API calls during selection
    setIsSelecting(true);

    // Store the selected value to prevent future searches for the same value
    setLastSelectedValue(formatted);

    onSelect({ formatted, lat, lon });

    // Update the input field
    setQuery(formatted);

    // Update debounced query immediately to prevent any future API calls
    setDebouncedQuery(formatted);

    setIsOpen(false);
    setHighlightedIndex(-1);
    setResults([]);

    // Reset the flag after a short delay to allow future searches
    setTimeout(() => {
      setIsSelecting(false);
    }, 300); // Small delay to ensure the selection is processed
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // If the user cleared the field, reset the last selected value to allow new searches
    if (!newValue.trim()) {
      setLastSelectedValue(null);
    }

    if (newValue.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px] ${className}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {isOpen && (results.length > 0 || error) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-[#5F7C50]/20 max-h-32 overflow-y-auto location-autocomplete-dropdown"
          onMouseEnter={() => setIsMouseOverDropdown(true)}
          onMouseLeave={() => setIsMouseOverDropdown(false)}
        >
          {error ? (
            <div className="p-3 text-red-500 text-sm font-sans">
              {error}
            </div>
          ) : (
            <ul>
              {results.map((result, index) => ( // Show results (limited to 2 in the API call)
                <li
                  key={`${result.properties.lat}-${result.properties.lon}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(result)}
                  className={`p-3 cursor-pointer text-sm font-sans ${
                    index === highlightedIndex
                      ? 'bg-[#5F7C50]/10 text-[#5F7C50]'
                      : 'hover:bg-[#5F7C50]/5'
                  }`}
                >
                  {result.properties.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}