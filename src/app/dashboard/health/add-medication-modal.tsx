'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { addMedication } from './medication-actions';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function AddMedicationModal({
  isOpen,
  onClose,
  petId,
  petName,
}: {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isContinuous, setIsContinuous] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('pet_id', petId);
    formData.set('is_continuous', isContinuous ? 'true' : 'false');

    startTransition(async () => {
      const result = await addMedication(formData);
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

              <AddMedicationForm
                petName={petName}
                isPending={isPending}
                errors={errors}
                isContinuous={isContinuous}
                setIsContinuous={setIsContinuous}
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
              <AddMedicationForm
                petName={petName}
                isPending={isPending}
                errors={errors}
                isContinuous={isContinuous}
                setIsContinuous={setIsContinuous}
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

function AddMedicationForm({
  petName,
  isPending,
  errors,
  isContinuous,
  setIsContinuous,
  onSubmit,
  onClose,
}: {
  petName: string;
  isPending: boolean;
  errors: Record<string, string>;
  isContinuous: boolean;
  setIsContinuous: (value: boolean) => void;
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
          <h2 className="text-2xl font-bold text-[#8B7355] mb-2 font-display">
            💊 Novo Medicamento
          </h2>
          <p className="text-sm text-[#1A1A1A]/70 font-sans">
            Registrando para <span className="font-semibold text-[#8B7355]">{petName}</span>
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
        {/* Nome do Medicamento */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Nome do Medicamento *
          </label>
          <input
            type="text"
            name="name"
            required
            disabled={isPending}
            placeholder="Ex: Vermífugo, Antibiótico"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? 'border-red-400' : 'border-[#8B7355]/20'
            } focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px]`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.name}</p>
          )}
        </div>

        {/* Dose */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Dose *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="dose_value"
              required
              disabled={isPending}
              placeholder="Ex: 1, 5, 10"
              className={`flex-1 px-4 py-3 rounded-xl border ${
                errors.dose_value ? 'border-red-400' : 'border-[#8B7355]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px]`}
            />
            <select
              name="dose_unit"
              required
              disabled={isPending}
              className={`w-32 px-4 py-3 rounded-xl border ${
                errors.dose_unit ? 'border-red-400' : 'border-[#8B7355]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px] bg-white`}
            >
              <option value="comprimido">comprimido</option>
              <option value="ml">ml</option>
              <option value="gota">gota</option>
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="cápsula">cápsula</option>
            </select>
          </div>
          {errors.dose_value && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.dose_value}</p>
          )}
        </div>

        {/* Frequência */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Frequência *
          </label>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-[#1A1A1A]/70 font-sans whitespace-nowrap">A cada</span>
            <input
              type="text"
              name="frequency_value"
              required
              disabled={isPending}
              placeholder="Ex: 8, 12, 24"
              className={`flex-1 px-4 py-3 rounded-xl border ${
                errors.frequency_value ? 'border-red-400' : 'border-[#8B7355]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px]`}
            />
            <select
              name="frequency_unit"
              required
              disabled={isPending}
              className={`w-28 px-4 py-3 rounded-xl border ${
                errors.frequency_unit ? 'border-red-400' : 'border-[#8B7355]/20'
              } focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px] bg-white`}
            >
              <option value="hora">hora(s)</option>
              <option value="dia">dia(s)</option>
              <option value="semana">semana(s)</option>
              <option value="mês">mês(es)</option>
            </select>
          </div>
          {errors.frequency_value && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.frequency_value}</p>
          )}
        </div>

        {/* Data de Início */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Data de Início *
          </label>
          <input
            type="date"
            name="start_date"
            required
            disabled={isPending}
            defaultValue={defaultDate}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.start_date ? 'border-red-400' : 'border-[#8B7355]/20'
            } focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px]`}
          />
          {errors.start_date && (
            <p className="text-red-500 text-xs mt-1 font-sans">{errors.start_date}</p>
          )}
        </div>

        {/* Toggle Switch de Uso Contínuo */}
        <div className="bg-[#F5F5F0] rounded-2xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] font-sans">
                Uso Contínuo
              </p>
              <p className="text-xs text-[#1A1A1A]/50 font-sans mt-0.5">
                Medicamento sem data de término
              </p>
            </div>
            <motion.button
              type="button"
              onClick={() => setIsContinuous(!isContinuous)}
              disabled={isPending}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isContinuous ? 'bg-[#8B7355]' : 'bg-[#1A1A1A]/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: isContinuous ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </label>
        </div>

        {/* Data de Término (condicional) */}
        {!isContinuous && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
              Data de Término
            </label>
            <input
              type="date"
              name="end_date"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl border border-[#8B7355]/20 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px]"
            />
          </motion.div>
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
            placeholder="Adicione observações sobre o medicamento..."
            className="w-full px-4 py-3 rounded-xl border border-[#8B7355]/20 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm resize-none"
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
            className="flex-1 py-3 rounded-2xl bg-[#8B7355] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
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
