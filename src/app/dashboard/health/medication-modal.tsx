'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteMedication, updateMedication } from './medication-actions';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Medication {
  id: string;
  pet_id: string;
  owner_id: string;
  name: string;
  dose: string;
  frequency: string;
  is_continuous: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export function MedicationModal({
  medication,
  onClose,
}: {
  medication: Medication | null;
  onClose: () => void;
}) {
  if (!medication) return null;

  return (
    <AnimatePresence>
      {medication && (
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

              <MedicationModalContent medication={medication} onClose={onClose} />
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
              <MedicationModalContent medication={medication} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MedicationModalContent({
  medication,
  onClose,
}: {
  medication: Medication;
  onClose: () => void;
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
    const result = await deleteMedication(medication.id);
    if (result.success) {
      onClose();
    } else {
      alert('Erro ao excluir medicamento');
      setIsDeleting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('pet_id', medication.pet_id);

    startTransition(async () => {
      const result = await updateMedication(medication.id, formData);
      if (result.success) {
        setIsEditing(false);
        onClose();
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
          Excluir Medicamento?
        </h3>
        <p className="text-sm text-[#1A1A1A]/70 font-sans text-center mb-8 max-w-sm">
          Tem certeza que deseja excluir <span className="font-semibold text-[#C85A54]">{medication.name}</span>? Esta ação não pode ser desfeita.
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#8B7355] mb-2 font-display">
              Editar Medicamento
            </h2>
            <p className="text-sm text-[#1A1A1A]/70 font-sans">
              💊 Medicação
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

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Nome do Medicamento *
          </label>
          <input
            type="text"
            name="name"
            required
            disabled={isPending}
            defaultValue={medication.name}
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
          />
        </div>

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
              defaultValue={medication.dose_value}
              placeholder="Ex: 1, 5, 10"
              className="flex-1 px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
            <select
              name="dose_unit"
              required
              disabled={isPending}
              defaultValue={medication.dose_unit}
              className="w-32 px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px] bg-white"
            >
              <option value="comprimido">comprimido</option>
              <option value="ml">ml</option>
              <option value="gota">gota</option>
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="cápsula">cápsula</option>
            </select>
          </div>
        </div>

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
              defaultValue={medication.frequency_value}
              placeholder="Ex: 8, 12, 24"
              className="flex-1 px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
            <select
              name="frequency_unit"
              required
              disabled={isPending}
              defaultValue={medication.frequency_unit}
              className="w-28 px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px] bg-white"
            >
              <option value="hora">hora(s)</option>
              <option value="dia">dia(s)</option>
              <option value="semana">semana(s)</option>
              <option value="mês">mês(es)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Data de Início *
          </label>
          <input
            type="date"
            name="start_date"
            required
            disabled={isPending}
            defaultValue={medication.start_date}
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_continuous"
              value="true"
              disabled={isPending}
              defaultChecked={medication.is_continuous}
              className="w-5 h-5 rounded border-[#5F7C50]/20 text-[#5F7C50] focus:ring-2 focus:ring-[#5F7C50]/20"
            />
            <span className="text-sm font-medium text-[#1A1A1A] font-sans">
              Uso Contínuo
            </span>
          </label>
        </div>

        {!medication.is_continuous && (
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
              Data de Término
            </label>
            <input
              type="date"
              name="end_date"
              disabled={isPending}
              defaultValue={medication.end_date || ''}
              className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm min-h-[44px]"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Observações
          </label>
          <textarea
            name="notes"
            disabled={isPending}
            rows={3}
            defaultValue={medication.notes || ''}
            className="w-full px-4 py-3 rounded-xl border border-[#5F7C50]/20 focus:outline-none focus:ring-2 focus:ring-[#5F7C50]/20 font-sans text-sm resize-none"
          />
        </div>

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
            className="flex-1 py-3 rounded-2xl bg-[#8B7355] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
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
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-400/20 flex items-center justify-center text-3xl">
          💊
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

      <h2 className="text-2xl font-bold text-[#8B7355] mb-2 font-display">
        {medication.name}
      </h2>
      <p className="text-sm text-[#1A1A1A]/70 font-sans mb-6">
        {medication.dose_value} {medication.dose_unit} • A cada {medication.frequency_value} {medication.frequency_unit}
      </p>

      <div className="space-y-4">
        <div className="bg-[#F5F5F0] rounded-2xl p-4">
          <p className="text-xs text-[#1A1A1A]/50 font-sans mb-1">Data de Início</p>
          <p className="text-sm font-semibold text-[#8B7355] font-sans">
            {formatDateLong(medication.start_date)}
          </p>
        </div>

        {medication.is_continuous ? (
          <div className="bg-[#8B7355]/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-[#8B7355] font-sans">
              ♾️ Uso Contínuo
            </p>
          </div>
        ) : medication.end_date && (
          <div className="bg-[#F5F5F0] rounded-2xl p-4">
            <p className="text-xs text-[#1A1A1A]/50 font-sans mb-1">Data de Término</p>
            <p className="text-sm font-semibold text-[#8B7355] font-sans">
              {formatDateLong(medication.end_date)}
            </p>
          </div>
        )}

        {medication.notes && (
          <div className="bg-[#F5F5F0] rounded-2xl p-4">
            <p className="text-xs text-[#1A1A1A]/50 font-sans mb-1">Observações</p>
            <p className="text-sm text-[#1A1A1A]/70 font-sans">
              {medication.notes}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          className="flex-1 py-3 rounded-2xl bg-[#8B7355] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow"
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
