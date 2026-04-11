'use client';

import { signOut } from '@/app/auth/actions';
import { useTransition } from 'react';

export default function DashboardPage() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6]">
      <nav className="bg-white border-b border-[#5F7C50]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-[#5F7C50] font-['Cocogoose']">
              Mimu
            </h1>
            <button
              onClick={handleSignOut}
              disabled={isPending}
              className="px-4 py-2 rounded-3xl bg-[#5F7C50] text-white font-medium hover:bg-[#5F7C50]/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-['Nunito']"
            >
              {isPending ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-md p-8 border border-[#5F7C50]/10">
          <h2 className="text-3xl font-bold text-[#5F7C50] mb-4 font-['Cocogoose']">
            Bem-vindo ao Mimu!
          </h2>
          <p className="text-[#141414]/70 font-['Nunito'] text-lg">
            Seu dashboard está pronto. Aqui você poderá gerenciar todos os cuidados do seu pet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#EBF2B6] rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🐾</span>
            </div>
            <h3 className="text-xl font-bold text-[#5F7C50] mb-2 font-['Cocogoose']">
              Meus Pets
            </h3>
            <p className="text-[#141414]/70 font-['Nunito']">
              Gerencie o perfil dos seus pets
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#EBF2B6] rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-[#5F7C50] mb-2 font-['Cocogoose']">
              Agenda
            </h3>
            <p className="text-[#141414]/70 font-['Nunito']">
              Consultas e compromissos
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#EBF2B6] rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">💊</span>
            </div>
            <h3 className="text-xl font-bold text-[#5F7C50] mb-2 font-['Cocogoose']">
              Saúde
            </h3>
            <p className="text-[#141414]/70 font-['Nunito']">
              Vacinas e medicamentos
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
