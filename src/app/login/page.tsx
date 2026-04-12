'use client';

import { useState, useTransition, useEffect } from 'react';
import { motion } from 'framer-motion';
import { login, signInWithGoogle } from '@/app/auth/actions';
import { Logo } from '@/components/Logo';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);

  // Haptic feedback
  const triggerHaptic = (duration = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  };

  // Shake animation on error
  useEffect(() => {
    if (errors.general || errors.email || errors.password) {
      setShake(true);
      triggerHaptic(50); // Alert vibration
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  async function handleSubmit(formData: FormData) {
    setErrors({});
    triggerHaptic();

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setErrors({ [result.field]: result.error });
      }
    });
  }

  async function handleGoogleSignIn() {
    triggerHaptic();
    const result = await signInWithGoogle();
    if (result?.error) {
      setErrors({ general: result.error });
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10 flex flex-col">
      {/* Header */}
      <header className="bg-[#F5F5F0]/80 backdrop-blur-sm border-b border-[#4F6D45]/10 px-8 lg:px-24 xl:px-32 py-4 sticky top-0 z-50">
        <div className="flex justify-center md:justify-start">
          <Logo className="w-32 h-auto" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 lg:px-16 py-10">
        <div className="w-full max-w-5xl">
          <motion.div
            className="max-w-md mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Title */}
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <h1 className="text-3xl md:text-4xl font-bold text-[#4F6D45] mb-3 font-display">
                Bem-vindo de volta!
              </h1>
              <p className="text-sm md:text-base text-[#1A1A1A]/70 font-sans">
                Entre para continuar cuidando do seu companheiro
              </p>
            </motion.div>

            {/* Login Card */}
            <motion.div
              className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-[#4F6D45]/10"
              variants={itemVariants}
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <form action={handleSubmit} className="space-y-5">
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans"
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={isPending}
                    className={`w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border-2 transition-all duration-200 text-sm shadow-sm ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#4F6D45]/20 focus:border-[#4F6D45] hover:border-[#4F6D45]/30'
                    } focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/10 text-[#1A1A1A] font-sans disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#1A1A1A]/40`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <motion.p
                      className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans"
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    disabled={isPending}
                    className={`w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border-2 transition-all duration-200 text-sm shadow-sm ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#4F6D45]/20 focus:border-[#4F6D45] hover:border-[#4F6D45]/30'
                    } focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/10 text-[#1A1A1A] font-sans disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#1A1A1A]/40`}
                    placeholder="Sua senha"
                  />
                  {errors.password && (
                    <motion.p
                      className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {errors.general && (
                  <motion.div
                    className="p-3 rounded-2xl bg-red-50 border border-red-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-xs text-red-600 font-sans flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.general}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  variants={itemVariants}
                  className="w-full py-3 px-6 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#4F6D45] to-[#A6B89E] text-white font-medium hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/20 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    'Entrar'
                  )}
                </motion.button>
              </form>

            </motion.div>

            {/* Sign up link */}
            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <p className="text-sm text-[#1A1A1A]/70 font-sans">
                Ainda não tem uma conta?{' '}
                <Link
                  href="/signup"
                  className="text-[#4F6D45] hover:text-[#4F6D45]/80 font-medium transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div className="relative my-6" variants={itemVariants}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#4F6D45]/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#F5F5F0] px-4 text-[#1A1A1A]/50 font-sans">ou</span>
              </div>
            </motion.div>

            {/* Google Login Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              variants={itemVariants}
              className="w-full py-3 px-6 min-h-[48px] rounded-2xl bg-white text-[#1A1A1A] font-medium hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/20 transition-all duration-200 shadow-md hover:shadow-lg border border-[#4F6D45]/10 font-sans flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </motion.button>

            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <Link
                href="/forgot-password"
                className="text-sm text-[#1A1A1A]/50 hover:text-[#1A1A1A]/70 transition-colors font-sans"
              >
                Esqueci minha senha
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-4 px-8 lg:px-16 flex justify-center pb-8">
        <div className="w-full max-w-6xl">
          <div className="border-t border-[#4F6D45]/5 pt-6">
            <p className="text-center text-xs text-[#1A1A1A]/40 font-sans">
              © 2026 Mimu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
