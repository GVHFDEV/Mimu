'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateLocation } from './actions';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
  const [stage, setStage] = useState<'location' | 'friends'>('location');
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [friendEmails, setFriendEmails] = useState<string[]>(['']);

  const handleLocationSubmit = (formData: FormData) => {
    setErrors({});
    startTransition(async () => {
      const result = await updateLocation(formData);
      if (result.success) {
        setStage('friends');
      } else {
        setErrors({ [result.field]: result.error });
      }
    });
  };

  const handleAddFriendField = () => {
    setFriendEmails([...friendEmails, '']);
  };

  const handleRemoveFriendField = (index: number) => {
    if (friendEmails.length > 1) {
      const newEmails = [...friendEmails];
      newEmails.splice(index, 1);
      setFriendEmails(newEmails);
    }
  };

  const handleFriendInputChange = (index: number, value: string) => {
    const newEmails = [...friendEmails];
    newEmails[index] = value;
    setFriendEmails(newEmails);
  };

  const handleSkipLocation = () => {
    setStage('friends');
  };

  const handleSkipFriends = () => {
    onComplete();
  };

  const handleComplete = () => {
    onComplete();
  };

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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Mobile: Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, duration: 0.4 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="p-6"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-[#1A1A1A]/20 rounded-full mx-auto mb-6" />

              {stage === 'location' ? (
                <LocationStage
                  isPending={isPending}
                  errors={errors}
                  onSubmit={handleLocationSubmit}
                  onSkip={handleSkipLocation}
                />
              ) : (
                <FriendsStage
                  friendEmails={friendEmails}
                  onAddFriend={handleAddFriendField}
                  onRemoveFriend={handleRemoveFriendField}
                  onFriendChange={handleFriendInputChange}
                  isPending={isPending}
                  onSkip={handleSkipFriends}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Desktop: Centered Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.4 }}
            className="hidden md:block fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-y-auto max-h-[90vh]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="p-8"
            >
              {stage === 'location' ? (
                <LocationStage
                  isPending={isPending}
                  errors={errors}
                  onSubmit={handleLocationSubmit}
                  onSkip={handleSkipLocation}
                />
              ) : (
                <FriendsStage
                  friendEmails={friendEmails}
                  onAddFriend={handleAddFriendField}
                  onRemoveFriend={handleRemoveFriendField}
                  onFriendChange={handleFriendInputChange}
                  isPending={isPending}
                  onSkip={handleSkipFriends}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LocationStage({
  isPending,
  errors,
  onSubmit,
  onSkip
}: {
  isPending: boolean;
  errors: Record<string, string>;
  onSubmit: (formData: FormData) => void;
  onSkip: () => void;
}) {
  const [locationValue, setLocationValue] = useState('');

  const handleLocationSelect = (location: { formatted: string; lat: number; lon: number }) => {
    setLocationValue(location.formatted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 bg-gradient-to-br from-[#5F7C50]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-3xl">📍</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-[#5F7C50] mb-2 font-display"
        >
          Onde você mora?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-[#1A1A1A]/70 font-sans"
        >
          Vamos encontrar amigos pet-lovers por perto!
        </motion.p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans">
            Localização
          </label>
          <LocationAutocomplete
            onSelect={handleLocationSelect}
            placeholder="Digite sua cidade ou endereço..."
          />
          {errors.location && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs mt-1 font-sans"
            >
              {errors.location}
            </motion.p>
          )}
        </div>

        <motion.div
          className="flex gap-3 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            type="button"
            onClick={onSkip}
            disabled={isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-2xl bg-[#F5F5F0] text-[#1A1A1A] font-medium font-sans hover:bg-[#5F7C50]/10 transition-colors disabled:opacity-50"
          >
            Pular por enquanto
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              // Just enable the button for consistency but selection already submits
              // Create a FormData object with the selected location
              const formData = new FormData();
              formData.append('location', locationValue);

              // Submit the form only if there's a value and not already submitting
              if (locationValue.trim() && !isPending) {
                onSubmit(formData);
              }
            }}
            disabled={isPending || !locationValue.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-2xl bg-[#5F7C50] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <LoadingSpinner />
                <span>Salvando...</span>
              </>
            ) : (
              'Continuar'
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FriendsStage({
  friendEmails,
  onAddFriend,
  onRemoveFriend,
  onFriendChange,
  isPending,
  onSkip,
  onComplete
}: {
  friendEmails: string[];
  onAddFriend: () => void;
  onRemoveFriend: (index: number) => void;
  onFriendChange: (index: number, value: string) => void;
  isPending: boolean;
  onSkip: () => void;
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 bg-gradient-to-br from-[#8B7355]/20 to-[#A6B89E]/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-3xl">👥</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-[#8B7355] mb-2 font-display"
        >
          Convide seus amigos
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-[#1A1A1A]/70 font-sans"
        >
          Compartilhe a experiência com quem ama pets
        </motion.p>
      </div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-[#1A1A1A]/70 font-sans mb-2"
        >
          Emails dos amigos:
        </motion.div>

        {friendEmails.map((email, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex gap-2"
          >
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => onFriendChange(index, e.target.value)}
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-xl border border-[#8B7355]/20 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 font-sans text-sm min-h-[44px]"
            />
            {friendEmails.length > 1 && (
              <motion.button
                type="button"
                onClick={() => onRemoveFriend(index)}
                disabled={isPending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-xl bg-[#F5F5F0] text-[#1A1A1A] flex items-center justify-center hover:bg-[#C85A54]/10 transition-colors disabled:opacity-50"
              >
                <span className="text-lg">✕</span>
              </motion.button>
            )}
          </motion.div>
        ))}

        <motion.button
          type="button"
          onClick={onAddFriend}
          disabled={isPending}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-2xl border border-dashed border-[#8B7355]/30 text-[#8B7355] font-medium font-sans hover:bg-[#8B7355]/5 transition-colors disabled:opacity-50"
        >
          + Adicionar outro amigo
        </motion.button>

        <motion.div
          className="flex gap-3 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            type="button"
            onClick={onSkip}
            disabled={isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-2xl bg-[#F5F5F0] text-[#1A1A1A] font-medium font-sans hover:bg-[#5F7C50]/10 transition-colors disabled:opacity-50"
          >
            Pular por enquanto
          </motion.button>
          <motion.button
            type="button"
            onClick={onComplete}
            disabled={isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-2xl bg-[#8B7355] text-white font-medium font-sans shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            Finalizar
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}