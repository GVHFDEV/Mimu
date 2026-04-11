'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo className="w-40 h-auto" />
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-[#141414] mb-3 font-display">
              Erro na verificação
            </h2>

            <p className="text-[#141414]/70 font-sans mb-6">
              Não foi possível verificar seu e-mail. O link pode ter expirado ou já foi usado.
            </p>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full py-3 px-6 rounded-3xl bg-[#5F7C50] text-white font-medium hover:bg-[#5F7C50]/90 transition-all duration-200 shadow-md hover:shadow-lg font-sans"
              >
                Criar nova conta
              </Link>
              <Link
                href="/login"
                className="block w-full py-3 px-6 rounded-3xl bg-white text-[#5F7C50] font-medium hover:bg-[#F4F7F6] transition-all duration-200 border border-[#5F7C50]/20 font-sans"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
