'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo className="w-40 h-auto" />
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10">
          <div className="text-center py-8">
            <p className="text-[#141414]/70 font-['Nunito'] mb-4">
              Funcionalidade em desenvolvimento
            </p>
            <Link
              href="/login"
              className="text-[#5F7C50] hover:text-[#5F7C50]/80 font-medium transition-colors font-['Nunito']"
            >
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
