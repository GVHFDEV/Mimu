'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from '@/constants/activityCatalog';

interface ActivityPreviewModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function ActivityPreviewModal({
  activity,
  isOpen,
  onClose,
  onStart,
}: ActivityPreviewModalProps) {
  if (!activity) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
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

              {/* Activity Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5F7C50]/10 to-[#A6B89E]/10 flex items-center justify-center text-4xl">
                  {activity.icon}
                </div>
              </div>

              {/* Activity Title */}
              <h2 className="text-2xl font-bold text-[#5F7C50] font-display text-center mb-2">
                {activity.title}
              </h2>

              {/* Duration */}
              {activity.duration && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <svg className="w-4 h-4 text-[#5F7C50]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-[#1A1A1A]/60 font-sans">{activity.duration}</span>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#5F7C50] font-sans mb-2">Instruções</h3>
                <p className="text-sm text-[#1A1A1A]/70 font-sans leading-relaxed">
                  {activity.description}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border-2 border-[#5F7C50]/20 text-[#5F7C50] font-medium hover:bg-[#5F7C50]/5 transition-colors font-sans text-sm"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onStart}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#5F7C50] to-[#5F7C50]/90 text-white font-medium hover:shadow-xl transition-all duration-200 shadow-lg font-sans text-sm"
                >
                  Iniciar Atividade
                </motion.button>
              </div>
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
              {/* Close button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#5F7C50] font-display">Prévia da Atividade</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-[#5F7C50]/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-[#5F7C50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Activity Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5F7C50]/10 to-[#A6B89E]/10 flex items-center justify-center text-5xl">
                  {activity.icon}
                </div>
              </div>

              {/* Activity Title */}
              <h3 className="text-2xl font-bold text-[#5F7C50] font-display text-center mb-3">
                {activity.title}
              </h3>

              {/* Duration */}
              {activity.duration && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-[#5F7C50]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-base text-[#1A1A1A]/60 font-sans">{activity.duration}</span>
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-[#5F7C50] font-sans mb-3">Instruções</h4>
                <p className="text-base text-[#1A1A1A]/70 font-sans leading-relaxed">
                  {activity.description}
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onStart}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#5F7C50] to-[#5F7C50]/90 text-white font-medium hover:shadow-xl transition-all duration-200 shadow-lg font-sans text-sm"
                >
                  Iniciar Atividade
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl border-2 border-[#5F7C50]/20 text-[#5F7C50] font-medium hover:bg-[#5F7C50]/5 transition-colors font-sans text-sm"
                >
                  Cancelar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
