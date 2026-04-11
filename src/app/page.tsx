import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl md:text-7xl font-bold text-[#5F7C50] mb-6 font-['Cocogoose']">
          Mimu
        </h1>
        <p className="text-xl md:text-2xl text-[#141414]/70 mb-8 font-['Nunito']">
          Cuidado premium para quem você mais ama
        </p>
        <p className="text-lg text-[#141414]/60 mb-12 font-['Nunito']">
          Gerencie a saúde, agenda e bem-estar do seu pet em um só lugar
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-3xl bg-[#5F7C50] text-white font-medium hover:bg-[#5F7C50]/90 transition-all duration-200 shadow-md hover:shadow-lg font-['Nunito']"
          >
            Criar conta gratuita
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-3xl bg-white text-[#5F7C50] font-medium hover:bg-[#F4F7F6] transition-all duration-200 shadow-md hover:shadow-lg border border-[#5F7C50]/20 font-['Nunito']"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10">
            <div className="text-4xl mb-4">🐾</div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-['Cocogoose']">
              Perfil Completo
            </h3>
            <p className="text-[#141414]/70 font-['Nunito']">
              Registre todos os dados importantes do seu pet
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-['Cocogoose']">
              Agenda Inteligente
            </h3>
            <p className="text-[#141414]/70 font-['Nunito']">
              Nunca perca consultas ou vacinas
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 border border-[#5F7C50]/10">
            <div className="text-4xl mb-4">💊</div>
            <h3 className="text-lg font-bold text-[#5F7C50] mb-2 font-['Cocogoose']">
              Histórico Médico
            </h3>
            <p className="text-[#141414]/70 font-['Nunito']">
              Mantenha tudo organizado e acessível
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
