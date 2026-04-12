'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { getHealthEvents, addHealthEvent, deleteHealthEvent, updateHealthEvent } from './actions';
import { getMedications, addMedication, deleteMedication, updateMedication } from './medication-actions';
import { MedicationModal } from './medication-modal';
import { AddMedicationModal } from './add-medication-modal';
import { PetSelectorModal } from './pet-selector-modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
}

interface HealthEvent {
  id: string;
  pet_id: string;
  type: 'vaccine' | 'medication' | 'appointment';
  title: string;
  date: string;
  description?: string;
  veterinarian?: string;
  notes?: string;
}

interface Medication {
  id: string;
  pet_id: string;
  owner_id: string;
  name: string;
  dose_value: string;
  dose_unit: string;
  frequency_value: string;
  frequency_unit: string;
  is_continuous: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

interface TimelineItem {
  id: string;
  type: 'health_event' | 'medication_start';
  date: string;
  title: string;
  icon: string;
  color: string;
  data: HealthEvent | Medication;
}

export default function HealthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMedicationModalOpen, setAddMedicationModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'vaccine' | 'medication' | 'appointment'>('vaccine');
  const [isMounted, setIsMounted] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [allPets, setAllPets] = useState<Pet[]>([]);

  // Evitar erros de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadSelectedPet() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get selected pet ID from localStorage
        const savedPetId = localStorage.getItem('selectedPetId');

        if (savedPetId) {
          // Fetch the specific pet
          const { data: petData } = await supabase
            .from('pets')
            .select('id, name, species, photo_url')
            .eq('id', savedPetId)
            .eq('owner_id', user.id)
            .single();

          if (petData) {
            setSelectedPet(petData);
          }
        } else {
          // Fallback: get the first pet
          const { data: petsData } = await supabase
            .from('pets')
            .select('id, name, species, photo_url')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1);

          if (petsData && petsData.length > 0) {
            setSelectedPet(petsData[0]);
            localStorage.setItem('selectedPetId', petsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading pet:', error);
      } finally {
        setIsLoading(false);
      }
    }

    async function loadAllPets() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Load all pets for the user
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name, species, photo_url')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true });

        if (petsData) {
          setAllPets(petsData);
        }
      } catch (error) {
        console.error('Error loading all pets:', error);
      }
    }

    loadSelectedPet();
    loadAllPets(); // Load all pets for the selector

    // Listen for storage changes (when pet is selected in dashboard)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedPetId' && e.newValue) {
        loadSelectedPet();
        loadAllPets();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event (for same-tab updates)
    const handlePetChange = () => {
      loadSelectedPet();
      loadAllPets();
    };

    window.addEventListener('petChanged', handlePetChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('petChanged', handlePetChange);
    };
  }, []);

  useEffect(() => {
    async function loadEvents() {
      if (!selectedPet) return;

      setIsLoadingEvents(true);
      const [eventsData, medicationsData] = await Promise.all([
        getHealthEvents(selectedPet.id),
        getMedications(selectedPet.id),
      ]);
      setEvents(eventsData);
      setMedications(medicationsData);
      setIsLoadingEvents(false);
    }

    loadEvents();
  }, [selectedPet]);

  // Função para selecionar um pet
  const selectPet = (pet: Pet) => {
    localStorage.setItem('selectedPetId', pet.id);
    setSelectedPet(pet);

    // Disparar evento para atualizar em outros componentes
    window.dispatchEvent(new CustomEvent('petChanged'));

    setShowPetSelector(false);
  };

  // Helper functions (definidas antes de serem usadas)
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vaccine':
        return '💉';
      case 'medication':
        return '💊';
      case 'appointment':
        return '🏥';
      default:
        return '📋';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'vaccine':
        return 'from-blue-500/20 to-blue-400/20';
      case 'medication':
        return 'from-purple-500/20 to-purple-400/20';
      case 'appointment':
        return 'from-green-500/20 to-green-400/20';
      default:
        return 'from-[#5F7C50]/20 to-[#A6B89E]/20';
    }
  };

  const formatMonthYear = (monthYear: string) => {
    if (!isMounted) return monthYear;
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString: string) => {
    if (!isMounted) return dateString;
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };

  // Agrupar eventos por mês/ano
  const groupEventsByMonth = (events: HealthEvent[]) => {
    const groups: Record<string, HealthEvent[]> = {};

    events.forEach(event => {
      // Parse date as local date to avoid timezone issues
      const [year, month, day] = event.date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(event);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  // Merge health_events e medications para a timeline unificada
  const mergeTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Adicionar health_events (exceto medications do tipo antigo)
    events.forEach(event => {
      if (event.type !== 'medication') {
        items.push({
          id: event.id,
          type: 'health_event',
          date: event.date,
          title: event.title,
          icon: getEventIcon(event.type),
          color: getEventColor(event.type),
          data: event,
        });
      }
    });

    // Adicionar medications como "Início do Tratamento" e "Fim de Tratamento"
    medications.forEach(med => {
      // Card de Início
      items.push({
        id: med.id,
        type: 'medication_start',
        date: med.start_date,
        title: `${med.name} - Início do tratamento`,
        icon: '💊',
        color: 'from-purple-500/20 to-purple-400/20',
        data: med,
      });

      // Card de Fim (se não for contínuo e tiver end_date)
      if (!med.is_continuous && med.end_date) {
        items.push({
          id: `${med.id}-end`,
          type: 'medication_end',
          date: med.end_date,
          title: `${med.name} - Fim do tratamento`,
          icon: '🏁',
          color: 'from-green-500/20 to-green-400/20',
          data: med,
        });
      }
    });

    // Ordenar por data (mais recente primeiro)
    return items.sort((a, b) => b.date.localeCompare(a.date));
  };

  const groupTimelineByMonth = (items: TimelineItem[]) => {
    const groups: Record<string, TimelineItem[]> = {};

    items.forEach(item => {
      const [year, month, day] = item.date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  // Filtrar eventos por tipo baseado na aba ativa
  const getFilteredEvents = () => {
    if (activeTab === 'timeline') {
      // Timeline: Vacinas, Consultas e Início de Tratamentos
      const timelineItems = mergeTimelineItems();
      return timelineItems;
    } else if (activeTab === 'medicamentos') {
      // Medicamentos: retorna medications direto (não TimelineItems)
      return medications;
    } else if (activeTab === 'vacinas') {
      // Apenas vacinas
      return events.filter(event => event.type === 'vaccine');
    } else if (activeTab === 'consultas') {
      // Apenas consultas
      return events.filter(event => event.type === 'appointment');
    }
    return [];
  };

  const filteredData = getFilteredEvents();

  // Para timeline, agrupar TimelineItems
  const groupedTimeline = activeTab === 'timeline' ? groupTimelineByMonth(filteredData as TimelineItem[]) : [];

  // Para outras abas (vacinas, consultas), agrupar HealthEvents
  const groupedEvents = (activeTab === 'vacinas' || activeTab === 'consultas')
    ? groupEventsByMonth(filteredData as HealthEvent[])
    : [];

  // Separar medicamentos ativos e histórico
  const activeMedications = medications.filter(med => {
    if (med.is_continuous) return true;
    if (!med.end_date) return true;
    const today = new Date().toISOString().split('T')[0];
    return med.end_date >= today;
  });

  const historicMedications = medications.filter(med => {
    if (med.is_continuous) return false;
    if (!med.end_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return med.end_date < today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10 pb-24 md:pb-8">
      {/* Header Fixo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#5F7C50]/10 sticky top-0 z-40 px-4 py-4">
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
            <h1 className="text-xl font-bold text-[#5F7C50] font-display">Saúde</h1>
            <div className="flex items-center gap-2 mt-1">
              {isLoading ? (
                <div className="h-6 w-20 bg-[#5F7C50]/10 rounded-full animate-pulse" />
              ) : selectedPet ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPetSelector(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#5F7C50]/10 hover:bg-[#5F7C50]/20 transition-colors"
                >
                  {selectedPet.photo_url ? (
                    <div className="relative w-4 h-4 rounded-full overflow-hidden">
                      <Image
                        src={selectedPet.photo_url}
                        alt={selectedPet.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="text-xs">{getSpeciesEmoji(selectedPet.species)}</span>
                  )}
                  <span className="text-xs text-[#5F7C50] font-sans">
                    {selectedPet.name}
                  </span>
                </motion.button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Menu de Pílulas */}
      <div className="bg-white border-b border-[#5F7C50]/10 px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 max-w-7xl mx-auto">
          {['timeline', 'medicamentos'].map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium font-sans whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#5F7C50] text-white shadow-md'
                  : 'bg-[#F5F5F0] text-[#1A1A1A]/60 hover:bg-[#5F7C50]/10'
              }`}
            >
              {tab === 'timeline' ? 'Linha do Tempo' : 'Medicamentos'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conteúdo com Transição */}
      <div className="max-w-7xl mx-auto px-4 py-6 min-h-[calc(100vh-200px)] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' ? (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative min-h-full"
            >
              {/* Linha vertical com fade-out */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#5F7C50]/20 via-[#5F7C50]/20 to-transparent" />

              {/* Cards agrupados por mês */}
              <div className="space-y-8 pb-20">
                {isLoadingEvents ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : groupedTimeline.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#1A1A1A]/50 font-sans text-sm">
                      Nenhum evento de saúde registrado ainda
                    </p>
                  </div>
                ) : (
                  groupedTimeline.map(([monthYear, monthItems]) => (
                    <div key={monthYear} className="relative">
                      {/* Header do Mês */}
                      <div className="relative pl-16 mb-6">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 border-[#5F7C50]/20 flex items-center justify-center z-10">
                          <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#5F7C50] font-display capitalize">
                          {formatMonthYear(monthYear)}
                        </h3>
                      </div>

                      {/* Eventos do Mês */}
                      <div className="space-y-6">
                        {monthItems.map((item, index) => (
                          <TimelineItemCard
                            key={item.id}
                            item={item}
                            index={index}
                            onOpen={() => {
                              if (item.type === 'health_event') {
                                setSelectedEvent(item.data as HealthEvent);
                              } else {
                                // Para medicamentos (início ou fim), abrir o mesmo modal
                                setSelectedMedication(item.data as Medication);
                              }
                            }}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : activeTab === 'medicamentos' ? (
            <motion.div
              key="medicamentos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="pb-20"
            >
              <MedicationsManagementView
                activeMedications={activeMedications}
                historicMedications={historicMedications}
                isLoading={isLoadingEvents}
                onMedicationClick={setSelectedMedication}
                formatDate={formatDate}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* FAB Contextual */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
        {activeTab === 'medicamentos' ? (
          // FAB direto para medicação
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setAddMedicationModalOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A6B89E] text-white shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        ) : (
          // Speed Dial para timeline
          <>
            <AnimatePresence>
              {showSpeedDial && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-16 right-0 flex flex-col gap-3"
                >
                  {[
                    { label: 'Vacina', icon: '💉', color: 'bg-[#4F6D45]', type: 'vaccine' as const },
                    { label: 'Medicação', icon: '💊', color: 'bg-[#8B7355]', type: 'medication' as const },
                    { label: 'Consulta', icon: '🏥', color: 'bg-[#A6B89E]', type: 'appointment' as const },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (item.type === 'medication') {
                          setActiveTab('medicamentos');
                          setTimeout(() => setAddMedicationModalOpen(true), 300);
                        } else {
                          setAddModalType(item.type);
                          setAddModalOpen(true);
                        }
                        setShowSpeedDial(false);
                      }}
                      className={`${item.color} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-sans cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSpeedDial(!showSpeedDial)}
              className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] text-white shadow-lg flex items-center justify-center transition-transform cursor-pointer ${
                showSpeedDial ? 'rotate-45' : ''
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </motion.button>
          </>
        )}
      </div>

      {/* Modal Adaptativo para Visualização de Eventos */}
      <EventModal
        event={selectedEvent}
        onClose={async () => {
          setSelectedEvent(null);
          // Reload events after edit/delete
          if (selectedPet) {
            const [eventsData, medicationsData] = await Promise.all([
              getHealthEvents(selectedPet.id),
              getMedications(selectedPet.id),
            ]);
            setEvents(eventsData);
            setMedications(medicationsData);
          }
        }}
        getEventIcon={getEventIcon}
        getEventColor={getEventColor}
      />

      {/* Modal Adaptativo para Visualização de Medicamentos */}
      <MedicationModal
        medication={selectedMedication}
        onClose={async () => {
          setSelectedMedication(null);
          // Reload medications after edit/delete
          if (selectedPet) {
            const medicationsData = await getMedications(selectedPet.id);
            setMedications(medicationsData);
          }
        }}
      />

      {/* Modal para Adicionar Evento */}
      <AddEventModal
        isOpen={addModalOpen}
        onClose={async () => {
          setAddModalOpen(false);
          // Reload events after adding
          if (selectedPet) {
            const data = await getHealthEvents(selectedPet.id);
            setEvents(data);
          }
        }}
        eventType={addModalType}
        petId={selectedPet?.id || ''}
        petName={selectedPet?.name || ''}
      />

      {/* Modal para Adicionar Medicamento */}
      <AddMedicationModal
        isOpen={addMedicationModalOpen}
        onClose={async () => {
          setAddMedicationModalOpen(false);
          // Reload medications after adding
          if (selectedPet) {
            const medicationsData = await getMedications(selectedPet.id);
            setMedications(medicationsData);
          }
        }}
        petId={selectedPet?.id || ''}
        petName={selectedPet?.name || ''}
      />

      {/* Modal de Seleção de Pet */}
      <PetSelectorModal
        isOpen={showPetSelector}
        onClose={() => setShowPetSelector(false)}
        pets={allPets}
        onSelectPet={selectPet}
        currentPetId={selectedPet?.id}
      />
    </div>
  );
}

// Timeline Item Card (unificado para health_events e medications)
function TimelineItemCard({
  item,
  index,
  onOpen,
  formatDate,
}: {
  item: TimelineItem;
  index: number;
  onOpen: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-16"
    >
      {/* Ponto na linha */}
      <div className={`absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br ${item.color} border-2 border-white shadow-md flex items-center justify-center text-xs`}>
        {item.icon}
      </div>

      {/* Card clicável */}
      <motion.div
        onClick={onOpen}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-2xl shadow-md p-4 border border-[#5F7C50]/10 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#5F7C50] mb-1 font-display">
              {item.title}
            </h3>
            {item.type === 'health_event' && (
              <p className="text-sm text-[#1A1A1A]/70 font-sans mb-2">
                {(item.data as HealthEvent).description}
              </p>
            )}
            {(item.type === 'medication_start' || item.type === 'medication_end') && (
              <p className="text-sm text-[#1A1A1A]/70 font-sans mb-2">
                {(item.data as Medication).dose_value} {(item.data as Medication).dose_unit} • A cada {(item.data as Medication).frequency_value} {(item.data as Medication).frequency_unit}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-sans">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(item.date)}</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl`}>
            {item.icon}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// View de Gestão de Medicamentos (Ativos + Histórico)
function MedicationsManagementView({
  activeMedications,
  historicMedications,
  isLoading,
  onMedicationClick,
  formatDate,
}: {
  activeMedications: Medication[];
  historicMedications: Medication[];
  isLoading: boolean;
  onMedicationClick: (medication: Medication) => void;
  formatDate: (date: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tratamentos Ativos */}
      <div>
        <h2 className="text-xl font-bold text-[#8B7355] mb-4 font-display">
          Tratamentos Ativos
        </h2>
        {activeMedications.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-[#8B7355]/10">
            <div className="w-16 h-16 rounded-full bg-[#8B7355]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">💊</span>
            </div>
            <p className="text-[#1A1A1A]/50 font-sans text-sm">
              Nenhum tratamento ativo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeMedications.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onMedicationClick(med)}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl shadow-md p-5 border border-[#8B7355]/10 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-400/20 flex items-center justify-center text-2xl flex-shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#8B7355] mb-1 font-display">
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-[#1A1A1A]/70 font-sans">
                        {med.dose_value} {med.dose_unit}
                      </span>
                      <span className="text-[#1A1A1A]/30">•</span>
                      <span className="text-sm text-[#1A1A1A]/70 font-sans">
                        A cada {med.frequency_value} {med.frequency_unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-sans">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Desde {formatDate(med.start_date)}</span>
                      {med.is_continuous && (
                        <>
                          <span className="text-[#1A1A1A]/30">•</span>
                          <span className="text-[#8B7355] font-medium">Uso Contínuo</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#8B7355]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico */}
      {historicMedications.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]/50 mb-4 font-display">
            Histórico
          </h2>
          <div className="space-y-3">
            {historicMedications.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onMedicationClick(med)}
                whileTap={{ scale: 0.98 }}
                className="bg-white/50 rounded-2xl shadow-sm p-4 border border-[#1A1A1A]/5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-400/10 flex items-center justify-center text-lg flex-shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#1A1A1A]/70 mb-1 font-display">
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/40 font-sans">
                      <span>{med.dose_value} {med.dose_unit}</span>
                      <span>•</span>
                      <span>A cada {med.frequency_value} {med.frequency_unit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/40 font-sans mt-1">
                      <span>{formatDate(med.start_date)}</span>
                      <span>→</span>
                      <span>{med.end_date ? formatDate(med.end_date) : 'Contínuo'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Timeline Card (apenas clicável, sem swipe)
function VaccinesList({
  events,
  isLoading,
  onEventClick,
  formatDate,
}: {
  events: HealthEvent[];
  isLoading: boolean;
  onEventClick: (event: HealthEvent) => void;
  formatDate: (date: string) => string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">💉</span>
        </div>
        <p className="text-[#1A1A1A]/50 font-sans text-sm">
          Nenhuma vacina registrada ainda
        </p>
        <p className="text-[#1A1A1A]/30 font-sans text-xs mt-2">
          Clique no botão + para adicionar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onEventClick(event)}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-2xl shadow-md p-5 border border-blue-500/10 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Ícone */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/20 flex items-center justify-center text-2xl flex-shrink-0">
              💉
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#5F7C50] mb-1 font-display">
                {event.title}
              </h3>

              {event.veterinarian && (
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#5F7C50]/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm text-[#1A1A1A]/70 font-sans">
                    {event.veterinarian}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-sans">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Aplicada em {formatDate(event.date)}</span>
              </div>
            </div>

            {/* Seta */}
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#5F7C50]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {event.notes && (
            <div className="mt-3 pt-3 border-t border-blue-500/10">
              <p className="text-xs text-[#1A1A1A]/60 font-sans line-clamp-2">
                {event.notes}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Lista de Consultas (design focado em cards)
function AppointmentsList({
  events,
  isLoading,
  onEventClick,
  formatDate,
}: {
  events: HealthEvent[];
  isLoading: boolean;
  onEventClick: (event: HealthEvent) => void;
  formatDate: (date: string) => string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🏥</span>
        </div>
        <p className="text-[#1A1A1A]/50 font-sans text-sm">
          Nenhuma consulta registrada ainda
        </p>
        <p className="text-[#1A1A1A]/30 font-sans text-xs mt-2">
          Clique no botão + para adicionar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onEventClick(event)}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-2xl shadow-md p-5 border border-green-500/10 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Ícone */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-400/20 flex items-center justify-center text-2xl flex-shrink-0">
              🏥
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#5F7C50] mb-1 font-display">
                {event.title}
              </h3>

              {event.veterinarian && (
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#5F7C50]/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm text-[#1A1A1A]/70 font-sans">
                    {event.veterinarian}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-sans">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Realizada em {formatDate(event.date)}</span>
              </div>
            </div>

            {/* Seta */}
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#5F7C50]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {event.notes && (
            <div className="mt-3 pt-3 border-t border-green-500/10">
              <p className="text-xs text-[#1A1A1A]/60 font-sans line-clamp-2">
                {event.notes}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Lista de Medicamentos (design focado em rotina)
function MedicationsList({
  events,
  isLoading,
  onEventClick,
  formatDate,
}: {
  events: HealthEvent[];
  isLoading: boolean;
  onEventClick: (event: HealthEvent) => void;
  formatDate: (date: string) => string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-[#8B7355]/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">💊</span>
        </div>
        <p className="text-[#1A1A1A]/50 font-sans text-sm">
          Nenhum medicamento registrado ainda
        </p>
        <p className="text-[#1A1A1A]/30 font-sans text-xs mt-2">
          Clique no botão + para adicionar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onEventClick(event)}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-2xl shadow-md p-5 border border-[#8B7355]/10 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Ícone */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-400/20 flex items-center justify-center text-2xl flex-shrink-0">
              💊
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#8B7355] mb-1 font-display">
                {event.title}
              </h3>

              {event.description && (
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#8B7355]/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-[#1A1A1A]/70 font-sans">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-sans">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Desde {formatDate(event.date)}</span>
              </div>
            </div>

            {/* Seta */}
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#8B7355]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {event.notes && (
            <div className="mt-3 pt-3 border-t border-[#8B7355]/10">
              <p className="text-xs text-[#1A1A1A]/60 font-sans line-clamp-2">
                {event.notes}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Timeline Card (apenas clicável, sem swipe)
function TimelineCard({
  event,
  index,
  onOpen,
  getEventIcon,
  getEventColor,
  formatDate,
}: {
  event: HealthEvent;
  index: number;
  onOpen: () => void;
  getEventIcon: (type: string) => string;
  getEventColor: (type: string) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-16"
    >
      {/* Ponto na linha */}
      <div className={`absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br ${getEventColor(event.type)} border-2 border-white shadow-md flex items-center justify-center text-xs`}>
        {getEventIcon(event.type)}
      </div>

      {/* Card clicável */}
      <motion.div
        onClick={onOpen}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-2xl shadow-md p-4 border border-[#5F7C50]/10 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#5F7C50] mb-1 font-display">
              {event.title}
            </h3>
            <p className="text-sm text-[#1A1A1A]/70 font-sans mb-2">
              {event.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-sans">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getEventColor(event.type)} flex items-center justify-center text-2xl`}>
            {getEventIcon(event.type)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal Adaptativo (Bottom Sheet mobile / Side Panel desktop)
function EventModal({
  event,
  onClose,
  getEventIcon,
  getEventColor,
}: {
  event: HealthEvent | null;
  onClose: () => void;
  getEventIcon: (type: string) => string;
  getEventColor: (type: string) => string;
}) {
  if (!event) return null;

  return (
    <AnimatePresence>
      {event && (
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
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-[#1A1A1A]/20 rounded-full mx-auto mb-6" />

              <ModalContent event={event} onClose={onClose} getEventIcon={getEventIcon} getEventColor={getEventColor} />
            </div>
          </motion.div>

          {/* Side Panel (desktop) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="hidden md:block fixed top-0 right-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-8">
              <ModalContent event={event} onClose={onClose} getEventIcon={getEventIcon} getEventColor={getEventColor} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  event,
  onClose,
  getEventIcon,
  getEventColor,
}: {
  event: HealthEvent;
  onClose: () => void;
  getEventIcon: (type: string) => string;
  getEventColor: (type: string) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDateLong = (dateString: string) => {
    if (!isMounted) return dateString;
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteHealthEvent(event.id);
    if (result.success) {
      onClose();
      // Trigger reload via callback instead of window.location.reload()
    } else {
      alert('Erro ao excluir evento');
      setIsDeleting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('pet_id', event.pet_id);
    formData.set('type', event.type);

    startTransition(async () => {
      const result = await updateHealthEvent(event.id, formData);
      if (result.success) {
        setIsEditing(false);
        onClose();
        // Trigger reload via callback instead of window.location.reload()
      } else {
        setErrors({ [result.field || 'general']: result.error });
      }
    });
  }

  if (showDeleteConfirm) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center py-8"
      >
        {/* Ícone de Aviso */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-[#C85A54]/10 flex items-center justify-center mb-6"
        >
          <svg className="w-10 h-10 text-[#C85A54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </motion.div>

        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 font-display">
          Excluir Evento?
        </h3>
        <p className="text-sm text-[#1A1A1A]/70 font-sans text-center mb-8 max-w-sm">
          Tem certeza que deseja excluir <span className="font-semibold text-[#C85A54]">{event.title}</span>? Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3 w-full">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-2xl bg-[#F5F5F0] text-[#1A1A1A] font-medium font-sans hover:bg-[#5F7C50]/10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-2xl bg-[#C85A54] text-white font-medium font-sans hover:bg-[#C85A54]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner />
                <span>Excluindo...</span>
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#5F7C50] mb-2 font-display">
              Editar Evento
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 font-sans">
              {getEventIcon(event.type)} {event.type === 'vaccine' ? 'Vacina' : event.type === 'medication' ? 'Medicação' : 'Consulta'}
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(false)}
            className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
          >
            <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Título *
          </label>
          <input
            type="text"
            name="title"
            required
            disabled={isPending}
            defaultValue={event.title}
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Data *
          </label>
          <input
            type="date"
            name="date"
            required
            disabled={isPending}
            defaultValue={event.date}
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
          />
        </div>

        {/* Veterinário (para vaccine e appointment) */}
        {(event.type === 'vaccine' || event.type === 'appointment') && (
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
              Veterinário
            </label>
            <input
              type="text"
              name="veterinarian"
              disabled={isPending}
              defaultValue={event.veterinarian || ''}
              className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
          </div>
        )}

        {/* Descrição (para medication) */}
        {event.type === 'medication' && (
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
              Frequência/Dosagem
            </label>
            <input
              type="text"
              name="description"
              disabled={isPending}
              defaultValue={event.description || ''}
              className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Observações
          </label>
          <textarea
            name="notes"
            disabled={isPending}
            rows={3}
            defaultValue={event.notes || ''}
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(false)}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl bg-[#F5F5F0] text-[#1A1A1A] font-medium font-sans hover:bg-[#5F7C50]/10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl bg-[#5F7C50] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <LoadingSpinner />
                <span>Salvando...</span>
              </>
            ) : (
              'Salvar Alterações'
            )}
          </motion.button>
        </div>
      </form>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getEventColor(event.type)} flex items-center justify-center text-3xl`}>
          {getEventIcon(event.type)}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
        >
          <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      {/* Conteúdo */}
      <h2 className="text-2xl font-bold text-[#5F7C50] mb-2 font-display">
        {event.title}
      </h2>
      <p className="text-sm text-[#1A1A1A]/70 font-sans mb-6">
        {event.description}
      </p>

      {/* Detalhes */}
      <div className="space-y-4">
        <div className="bg-[#F5F5F0] rounded-2xl p-4">
          <p className="text-xs text-[#1A1A1A]/50 font-sans mb-1">Data</p>
          <p className="text-sm font-semibold text-[#5F7C50] font-sans">
            {formatDateLong(event.date)}
          </p>
        </div>

        {event.veterinarian && (
          <div className="bg-[#F5F5F0] rounded-2xl p-4">
            <p className="text-xs text-[#1A1A1A]/50 font-sans mb-1">Veterinário</p>
            <p className="text-sm font-semibold text-[#5F7C50] font-sans">
              {event.veterinarian}
            </p>
          </div>
        )}

        {event.notes && (
          <div className="bg-[#F5F5F0] rounded-2xl p-4">
            <p className="text-xs text-[#1A1A1A]/50 font-sans mb-1">Observações</p>
            <p className="text-sm text-[#1A1A1A]/70 font-sans">
              {event.notes}
            </p>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3 mt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          className="flex-1 py-3 rounded-2xl bg-[#5F7C50] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow"
        >
          Editar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 py-3 rounded-2xl bg-[#C85A54] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow"
        >
          Excluir
        </motion.button>
      </div>
    </>
  );
}

// Modal para Adicionar Evento
function AddEventModal({
  isOpen,
  onClose,
  eventType,
  petId,
  petName,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventType: 'vaccine' | 'medication' | 'appointment';
  petId: string;
  petName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventLabels = {
    vaccine: 'Vacina',
    medication: 'Medicação',
    appointment: 'Consulta',
  };

  const eventIcons = {
    vaccine: '💉',
    medication: '💊',
    appointment: '🏥',
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('pet_id', petId);
    formData.set('type', eventType);

    startTransition(async () => {
      const result = await addHealthEvent(formData);
      if (result.success) {
        onClose();
      } else {
        setErrors({ [result.field]: result.error });
      }
    });
  }

  if (!isOpen) return null;

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
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-[#1A1A1A]/20 rounded-full mx-auto mb-6" />

              <AddEventForm
                eventType={eventType}
                eventLabels={eventLabels}
                eventIcons={eventIcons}
                petName={petName}
                isPending={isPending}
                errors={errors}
                onSubmit={handleSubmit}
                onClose={onClose}
              />
            </div>
          </motion.div>

          {/* Side Panel (desktop) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="hidden md:block fixed top-0 right-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-8">
              <AddEventForm
                eventType={eventType}
                eventLabels={eventLabels}
                eventIcons={eventIcons}
                petName={petName}
                isPending={isPending}
                errors={errors}
                onSubmit={handleSubmit}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AddEventForm({
  eventType,
  eventLabels,
  eventIcons,
  petName,
  isPending,
  errors,
  onSubmit,
  onClose,
}: {
  eventType: 'vaccine' | 'medication' | 'appointment';
  eventLabels: Record<string, string>;
  eventIcons: Record<string, string>;
  petName: string;
  isPending: boolean;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const [defaultDate, setDefaultDate] = useState('');

  useEffect(() => {
    // Set default date only on client side
    setDefaultDate(new Date().toISOString().split('T')[0]);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#5F7C50] mb-2 font-display">
            {eventIcons[eventType]} {eventLabels[eventType]}
          </h2>
          <p className="text-sm text-[#1A1A1A]/70 font-sans">
            Registrando para <span className="font-semibold text-[#5F7C50]">{petName}</span>
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
        >
          <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Título *
          </label>
          <input
            type="text"
            name="title"
            required
            disabled={isPending}
            placeholder={
              eventType === 'vaccine'
                ? 'Ex: Vacina Antirrábica'
                : eventType === 'medication'
                ? 'Ex: Vermífugo'
                : 'Ex: Consulta de Rotina'
            }
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.title ? 'border-red-400' : 'border-[#5F7C50]/20'
            } focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.title}</p>
          )}
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Data *
          </label>
          <input
            type="date"
            name="date"
            required
            disabled={isPending}
            defaultValue={defaultDate}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.date ? 'border-red-400' : 'border-[#5F7C50]/20'
            } focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]`}
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.date}</p>
          )}
        </div>

        {/* Veterinário (para vaccine e appointment) */}
        {(eventType === 'vaccine' || eventType === 'appointment') && (
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
              Veterinário
            </label>
            <input
              type="text"
              name="veterinarian"
              disabled={isPending}
              placeholder="Ex: Dra. Maria Silva"
              className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
          </div>
        )}

        {/* Descrição (para medication) */}
        {eventType === 'medication' && (
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
              Frequência/Dosagem
            </label>
            <input
              type="text"
              name="description"
              disabled={isPending}
              placeholder="Ex: 1 comprimido a cada 12 horas"
              className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Observações
          </label>
          <textarea
            name="notes"
            disabled={isPending}
            rows={3}
            placeholder="Adicione observações adicionais..."
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm resize-none"
          />
        </div>

        {/* Error geral */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm font-sans">{errors.general}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl bg-[#F5F5F0] text-[#1A1A1A] font-medium font-sans hover:bg-[#5F7C50]/10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={isPending}
            className="flex-1 py-3 rounded-2xl bg-[#5F7C50] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <LoadingSpinner />
                <span>Salvando...</span>
              </>
            ) : (
              'Salvar'
            )}
          </motion.button>
        </div>
      </form>
    </>
  );
}
