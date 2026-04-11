'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { createPet } from '@/app/auth/actions';
import { Logo } from '@/components/Logo';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AnimalSelect } from '@/components/AnimalSelect';

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [showOtherSelect, setShowOtherSelect] = useState(false);

  // Haptic feedback function
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.set('name', petName);
    formData.set('species', species);

    startTransition(async () => {
      const result = await createPet(formData);
      if (result?.error) {
        setErrors({ [result.field]: result.error });
      } else if (result?.success) {
        // TODO: Avançar para próxima etapa ou redirecionar
        console.log('Pet cadastrado com sucesso!');
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col">
      {/* Header fixo */}
      <header className="bg-[#F4F7F6] border-b border-[#5F7C50]/10 px-8 lg:px-24 xl:px-32 py-4">
        {/* Mobile: Logo centralizada */}
        <div className="flex justify-center md:hidden">
          <Logo className="w-32 h-auto" />
        </div>

        {/* Desktop: Layout completo */}
        <div className="hidden md:flex items-center justify-between">
          <Logo className="w-32 h-auto" />

          <div className="flex items-center gap-6">
            {/* Placeholders de botões */}
            <button className="px-4 py-2 text-sm text-[#141414]/60 hover:text-[#141414] transition-colors font-sans">
              Ajuda
            </button>
            <button className="px-4 py-2 text-sm text-[#141414]/60 hover:text-[#141414] transition-colors font-sans">
              Configurações
            </button>

            {/* Divisória */}
            <div className="w-px h-8 bg-[#5F7C50]/20" />

            {/* Área de perfil */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5F7C50] flex items-center justify-center text-white font-display text-sm">
                US
              </div>
              <span className="text-sm font-medium text-[#141414] font-sans">
                Usuário
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex items-start justify-center px-8 lg:px-16 py-10">
        <div className="w-full max-w-5xl">
          {/* Barra de progresso */}
          <motion.div
            className="mb-9"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-[#5F7C50] font-sans">
                Etapa {step} de 3
              </span>
              <span className="text-xs text-[#141414]/60 font-sans">
                33% completo
              </span>
            </div>
            <div className="h-2.5 bg-[#5F7C50]/10 rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{
                  background: 'linear-gradient(to right, #4F6D45, #A6B89E)',
                }}
                initial={{ width: 0 }}
                animate={{ width: '33%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Badge e Título */}
          <motion.div
            className="mb-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A6B89E]/20 mb-3">
              <span className="text-xs font-medium text-[#4F6D45] font-sans">
                Novo Companheiro 🐾
              </span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#5F7C50] mb-2.5 font-display">
              Vamos conhecer seu primeiro companheiro!
            </h1>
            <p className="text-sm text-[#141414]/70 font-sans">
              Fale um pouco sobre o pet que você vai cuidar.
            </p>
          </motion.div>

          {/* Formulário */}
          <form id="pet-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Layout tipo ID/Passaporte - Mobile: vertical, Desktop: horizontal */}
            <motion.div
              className="flex flex-col lg:flex-row gap-6 items-center lg:items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Foto do Pet - Centralizada no mobile, tamanho fixo */}
              <div className="flex-shrink-0">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-2xl bg-[#6C4726]/10 border-2 border-dashed border-[#6C4726]/40 flex flex-col items-center justify-center gap-2.5 hover:bg-[#6C4726]/20 hover:border-[#6C4726]/60 transition-all duration-200 group min-h-[128px] md:min-h-[160px] lg:min-h-[176px]"
                >
                  <svg className="w-10 h-10 md:w-11 md:h-11 text-[#6C4726]/60 group-hover:text-[#6C4726] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-[#6C4726]/60 group-hover:text-[#6C4726] font-sans">
                    Adicionar foto
                  </span>
                </motion.button>
              </div>

              {/* Informações do Pet - Largura total no mobile */}
              <div className="w-full flex-1 space-y-5">
                {/* Nome do Pet */}
                <div>
                  <label htmlFor="petName" className="block text-sm font-medium text-[#141414] mb-2 font-sans">
                    Nome do pet
                  </label>
                  <input
                    type="text"
                    id="petName"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    disabled={isPending}
                    className={`w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border-2 transition-all duration-200 text-sm ${
                      errors.name
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#5F7C50]/20 focus:border-[#5F7C50]'
                    } focus:outline-none focus:ring-4 focus:ring-[#5F7C50]/10 text-[#141414] font-sans disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Ex: Rex, Mimi, Bob..."
                  />
                  {errors.name && (
                    <p className="mt-2 text-xs text-red-500 font-sans">{errors.name}</p>
                  )}
                </div>

                {/* Espécie */}
                <div>
                  <label className="block text-sm font-medium text-[#141414] mb-2.5 font-sans">
                    Espécie
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Cão */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSpecies('dog');
                        setShowOtherSelect(false);
                        triggerHaptic();
                      }}
                      className={`p-2.5 md:p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 md:gap-2 min-h-[80px] md:min-h-[90px] ${
                        species === 'dog'
                          ? 'border-[#5F7C50] bg-[#5F7C50]/5 shadow-md'
                          : 'border-[#5F7C50]/20 bg-white hover:border-[#5F7C50]/40 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center ${
                        species === 'dog' ? 'bg-[#5F7C50]' : 'bg-[#EBF2B6]'
                      }`}>
                        <span className="text-lg md:text-xl">🐕</span>
                      </div>
                      <span className={`text-xs font-medium font-sans ${
                        species === 'dog' ? 'text-[#5F7C50]' : 'text-[#141414]'
                      }`}>
                        Cão
                      </span>
                    </motion.button>

                    {/* Gato */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSpecies('cat');
                        setShowOtherSelect(false);
                        triggerHaptic();
                      }}
                      className={`p-2.5 md:p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 md:gap-2 min-h-[80px] md:min-h-[90px] ${
                        species === 'cat'
                          ? 'border-[#6C4726] bg-[#6C4726]/5 shadow-md'
                          : 'border-[#5F7C50]/20 bg-white hover:border-[#6C4726]/40 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center ${
                        species === 'cat' ? 'bg-[#6C4726]' : 'bg-[#EBF2B6]'
                      }`}>
                        <span className="text-lg md:text-xl">🐈</span>
                      </div>
                      <span className={`text-xs font-medium font-sans ${
                        species === 'cat' ? 'text-[#6C4726]' : 'text-[#141414]'
                      }`}>
                        Gato
                      </span>
                    </motion.button>

                    {/* Outro */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowOtherSelect(true);
                        if (species === 'dog' || species === 'cat') {
                          setSpecies('');
                        }
                        triggerHaptic();
                      }}
                      className={`p-2.5 md:p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1.5 md:gap-2 min-h-[80px] md:min-h-[90px] ${
                        showOtherSelect
                          ? 'border-[#EBF2B6] bg-[#EBF2B6]/20 shadow-md'
                          : 'border-[#5F7C50]/20 bg-white hover:border-[#EBF2B6] hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center ${
                        showOtherSelect ? 'bg-[#EBF2B6]' : 'bg-[#EBF2B6]/30'
                      }`}>
                        <span className="text-lg md:text-xl">🐾</span>
                      </div>
                      <span className={`text-xs font-medium font-sans ${
                        showOtherSelect ? 'text-[#6C4726]' : 'text-[#141414]'
                      }`}>
                        Outro
                      </span>
                    </motion.button>
                  </div>

                  {/* Dropdown de outros animais */}
                  {showOtherSelect && (
                    <motion.div
                      className="mt-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimalSelect
                        value={species}
                        onChange={(value) => {
                          setSpecies(value);
                          triggerHaptic();
                        }}
                        error={errors.species}
                        disabled={isPending}
                      />
                    </motion.div>
                  )}

                  {!showOtherSelect && errors.species && (
                    <p className="mt-2 text-xs text-red-500 font-sans">{errors.species}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Erro geral */}
            {errors.general && (
              <motion.div
                className="p-3 rounded-2xl bg-red-50 border border-red-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-red-600 font-sans">{errors.general}</p>
              </motion.div>
            )}
          </form>

          {/* Linha divisória e botão continuar */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="border-t-2 border-[#5F7C50]/10 mb-4"></div>
            <div className="flex justify-center md:justify-end">
              <motion.button
                type="submit"
                form="pet-form"
                disabled={isPending || !petName || !species}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto px-6 py-3 min-h-[48px] rounded-2xl bg-[#5F7C50] text-white text-sm font-medium hover:bg-[#5F7C50]/90 focus:outline-none focus:ring-4 focus:ring-[#5F7C50]/20 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-4 px-8 lg:px-16 flex justify-center" style={{ marginBottom: 'calc(var(--spacing) * 30)' }}>
        <div className="w-full max-w-6xl">
          <div className="border-t border-[#5F7C50]/5 pt-4">
            <p className="text-center text-xs text-[#141414]/50 font-sans">
              © 2026 Mimu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
