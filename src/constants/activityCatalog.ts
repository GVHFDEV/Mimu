// Interfaces para o catálogo de atividades
export interface WeightModifiers {
  species?: Record<string, number>;
  age_group?: Record<string, number>;
  energy_level?: Record<string, number>;
  temperament?: Record<string, number>;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  shift: ActivityShift;
  duration: string;
  allowed_species: string[];
  base_weight: number;
  weight_modifiers: WeightModifiers;
}

export type ActivityShift = 'morning' | 'afternoon' | 'night' | 'any';

// Catálogo de atividades para o motor de rotina dinâmica
// 100 atividades | Espécies: dog, cat, rabbit, hamster, bird, guineapig, ferret
export const activityCatalog: Activity[] = [

  // ─────────────────────────────────────────────
  // MANHÃ — 25 atividades
  // ─────────────────────────────────────────────

  {
    id: 'passeio_matinal',
    title: 'Passeio Matinal',
    description: 'Leve seu pet para um passeio ao ar livre logo pela manhã. Além do exercício físico, o contato com o ambiente externo estimula o olfato, a curiosidade e o bem-estar emocional. Varie os trajetos para enriquecer a experiência.',
    shift: 'morning',
    duration: '20 min',
    allowed_species: ['dog', 'cat', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, cat: 1.2, rabbit: 1.3 },
      age_group: { junior: 1.5, adult: 1.8, senior: 1.0 },
      energy_level: { high: 2.0, medium: 1.5, low: 0.6 },
      temperament: { energetic: 2.2, sociable: 1.4, anxious: 0.6, lazy: 0.5 }
    }
  },
  {
    id: 'alimentacao_manha',
    title: 'Alimentação da Manhã',
    description: 'Ofereça a refeição matinal no horário certo e na quantidade adequada para a espécie e porte. Observe o apetite, a velocidade de ingestão e se o pet deixa sobras — são indicadores importantes de saúde e bem-estar.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.2, rabbit: 1.4, hamster: 1.5, bird: 1.4, guineapig: 1.4, ferret: 1.3 },
      age_group: { junior: 1.5, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.2, medium: 1.0, low: 0.9 },
      temperament: { glutton: 1.8, lazy: 1.1, anxious: 0.8, energetic: 1.1 }
    }
  },
  {
    id: 'escovacao_pelo_manha',
    title: 'Escovação do Pelo',
    description: 'Escove o pelo do seu pet com a escova adequada para o tipo de pelagem. A escovação remove pelos mortos, previne nós, distribui os óleos naturais e é um ótimo momento de vínculo. Para raças de pelo longo, faça com mais frequência.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.5, rabbit: 1.6, guineapig: 1.4, ferret: 1.2 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.4 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.3 },
      temperament: { lazy: 1.5, sociable: 1.4, anxious: 0.7, calm: 1.6 }
    }
  },
  {
    id: 'treino_comandos_basicos',
    title: 'Treino de Comandos Básicos',
    description: 'Dedique alguns minutos ao treino de comandos como sentar, ficar, vir e deitar. Use petiscos de alta palatabilidade como reforço positivo. Sessões curtas e frequentes são mais eficazes do que longas e esporádicas.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, cat: 1.2, bird: 1.5, ferret: 1.4 },
      age_group: { junior: 2.0, adult: 1.4, senior: 0.8 },
      energy_level: { high: 1.5, medium: 1.2, low: 0.7 },
      temperament: { energetic: 1.6, sociable: 1.5, lazy: 0.5, anxious: 0.8 }
    }
  },
  {
    id: 'reposicao_agua_fresca',
    title: 'Reposição de Água Fresca',
    description: 'Troque a água do bebedouro por água fresca e limpa toda manhã. Limpe o recipiente antes de repor. Pets tendem a beber mais quando a água está fresca, o que previne problemas renais e urinários, especialmente em gatos e coelhos.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.5, rabbit: 1.4, hamster: 1.3, bird: 1.2, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.5 },
      energy_level: { high: 1.2, medium: 1.0, low: 1.1 },
      temperament: { energetic: 1.2, lazy: 1.1, glutton: 1.0, anxious: 1.0 }
    }
  },
  {
    id: 'limpeza_area_olhos',
    title: 'Limpeza da Área dos Olhos',
    description: 'Com algodão umedecido em soro fisiológico, remova suavemente as secreções ao redor dos olhos. Algumas raças produzem mais lágrimas que outras. Faça esse cuidado com gentileza para habituar o pet ao procedimento desde cedo.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.3, rabbit: 1.2, guineapig: 1.1 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.6 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.2 },
      temperament: { calm: 1.5, sociable: 1.2, anxious: 0.5, lazy: 1.3 }
    }
  },
  {
    id: 'banho_sol_supervisionado',
    title: 'Banho de Sol Supervisionado',
    description: 'Leve seu pet para tomar sol por alguns minutos, preferencialmente antes das 10h. A exposição solar auxilia na produção de vitamina D, regula o ritmo circadiano e melhora o humor. Evite superfícies quentes e ofereça sombra e água.',
    shift: 'morning',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig', 'bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.4, rabbit: 1.2, guineapig: 1.3, bird: 1.5 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.0, medium: 1.1, low: 1.3 },
      temperament: { lazy: 1.6, calm: 1.5, sociable: 1.1, anxious: 0.7 }
    }
  },
  {
    id: 'exercicio_roda_hamster',
    title: 'Exercício na Roda',
    description: 'Verifique se a roda de exercícios está funcionando corretamente e livre de obstáculos. Hamsters e porquinhos-da-índia precisam correr bastante para gastar energia — uma roda de tamanho adequado é essencial para a saúde física e mental deles.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['hamster', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { hamster: 2.0, guineapig: 1.5 },
      age_group: { junior: 2.0, adult: 1.5, senior: 0.8 },
      energy_level: { high: 2.2, medium: 1.4, low: 0.6 },
      temperament: { energetic: 2.0, playful: 1.8, lazy: 0.4, anxious: 0.9 }
    }
  },
  {
    id: 'treino_vocal_passaro',
    title: 'Treino Vocal com o Pássaro',
    description: 'Reserve um tempo para repetir palavras ou sons que você quer que seu pássaro aprenda. Use voz clara, repita com paciência e recompense com petiscos ao menor progresso. A manhã é o momento em que a maioria das aves está mais receptiva e vocal.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { bird: 2.5 },
      age_group: { junior: 2.0, adult: 1.5, senior: 1.0 },
      energy_level: { high: 1.5, medium: 1.2, low: 0.8 },
      temperament: { sociable: 2.0, playful: 1.8, energetic: 1.4, anxious: 0.6 }
    }
  },
  {
    id: 'escovacao_dental',
    title: 'Escovação Dental',
    description: 'Escove os dentes do seu pet com escova e pasta dental específica para animais (nunca use pasta humana). Introduza o hábito gradualmente, começando com o dedo ou dedeira. A higiene bucal previne tártaro, gengivite e doenças sistêmicas.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.3, rabbit: 1.2, ferret: 1.3, guineapig: 1.1 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.7 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.2 },
      temperament: { calm: 1.5, sociable: 1.3, anxious: 0.4, lazy: 1.2 }
    }
  },
  {
    id: 'verificacao_unhas',
    title: 'Verificação das Unhas',
    description: 'Observe o comprimento e a condição das unhas do seu pet. Unhas muito longas causam dor ao caminhar e podem se encravar. Verifique se há rachaduras ou coloração anormal. Agende o corte quando necessário — não espere as unhas baterem no chão.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.4, hamster: 1.5, bird: 1.6, guineapig: 1.4, ferret: 1.2 },
      age_group: { junior: 0.9, adult: 1.0, senior: 1.4 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.3 },
      temperament: { calm: 1.5, lazy: 1.3, anxious: 0.5, sociable: 1.2 }
    }
  },
  {
    id: 'passeio_farejamento',
    title: 'Passeio de Farejamento',
    description: 'Em vez de um passeio rápido, permita que seu pet explore livremente pelo olfato, sem pressa. Cães e furões têm um faro extremamente desenvolvido — farejar é mentalmente exaustivo e muito satisfatório para eles. Deixe-os guiar o ritmo.',
    shift: 'morning',
    duration: '20 min',
    allowed_species: ['dog', 'rabbit', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, rabbit: 1.3, ferret: 1.6 },
      age_group: { junior: 1.6, adult: 1.5, senior: 1.2 },
      energy_level: { high: 1.4, medium: 1.5, low: 1.2 },
      temperament: { energetic: 1.6, playful: 1.5, sociable: 1.3, lazy: 0.8 }
    }
  },
  {
    id: 'limpeza_habitat_pequenos',
    title: 'Limpeza Parcial do Habitat',
    description: 'Remova fezes, restos de comida e substrato úmido do habitat do seu pet de pequeno porte. Troque o bebedouro e o comedouro por recipientes limpos. Manter o ambiente higienizado previne infecções e mantém o bem-estar do animal.',
    shift: 'morning',
    duration: '15 min',
    allowed_species: ['hamster', 'guineapig', 'bird', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { hamster: 1.8, guineapig: 1.7, bird: 1.6, rabbit: 1.4 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.1 },
      temperament: { anxious: 1.4, calm: 1.2, sociable: 1.0, lazy: 1.1 }
    }
  },
  {
    id: 'alongamento_felino_canino',
    title: 'Sessão de Alongamento',
    description: 'Estimule seu cão ou gato a se alongar com movimentos gentis. Para cães, use petiscos para guiá-los em posições de alongamento suave. Gatos geralmente fazem isso naturalmente ao acordar — incentive com carinhos. Ótimo para saúde articular.',
    shift: 'morning',
    duration: '8 min',
    allowed_species: ['dog', 'cat'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.8 },
      age_group: { junior: 1.1, adult: 1.2, senior: 1.8 },
      energy_level: { high: 1.0, medium: 1.1, low: 1.5 },
      temperament: { lazy: 1.6, calm: 1.7, sociable: 1.2, anxious: 0.8 }
    }
  },
  {
    id: 'brincadeira_caca_simulada',
    title: 'Brincadeira de Caça Simulada',
    description: 'Use uma varinha com plumas, um brinquedo de corda ou um laser para simular uma presa em movimento. Mova o brinquedo de forma imprevisível para despertar o instinto predatório. Sempre encerre com o pet "capturando" o alvo para satisfação completa.',
    shift: 'morning',
    duration: '15 min',
    allowed_species: ['cat', 'ferret', 'bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { cat: 2.0, ferret: 1.8, bird: 1.4 },
      age_group: { junior: 2.0, adult: 1.6, senior: 0.9 },
      energy_level: { high: 2.0, medium: 1.5, low: 0.6 },
      temperament: { energetic: 2.0, playful: 2.2, lazy: 0.4, sociable: 1.3 }
    }
  },
  {
    id: 'forragear_feno',
    title: 'Forragear no Feno',
    description: 'Esconda pequenos petiscos dentro do feno para que seu coelho ou porquinho-da-índia encontre-os fuçando. Esse comportamento natural fortalece os dentes, estimula a mente e é essencial para a saúde digestiva. O feno deve estar disponível em abundância o dia todo.',
    shift: 'morning',
    duration: '15 min',
    allowed_species: ['rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { rabbit: 2.0, guineapig: 1.8 },
      age_group: { junior: 1.4, adult: 1.5, senior: 1.3 },
      energy_level: { high: 1.4, medium: 1.5, low: 1.2 },
      temperament: { playful: 1.6, energetic: 1.5, lazy: 1.1, glutton: 1.8 }
    }
  },
  {
    id: 'estimulacao_espelho_passaro',
    title: 'Estimulação com Espelho',
    description: 'Posicione um espelho pequeno dentro ou na grade da gaiola. Muitas aves adoram interagir com o reflexo, o que estimula a vocalização e a atividade. Observe a reação — se o pet ficar agitado ou agressivo, remova o espelho. Ofereça por períodos limitados.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { bird: 2.5 },
      age_group: { junior: 1.8, adult: 1.5, senior: 1.0 },
      energy_level: { high: 1.5, medium: 1.2, low: 0.9 },
      temperament: { sociable: 2.0, playful: 1.8, energetic: 1.4, anxious: 0.5 }
    }
  },
  {
    id: 'verificacao_orelhas',
    title: 'Verificação das Orelhas',
    description: 'Observe o interior das orelhas em busca de odor forte, secreção escura, vermelhidão ou coceira excessiva. Use um algodão seco para limpeza suave da parte externa — nunca introduza objetos no canal auditivo. Sinais suspeitos devem ser avaliados pelo veterinário.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.2, rabbit: 1.4, ferret: 1.3 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.5 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.2 },
      temperament: { calm: 1.5, sociable: 1.3, anxious: 0.4, lazy: 1.2 }
    }
  },
  {
    id: 'treino_agilidade_basico',
    title: 'Treino de Agilidade Básico',
    description: 'Monte um percurso simples com objetos domésticos (almofadas, caixas, bambolê no chão) e guie seu pet pelo trajeto com petiscos. Estimula coordenação, confiança e obediência. Comece com obstáculos baixos e aumente gradualmente conforme o pet avança.',
    shift: 'morning',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'ferret', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.5, ferret: 1.6, rabbit: 1.2 },
      age_group: { junior: 1.8, adult: 1.5, senior: 0.6 },
      energy_level: { high: 2.0, medium: 1.4, low: 0.4 },
      temperament: { energetic: 2.0, playful: 1.8, lazy: 0.3, sociable: 1.3 }
    }
  },
  {
    id: 'tempo_vinculo_manha',
    title: 'Tempo de Vínculo com o Tutor',
    description: 'Reserve alguns minutos exclusivos para estar com seu pet sem distrações — sem celular, sem TV. Carícias, conversa calma ou simplesmente estar perto fortalecem o vínculo afetivo, reduzem a ansiedade e aumentam a confiança do pet em você.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.3, rabbit: 1.2, hamster: 1.1, bird: 1.4, guineapig: 1.3, ferret: 1.4 },
      age_group: { junior: 1.4, adult: 1.0, senior: 1.5 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.4 },
      temperament: { sociable: 2.0, anxious: 1.5, calm: 1.6, lazy: 1.3 }
    }
  },
  {
    id: 'limpeza_comedouro_bebedouro',
    title: 'Limpeza de Comedouro e Bebedouro',
    description: 'Lave os recipientes de comida e água com detergente neutro e enxágue bem antes de servir as refeições. Biofilmes bacterianos se formam rapidamente, especialmente em bebedouros. Comedouros higienizados evitam contaminações e estimulam o apetite.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.2, rabbit: 1.3, hamster: 1.4, bird: 1.3, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.2 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.1 },
      temperament: { anxious: 1.2, glutton: 1.3, lazy: 1.0, calm: 1.1 }
    }
  },
  {
    id: 'checkup_pele_pelagem',
    title: 'Check-up de Pele e Pelagem',
    description: 'Passe os dedos pelo pelo do pet observando a textura, brilho e espessura. Procure nós, caspa, vermelhidão, lesões ou sinais de parasitas como pulgas e carrapatos. Uma pelagem opaca ou quebradiça pode indicar deficiência nutricional ou problemas de saúde.',
    shift: 'morning',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.4, hamster: 1.3, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.5 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.3 },
      temperament: { calm: 1.6, sociable: 1.3, anxious: 0.6, lazy: 1.4 }
    }
  },
  {
    id: 'pratica_truque_novo',
    title: 'Prática de Truque Novo',
    description: 'Escolha um novo truque para ensinar ao seu pet, como "rola", "pata" ou "busca". Divida em passos mínimos e recompense cada progresso. Sessões de 5–10 minutos são ideais. Animais que aprendem regularmente são mais equilibrados emocionalmente.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.3, bird: 1.6, ferret: 1.5 },
      age_group: { junior: 2.0, adult: 1.5, senior: 0.7 },
      energy_level: { high: 1.5, medium: 1.3, low: 0.6 },
      temperament: { playful: 1.8, energetic: 1.6, sociable: 1.4, lazy: 0.4 }
    }
  },
  {
    id: 'monitoramento_apetite',
    title: 'Monitoramento do Apetite',
    description: 'Observe se o pet comeu tudo, deixou sobras ou recusou a refeição. Registre qualquer alteração — tanto excesso quanto falta de apetite são sinais relevantes de saúde. Verifique também se o pet está bebendo água normalmente durante o dia.',
    shift: 'morning',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.2, rabbit: 1.5, hamster: 1.4, bird: 1.4, guineapig: 1.4, ferret: 1.3 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.6 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.4 },
      temperament: { glutton: 1.5, anxious: 1.3, lazy: 1.2, calm: 1.0 }
    }
  },
  {
    id: 'estimulacao_sensorial_manha',
    title: 'Estimulação Sensorial Matinal',
    description: 'Apresente ao seu pet novos objetos, texturas ou aromas seguros logo cedo. Para cães, use itens com diferentes texturas. Para pássaros, ofereça ramos, sementes ou brinquedos novos. Essa estimulação ativa o sistema nervoso e melhora o comportamento geral.',
    shift: 'morning',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.4, rabbit: 1.3, hamster: 1.5, bird: 1.5, guineapig: 1.3, ferret: 1.5 },
      age_group: { junior: 1.8, adult: 1.2, senior: 0.9 },
      energy_level: { high: 1.4, medium: 1.2, low: 0.8 },
      temperament: { playful: 1.7, energetic: 1.5, sociable: 1.3, anxious: 0.6 }
    }
  },


  // ─────────────────────────────────────────────
  // TARDE — 25 atividades
  // ─────────────────────────────────────────────

  {
    id: 'jogo_busca_aporte',
    title: 'Jogo de Busca e Aporte',
    description: 'Jogue uma bolinha, frisbee ou brinquedo e peça para o cão buscar e trazer de volta. É um exercício cardiovascular e cognitivo excelente, além de reforçar o vínculo. Comece em espaços fechados e evolua para o parque ou quintal conforme o pet aprende.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['dog'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.5 },
      age_group: { junior: 2.0, adult: 2.0, senior: 0.8 },
      energy_level: { high: 2.5, medium: 1.8, low: 0.5 },
      temperament: { energetic: 2.5, playful: 2.2, sociable: 1.5, lazy: 0.3 }
    }
  },
  {
    id: 'exploracao_tunel',
    title: 'Exploração de Túnel',
    description: 'Ofereça um túnel de brinquedo ou faça um com caixas de papelão. Furões e coelhos adoram entrar e sair de túneis — isso imita o comportamento natural de escavar e explorar tocas. Gatos também se encantam com a brincadeira. Esconda petiscos dentro para estimular.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['ferret', 'rabbit', 'hamster', 'guineapig', 'cat'],
    base_weight: 1,
    weight_modifiers: {
      species: { ferret: 2.2, rabbit: 1.8, hamster: 2.0, guineapig: 1.7, cat: 1.6 },
      age_group: { junior: 2.0, adult: 1.6, senior: 0.8 },
      energy_level: { high: 2.0, medium: 1.5, low: 0.6 },
      temperament: { playful: 2.2, energetic: 2.0, sociable: 1.3, lazy: 0.5 }
    }
  },
  {
    id: 'sessao_truques_avancados',
    title: 'Sessão de Truques Avançados',
    description: 'Pratique truques mais elaborados como girar, pular obstáculos, dar a pata ou aprender nomes de brinquedos. Use reforço positivo e encerre sempre com algo que o pet sabe bem, para terminar em vitória. Pássaros podem aprender a subir no dedo ou a falar frases.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.3, bird: 1.7, ferret: 1.6 },
      age_group: { junior: 1.6, adult: 1.8, senior: 0.7 },
      energy_level: { high: 1.5, medium: 1.4, low: 0.6 },
      temperament: { playful: 1.8, energetic: 1.6, sociable: 1.5, lazy: 0.3 }
    }
  },
  {
    id: 'atividade_aquatica',
    title: 'Atividade Aquática',
    description: 'Para cães que gostam de água, ofereça uma piscina inflável, mangueira ou banho ao ar livre. Alguns furões também apreciam nado raso. A atividade aquática é de baixo impacto articular e ótima para cães obesos, idosos ou em reabilitação. Nunca force o animal.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['dog', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, ferret: 1.4 },
      age_group: { junior: 1.6, adult: 1.8, senior: 1.2 },
      energy_level: { high: 2.0, medium: 1.5, low: 0.8 },
      temperament: { energetic: 2.0, playful: 1.8, sociable: 1.4, anxious: 0.4 }
    }
  },
  {
    id: 'puzzle_feeder',
    title: 'Alimentador Interativo (Puzzle Feeder)',
    description: 'Sirva parte da refeição ou petiscos dentro de um brinquedo interativo que exige esforço para liberar a comida. Isso desacelera a ingestão, estimula o raciocínio e combate o tédio. Diferentes níveis de dificuldade podem ser usados à medida que o pet evolui.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.6, bird: 1.5, ferret: 1.7, rabbit: 1.4 },
      age_group: { junior: 1.6, adult: 1.5, senior: 1.2 },
      energy_level: { high: 1.4, medium: 1.5, low: 1.2 },
      temperament: { playful: 1.8, glutton: 1.8, energetic: 1.5, lazy: 0.8 }
    }
  },
  {
    id: 'tempo_colo_afeto',
    title: 'Tempo de Colo e Afeto',
    description: 'Sente-se tranquilamente com seu pet no colo ou ao seu lado e ofereça carícias suaves nas regiões que ele prefere. Esse contato libera ocitocina em ambos, reduzindo o estresse e reforçando o laço. Respeite os limites do pet — nunca force o contato.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.4, rabbit: 1.3, guineapig: 1.5, ferret: 1.4 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.6 },
      energy_level: { high: 0.7, medium: 1.0, low: 1.6 },
      temperament: { sociable: 2.0, calm: 1.8, lazy: 1.6, anxious: 0.5 }
    }
  },
  {
    id: 'brincadeira_cordao_pluma',
    title: 'Brincadeira com Varinha e Plumas',
    description: 'Use uma varinha com plumas, fitas ou brinquedos presos na ponta e mova de forma errática, imitando o voo de um inseto ou pássaro. É uma das brincadeiras mais eficazes para gatos, furões e até pássaros. Varie velocidade e trajetória para manter o interesse.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['cat', 'ferret', 'bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { cat: 2.2, ferret: 2.0, bird: 1.4 },
      age_group: { junior: 2.2, adult: 1.8, senior: 0.8 },
      energy_level: { high: 2.2, medium: 1.6, low: 0.5 },
      temperament: { playful: 2.5, energetic: 2.2, sociable: 1.3, lazy: 0.3 }
    }
  },
  {
    id: 'exploracao_caixa_nova',
    title: 'Exploração de Caixa ou Saco Novo',
    description: 'Deixe uma caixa de papelão aberta ou um saco de papel no chão e observe seu pet explorar. Gatos adoram se esconder; coelhos e hamsters adoram morder e modelar o espaço; furões investigam tudo. Troque com frequência para manter a novidade.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['cat', 'rabbit', 'hamster', 'ferret', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { cat: 2.0, rabbit: 1.6, hamster: 1.8, ferret: 1.8, guineapig: 1.5 },
      age_group: { junior: 2.0, adult: 1.5, senior: 1.0 },
      energy_level: { high: 1.6, medium: 1.4, low: 1.0 },
      temperament: { playful: 1.8, energetic: 1.7, sociable: 1.2, anxious: 0.7 }
    }
  },
  {
    id: 'treino_recall',
    title: 'Treino de Recall (Vir ao Chamado)',
    description: 'Pratique o comando de recall — chamar o cão pelo nome e recompensá-lo generosamente quando vier até você. É um dos comandos mais importantes para a segurança. Comece em ambientes sem distração, avance para locais com estímulos externos gradualmente.',
    shift: 'afternoon',
    duration: '10 min',
    allowed_species: ['dog'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.5 },
      age_group: { junior: 2.5, adult: 1.8, senior: 1.0 },
      energy_level: { high: 1.5, medium: 1.5, low: 1.2 },
      temperament: { sociable: 2.0, energetic: 1.6, playful: 1.5, anxious: 0.7 }
    }
  },
  {
    id: 'tempo_livre_jardim',
    title: 'Tempo Livre no Jardim ou Varanda',
    description: 'Deixe seu pet explorar um espaço externo seguro e cercado. Coelhos, porquinhos-da-índia e gatos com acesso seguro se beneficiam muito de tomar ar fresco, pisar na grama e interagir com o ambiente natural. Supervisione sempre para garantir a segurança.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.6, rabbit: 1.8, guineapig: 1.7 },
      age_group: { junior: 1.6, adult: 1.4, senior: 1.2 },
      energy_level: { high: 1.5, medium: 1.4, low: 1.2 },
      temperament: { energetic: 1.6, playful: 1.5, sociable: 1.4, anxious: 0.7 }
    }
  },
  {
    id: 'jogo_esconder_petiscos',
    title: 'Jogo de Esconder Petiscos',
    description: 'Esconda petiscos em diferentes locais do cômodo ou do jardim e deixe seu pet encontrá-los usando o olfato. Para pássaros, enrole petiscos em papel. Para coelhos, esconda entre folhas de erva. Essa atividade é intensa mentalmente e satisfaz o instinto de forrageio.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'ferret', 'bird', 'rabbit', 'hamster', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.5, ferret: 1.8, bird: 1.4, rabbit: 1.6, hamster: 1.7, guineapig: 1.5 },
      age_group: { junior: 1.8, adult: 1.5, senior: 1.2 },
      energy_level: { high: 1.5, medium: 1.5, low: 1.2 },
      temperament: { playful: 1.8, glutton: 2.0, energetic: 1.6, lazy: 0.8 }
    }
  },
  {
    id: 'atividade_mastigacao',
    title: 'Atividade de Mastigação',
    description: 'Ofereça um petisco mastigável adequado à espécie: ossos naturais ou bifes de couro para cães, palitos de salgueiro para coelhos, vegetais crus para porquinhos-da-índia. Mastigar é uma necessidade fisiológica e comportamental que alivia tensão e cuida dos dentes.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['dog', 'rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, rabbit: 2.0, guineapig: 1.8 },
      age_group: { junior: 1.5, adult: 1.5, senior: 1.2 },
      energy_level: { high: 1.2, medium: 1.5, low: 1.5 },
      temperament: { glutton: 1.8, energetic: 1.3, lazy: 1.5, calm: 1.6 }
    }
  },
  {
    id: 'banho_completo',
    title: 'Banho Completo',
    description: 'Dê um banho completo usando shampoo adequado para a espécie e o tipo de pelo. Pré-aqueça a água, ensaboe bem e enxágue completamente. Seque bem para evitar fungos e resfriados. Para pássaros, use spray leve ou borrifador. Gatos raramente precisam de banho.',
    shift: 'afternoon',
    duration: '30 min',
    allowed_species: ['dog', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, ferret: 1.3 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.0 },
      temperament: { calm: 1.5, sociable: 1.3, anxious: 0.5, energetic: 0.8 }
    }
  },
  {
    id: 'corte_unhas',
    title: 'Corte de Unhas',
    description: 'Corte as unhas com alicate específico para a espécie, em local bem iluminado. Corte pequenas quantidades para não atingir a veia. Pets resistentes podem ser habituados gradualmente com sessões de treino e reforço positivo. Pássaros e coelhos precisam de atenção especial.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'guineapig', 'bird', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.5, hamster: 1.6, guineapig: 1.5, bird: 1.6, ferret: 1.3 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.4 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.3 },
      temperament: { calm: 1.7, sociable: 1.4, anxious: 0.4, lazy: 1.5 }
    }
  },
  {
    id: 'desafio_cognitivo',
    title: 'Desafio Cognitivo com Brinquedo',
    description: 'Apresente um brinquedo desafiador como kobold, licki mat, caixas de papelão com petiscos dentro ou brinquedos giratórios. O objetivo é fazer o pet pensar e resolver um problema para obter uma recompensa. Troque os brinquedos periodicamente para manter o interesse.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.6, cat: 1.5, bird: 1.6, ferret: 1.7, rabbit: 1.3 },
      age_group: { junior: 1.8, adult: 1.5, senior: 1.2 },
      energy_level: { high: 1.4, medium: 1.5, low: 1.1 },
      temperament: { playful: 1.8, energetic: 1.5, glutton: 1.6, lazy: 0.7 }
    }
  },
  {
    id: 'treino_transportadora',
    title: 'Treino de Aceitação da Transportadora',
    description: 'Habituação positiva à caixa de transporte: deixe aberta no ambiente com petiscos e cobertor familiar dentro. Alimente o pet perto dela progressivamente até ele entrar voluntariamente. Pets que aceitam a transportadora ficam menos estressados em viagens e consultas veterinárias.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'bird', 'rabbit', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.8, bird: 1.6, rabbit: 1.5, guineapig: 1.4, ferret: 1.3 },
      age_group: { junior: 2.0, adult: 1.3, senior: 1.0 },
      energy_level: { high: 1.0, medium: 1.2, low: 1.3 },
      temperament: { anxious: 1.8, calm: 1.2, sociable: 1.3, lazy: 1.2 }
    }
  },
  {
    id: 'corrida_livre_cercada',
    title: 'Corrida Livre em Área Cercada',
    description: 'Em um quintal, parque pet friendly ou sala segura, solte seu pet para correr livremente. Cães precisam de pelo menos uma sessão de corrida livre por semana. Coelhos e porquinhos-da-índia também precisam de espaço amplo para se mover. Furões adoram correr e pular.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['dog', 'rabbit', 'ferret', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.2, rabbit: 1.6, ferret: 2.0, guineapig: 1.5 },
      age_group: { junior: 2.2, adult: 2.0, senior: 0.7 },
      energy_level: { high: 2.5, medium: 1.8, low: 0.5 },
      temperament: { energetic: 2.5, playful: 2.0, sociable: 1.3, lazy: 0.3 }
    }
  },
  {
    id: 'voo_livre_supervisionado',
    title: 'Voo Livre Supervisionado',
    description: 'Em um cômodo seguro com janelas e ventiladores desligados, solte seu pássaro para voar livremente. O voo é fundamental para a saúde física e psicológica de aves. Retire objetos de risco, cubra espelhos e certifique-se que não há fugas possíveis antes de soltar.',
    shift: 'afternoon',
    duration: '20 min',
    allowed_species: ['bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { bird: 3.0 },
      age_group: { junior: 1.8, adult: 2.0, senior: 1.3 },
      energy_level: { high: 2.0, medium: 1.8, low: 1.2 },
      temperament: { energetic: 2.0, playful: 1.8, sociable: 1.5, anxious: 0.8 }
    }
  },
  {
    id: 'socializacao_outros_pets',
    title: 'Socialização com Outros Pets',
    description: 'Promova encontros supervisionados com outros animais da mesma espécie ou raças compatíveis. Para cães, use ambientes neutros e introdução gradual. Para porquinhos-da-índia e coelhos, a companhia de outro indivíduo é essencial para o bem-estar. Observe sinais de estresse.',
    shift: 'afternoon',
    duration: '30 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.2, rabbit: 1.6, guineapig: 2.0 },
      age_group: { junior: 2.0, adult: 1.4, senior: 0.8 },
      energy_level: { high: 1.4, medium: 1.3, low: 1.0 },
      temperament: { sociable: 2.5, playful: 1.8, energetic: 1.4, anxious: 0.3 }
    }
  },
  {
    id: 'enriquecimento_ambiental_tarde',
    title: 'Enriquecimento Ambiental',
    description: 'Reorganize os brinquedos, adicione uma prateleira nova, mude a posição de um arranhador ou introduza um suporte de poleiro diferente. A novidade no ambiente estimula a curiosidade e combate o tédio — a principal causa de comportamentos destrutivos em pets domésticos.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.6, rabbit: 1.5, hamster: 1.8, bird: 1.6, guineapig: 1.5, ferret: 1.7 },
      age_group: { junior: 1.8, adult: 1.4, senior: 1.1 },
      energy_level: { high: 1.4, medium: 1.3, low: 1.0 },
      temperament: { playful: 1.8, energetic: 1.6, sociable: 1.3, lazy: 0.7 }
    }
  },
  {
    id: 'treino_sentar_esperar',
    title: 'Treino de Autocontrole (Sentar e Esperar)',
    description: 'Peça ao pet que sente e aguarde antes de receber comida, brinquedo ou qualquer recompensa. Esse treino de autocontrole reduz impulsividade, melhora o comportamento geral e ensina ao animal que coisas boas chegam para quem espera. Fundamental para cães.',
    shift: 'afternoon',
    duration: '10 min',
    allowed_species: ['dog', 'cat'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, cat: 1.3 },
      age_group: { junior: 2.2, adult: 1.5, senior: 0.8 },
      energy_level: { high: 1.8, medium: 1.3, low: 0.7 },
      temperament: { energetic: 1.8, playful: 1.5, sociable: 1.4, lazy: 0.5 }
    }
  },
  {
    id: 'brincadeira_laser',
    title: 'Brincadeira com Laser',
    description: 'Use um ponteiro laser para criar um ponto de luz em movimento que o pet persiga. É uma ótima atividade aeróbica para gatos e furões. Importante: sempre encerre a sessão com um brinquedo físico que o pet possa "capturar", para não deixá-lo frustrado.',
    shift: 'afternoon',
    duration: '10 min',
    allowed_species: ['cat', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { cat: 2.2, ferret: 1.8 },
      age_group: { junior: 2.0, adult: 1.8, senior: 0.8 },
      energy_level: { high: 2.2, medium: 1.6, low: 0.5 },
      temperament: { energetic: 2.2, playful: 2.5, sociable: 1.2, lazy: 0.3 }
    }
  },
  {
    id: 'hidratacao_frutas_legumes',
    title: 'Hidratação com Frutas e Vegetais',
    description: 'Ofereça frutas e vegetais ricos em água como pepino, melância (sem sementes), cenoura e folhas de couve como complemento à hidratação. Ideal para coelhos, porquinhos e pássaros. Certifique-se de que os alimentos são seguros para a espécie antes de oferecer.',
    shift: 'afternoon',
    duration: '10 min',
    allowed_species: ['rabbit', 'guineapig', 'hamster', 'bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { rabbit: 1.8, guineapig: 2.0, hamster: 1.5, bird: 1.6 },
      age_group: { junior: 1.4, adult: 1.3, senior: 1.5 },
      energy_level: { high: 1.2, medium: 1.3, low: 1.4 },
      temperament: { glutton: 2.0, lazy: 1.4, calm: 1.3, sociable: 1.2 }
    }
  },
  {
    id: 'treino_passeio_coleira',
    title: 'Treino de Passeio na Coleira',
    description: 'Ensine seu cão ou coelho a caminhar tranquilamente na guia sem puxar. Comece em casa, recompense o caminhar ao seu lado e pare sempre que o pet puxar. Um pet que caminha bem na coleira tem passeios mais seguros e agradáveis para ambos. Use arreio em vez de coleira para pescoços sensíveis.',
    shift: 'afternoon',
    duration: '15 min',
    allowed_species: ['dog', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, rabbit: 1.4 },
      age_group: { junior: 2.5, adult: 1.5, senior: 0.8 },
      energy_level: { high: 1.8, medium: 1.4, low: 0.7 },
      temperament: { energetic: 1.8, sociable: 1.5, playful: 1.4, anxious: 0.6 }
    }
  },
  {
    id: 'sessao_grooming_completo',
    title: 'Sessão de Grooming Completo',
    description: 'Combine várias ações de cuidado pessoal: escovação, limpeza de orelhas, verificação de unhas, inspeção do pelo e pele. Transforme em uma experiência positiva com petiscos e elogios. Pets habituados ao grooming têm consultas veterinárias muito menos estressantes.',
    shift: 'afternoon',
    duration: '25 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.4, rabbit: 1.6, guineapig: 1.5, ferret: 1.3 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.6 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.4 },
      temperament: { calm: 1.8, sociable: 1.5, lazy: 1.4, anxious: 0.5 }
    }
  },


  // ─────────────────────────────────────────────
  // NOITE — 25 atividades
  // ─────────────────────────────────────────────

  {
    id: 'passeio_noturno_leve',
    title: 'Passeio Noturno Leve',
    description: 'Um passeio calmo e curto à noite ajuda o cão a descomprimir, farejar o ambiente e relaxar antes de dormir. Mantenha o ritmo tranquilo — não é hora de correr. Evite locais com muito barulho ou estímulo. Use coleira e guia por segurança.',
    shift: 'night',
    duration: '15 min',
    allowed_species: ['dog'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0 },
      age_group: { junior: 1.2, adult: 1.5, senior: 1.3 },
      energy_level: { high: 1.8, medium: 1.4, low: 0.8 },
      temperament: { energetic: 1.6, sociable: 1.3, anxious: 0.7, lazy: 0.8 }
    }
  },
  {
    id: 'sessao_carinho_noturno',
    title: 'Sessão de Carinho Noturno',
    description: 'Momento exclusivo de afeto antes de dormir: carícias suaves, conversa calma e presença tranquila. Estabelece uma âncora emocional positiva para o fim do dia. Pets que têm esse ritual costumam ser mais calmos e menos ansiosos em geral.',
    shift: 'night',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.4, rabbit: 1.3, guineapig: 1.5, ferret: 1.3 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.7 },
      energy_level: { high: 0.6, medium: 0.9, low: 1.7 },
      temperament: { sociable: 2.0, calm: 1.8, lazy: 1.6, anxious: 1.2 }
    }
  },
  {
    id: 'escovacao_relaxante_noite',
    title: 'Escovação Relaxante Noturna',
    description: 'Uma escovação suave antes de dormir serve tanto para higiene quanto para relaxamento. Use movimentos lentos e ritmados. Para muitos pets, essa rotina funciona como um sinal claro de que é hora de descansar, ajudando a regular o ciclo do sono.',
    shift: 'night',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.5, rabbit: 1.5, guineapig: 1.4 },
      age_group: { junior: 0.8, adult: 1.0, senior: 1.7 },
      energy_level: { high: 0.4, medium: 0.8, low: 1.7 },
      temperament: { lazy: 2.0, calm: 1.8, sociable: 1.3, anxious: 0.8 }
    }
  },
  {
    id: 'massagem_suave_noturna',
    title: 'Massagem Suave Noturna',
    description: 'Massageie gentilmente a região do pescoço, costas e orelhas do pet com movimentos circulares. A massagem libera endorfinas, alivia tensões musculares acumuladas no dia e induz um estado de relaxamento profundo. Ótimo para pets ansiosos ou que tiveram um dia agitado.',
    shift: 'night',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.5, rabbit: 1.4, ferret: 1.3 },
      age_group: { junior: 0.7, adult: 1.0, senior: 1.8 },
      energy_level: { high: 0.4, medium: 0.7, low: 1.7 },
      temperament: { anxious: 1.8, lazy: 1.8, calm: 1.6, sociable: 1.2 }
    }
  },
  {
    id: 'limpeza_patinhas',
    title: 'Limpeza das Patinhas',
    description: 'Limpe as patas do cão ou gato após o passeio noturno com pano úmido ou toalha. Remova sujeira, areia e possíveis resíduos químicos do asfalto. Observe os coxins em busca de cortes, rachaduras ou ressecamento. Aplique hidratante para coxins se necessário.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, cat: 1.3 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.4 },
      energy_level: { high: 1.2, medium: 1.0, low: 1.1 },
      temperament: { calm: 1.5, sociable: 1.3, anxious: 0.6, lazy: 1.3 }
    }
  },
  {
    id: 'verificacao_cama_ninho',
    title: 'Verificação da Cama ou Ninho',
    description: 'Certifique-se de que o espaço de descanso está limpo, seco, confortável e na temperatura certa. Troque cobertores molhados, sacuda almofadas e verifique se não há objetos cortantes. Para hamsters, adicione substrato para que possam construir o ninho.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.4, hamster: 1.8, bird: 1.3, guineapig: 1.5, ferret: 1.3 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.6 },
      energy_level: { high: 0.7, medium: 1.0, low: 1.5 },
      temperament: { anxious: 1.5, lazy: 1.6, calm: 1.4, sociable: 1.0 }
    }
  },
  {
    id: 'lanche_noturno_leve',
    title: 'Lanche Noturno Leve',
    description: 'Ofereça um petisco leve adequado à espécie antes de dormir. Para cães e gatos, algo pequeno e proteico. Para coelhos, uma folhinha de salsa. Para hamsters, um grão ou semente. Esse ritual de encerramento do dia ajuda o pet a associar a noite com conforto e recompensa.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.2, rabbit: 1.5, hamster: 1.6, guineapig: 1.5, ferret: 1.4 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.4 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.3 },
      temperament: { glutton: 1.8, lazy: 1.4, calm: 1.3, anxious: 0.9 }
    }
  },
  {
    id: 'verificacao_agua_noite',
    title: 'Verificação de Água Noturna',
    description: 'Antes de dormir, confirme que o bebedouro está cheio, limpo e funcionando. Pets que ficam a noite toda sem acesso à água podem apresentar desidratação, especialmente em noites quentes. Para hamsters noturnos, a água é essencial pois ficam ativos à noite.',
    shift: 'night',
    duration: '3 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.3, rabbit: 1.4, hamster: 1.8, bird: 1.2, guineapig: 1.4, ferret: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.5 },
      energy_level: { high: 1.2, medium: 1.0, low: 1.2 },
      temperament: { energetic: 1.2, lazy: 1.1, anxious: 1.0, glutton: 1.2 }
    }
  },
  {
    id: 'ambiente_calmo_noite',
    title: 'Preparação do Ambiente para o Sono',
    description: 'Reduza luzes, baixe o volume da TV e elimine estímulos que possam agitar o pet antes de dormir. Feche persianas para escurecer o ambiente. Cobre a gaiola de pássaros com uma manta para sinalizar o momento de recolher. Rotina constante regula o ciclo circadiano.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.1, cat: 1.2, rabbit: 1.3, hamster: 1.2, bird: 1.8, guineapig: 1.3, ferret: 1.1 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.6 },
      energy_level: { high: 0.5, medium: 0.8, low: 1.6 },
      temperament: { anxious: 1.8, calm: 1.4, lazy: 1.5, energetic: 0.4 }
    }
  },
  {
    id: 'sons_relaxantes',
    title: 'Sons Relaxantes para o Pet',
    description: 'Coloque sons da natureza, música clássica em volume baixo ou frequências específicas para animais (existem playlists no Spotify para cães, gatos e pássaros). Estudos mostram que esses sons reduzem o cortisol em pets e melhoram a qualidade do sono.',
    shift: 'night',
    duration: '20 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.2, hamster: 1.1, bird: 1.5, guineapig: 1.2, ferret: 1.1 },
      age_group: { junior: 0.8, adult: 1.0, senior: 1.6 },
      energy_level: { high: 0.4, medium: 0.7, low: 1.7 },
      temperament: { anxious: 2.0, calm: 1.4, lazy: 1.5, energetic: 0.3 }
    }
  },
  {
    id: 'troca_substrato_noite',
    title: 'Troca de Substrato Noturno',
    description: 'Faça a troca parcial ou completa do substrato da gaiola ou terrário. Hamsters, por serem noturnos, usam o substrato intensamente à noite para cavar e fazer ninho. Substratos limpos previnem doenças respiratórias e de pele e garantem conforto durante o descanso.',
    shift: 'night',
    duration: '15 min',
    allowed_species: ['hamster', 'guineapig', 'bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { hamster: 2.2, guineapig: 1.8, bird: 1.5 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.1 },
      temperament: { anxious: 1.4, calm: 1.2, lazy: 1.1, energetic: 1.0 }
    }
  },
  {
    id: 'escovacao_dental_noite',
    title: 'Escovação Dental Noturna',
    description: 'A escovação noturna é a mais importante do dia — remove o acúmulo de placa bacteriana formado ao longo das horas. Use pasta enzimática veterinária e escova pequena. Reforce com petiscos dentais ou brinquedos de borracha que auxiliam na limpeza mecânica.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.3, rabbit: 1.3, ferret: 1.4, guineapig: 1.2 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.8 },
      energy_level: { high: 0.7, medium: 1.0, low: 1.3 },
      temperament: { calm: 1.7, sociable: 1.4, anxious: 0.4, lazy: 1.3 }
    }
  },
  {
    id: 'preparo_cama_confortavel',
    title: 'Preparo da Cama Confortável',
    description: 'Arrume a cama, cesta ou manta do pet no local de descanso habitual. Adicione um item com o cheiro do tutor (camiseta usada) para pets ansiosos. Camas ortopédicas são recomendadas para pets sênior ou com problemas articulares.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.4, rabbit: 1.2, ferret: 1.2 },
      age_group: { junior: 1.0, adult: 1.0, senior: 2.0 },
      energy_level: { high: 0.7, medium: 0.9, low: 1.6 },
      temperament: { lazy: 1.8, anxious: 1.6, calm: 1.5, sociable: 1.1 }
    }
  },
  {
    id: 'ritual_boa_noite',
    title: 'Ritual de Boa Noite',
    description: 'Crie uma sequência consistente de ações que marquem o fim do dia: uma palavra-chave como "boa noite", uma caricia específica e levá-lo ao local de dormir. Pets se beneficiam muito de previsibilidade — rotinas noturnas reduzem insônia e ansiedade de separação.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.3, rabbit: 1.2, hamster: 1.1, bird: 1.3, guineapig: 1.2, ferret: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.5 },
      energy_level: { high: 0.5, medium: 0.8, low: 1.6 },
      temperament: { anxious: 1.8, sociable: 1.5, lazy: 1.6, calm: 1.5 }
    }
  },
  {
    id: 'verificacao_comportamento_noturno',
    title: 'Verificação Comportamental Noturna',
    description: 'Antes de ir dormir, observe brevemente seu pet: ele está tranquilo, respirando bem, na posição habitual? Hamsters devem estar acordados e ativos à noite. Pássaros devem estar quietos. Qualquer comportamento fora do padrão deve ser anotado e avaliado.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.1, cat: 1.2, rabbit: 1.3, hamster: 1.5, bird: 1.4, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.7 },
      energy_level: { high: 0.6, medium: 0.9, low: 1.5 },
      temperament: { anxious: 1.5, calm: 1.2, lazy: 1.3, sociable: 1.0 }
    }
  },
  {
    id: 'verificacao_temperatura_noite',
    title: 'Controle de Temperatura Noturna',
    description: 'Verifique se a temperatura do ambiente está adequada para a espécie. Hamsters ficam em torpor abaixo de 18°C; pássaros são sensíveis ao frio; cães de pelo curto podem precisar de manta. Em noites quentes, certifique-se de que há circulação de ar sem correntes diretas.',
    shift: 'night',
    duration: '3 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.1, cat: 1.1, rabbit: 1.3, hamster: 2.0, bird: 1.8, guineapig: 1.5, ferret: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.7 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.4 },
      temperament: { anxious: 1.3, calm: 1.2, lazy: 1.2, energetic: 0.8 }
    }
  },
  {
    id: 'atividade_noturna_hamster',
    title: 'Preparação para Atividade Noturna',
    description: 'Hamsters são animais noturnos — prepare o habitat com alimentos frescos, água, substrato para cavar e brinquedos para exploração antes de ir dormir. Garanta que a roda está livre e silenciosa. Essa preparação respeita o ciclo natural e o bem-estar do animal.',
    shift: 'night',
    duration: '10 min',
    allowed_species: ['hamster'],
    base_weight: 1,
    weight_modifiers: {
      species: { hamster: 3.0 },
      age_group: { junior: 1.5, adult: 1.8, senior: 1.2 },
      energy_level: { high: 2.0, medium: 1.5, low: 1.0 },
      temperament: { energetic: 2.0, playful: 1.8, anxious: 1.2, lazy: 0.6 }
    }
  },
  {
    id: 'limpeza_pos_passeio',
    title: 'Higiene Pós-Passeio Noturno',
    description: 'Após o passeio noturno, limpe as patas, ventre e focinho do cão com toalha ou pano úmido. Remova espinhos, carrapatos ou outros elementos externos. Verifique se há cortes ou irritações. Mantenha o animal higienizado antes de deixá-lo no espaço de dormir.',
    shift: 'night',
    duration: '8 min',
    allowed_species: ['dog', 'cat'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, cat: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.3, medium: 1.0, low: 1.0 },
      temperament: { calm: 1.5, sociable: 1.3, anxious: 0.6, lazy: 1.2 }
    }
  },
  {
    id: 'cobertura_gaiola_passaro',
    title: 'Cobertura da Gaiola',
    description: 'Cubra a gaiola do pássaro com uma manta escura e respirável para simular a escuridão da noite. Esse ato sinaliza ao animal que é hora de dormir, regula o fotoperíodo e protege contra correntes de ar e luz artificial. Pássaros precisam de 10–12 horas de escuridão.',
    shift: 'night',
    duration: '3 min',
    allowed_species: ['bird'],
    base_weight: 1,
    weight_modifiers: {
      species: { bird: 3.0 },
      age_group: { junior: 1.3, adult: 1.5, senior: 1.5 },
      energy_level: { high: 0.8, medium: 1.2, low: 1.5 },
      temperament: { anxious: 1.5, calm: 1.5, sociable: 1.2, lazy: 1.3 }
    }
  },
  {
    id: 'limpeza_area_eliminacao_noite',
    title: 'Limpeza da Área de Eliminação',
    description: 'Limpe a caixa de areia, tapete higiênico ou área de eliminação do pet antes de dormir. Pets tendem a rejeitar áreas sujas e podem criar hábitos inadequados se o local não estiver limpo. Gatos especialmente são muito exigentes com a higiene da caixinha.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.8, rabbit: 1.5, hamster: 1.7, guineapig: 1.6 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.5 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.1 },
      temperament: { anxious: 1.3, calm: 1.2, lazy: 1.2, energetic: 0.9 }
    }
  },
  {
    id: 'relatorio_comportamento_dia',
    title: 'Reflexão sobre o Comportamento do Dia',
    description: 'Reserve alguns minutos para lembrar como o pet se comportou ao longo do dia: foi mais agitado que o normal? Comeu menos? Interagiu diferente? Essa reflexão diária cria um mapa comportamental que torna padrões visíveis ao longo das semanas e facilita conversas com o veterinário.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.1, cat: 1.2, rabbit: 1.3, hamster: 1.4, bird: 1.3, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.7 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.3 },
      temperament: { anxious: 1.5, calm: 1.1, lazy: 1.2, energetic: 0.9 }
    }
  },
  {
    id: 'checagem_seguranca_noturna',
    title: 'Checagem de Segurança Noturna',
    description: 'Antes de dormir, verifique se janelas e portas estão fechadas, se não há fios expostos acessíveis, objetos cortantes no chão ou alimentos tóxicos ao alcance do pet. Pets exploram mais quando a casa está quieta à noite — um ambiente seguro evita acidentes graves.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.4, rabbit: 1.3, hamster: 1.3, bird: 1.2, guineapig: 1.2, ferret: 1.5 },
      age_group: { junior: 1.6, adult: 1.0, senior: 1.2 },
      energy_level: { high: 1.3, medium: 1.0, low: 0.9 },
      temperament: { energetic: 1.4, anxious: 1.2, playful: 1.3, lazy: 0.9 }
    }
  },
  {
    id: 'brincadeira_calma_noturna',
    title: 'Brincadeira Calma Pré-Sono',
    description: 'Uma sessão breve e de baixa intensidade: brinquedo de tecido, bola leve ou interação suave com as mãos. O objetivo não é cansar, mas ajudar o pet a transicionar para um estado mais tranquilo. Evite brinquedos com laser ou que causem excitação excessiva nesse horário.',
    shift: 'night',
    duration: '10 min',
    allowed_species: ['cat', 'dog', 'ferret', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { cat: 1.8, dog: 1.4, ferret: 1.5, rabbit: 1.2 },
      age_group: { junior: 1.5, adult: 1.2, senior: 0.9 },
      energy_level: { high: 1.8, medium: 1.2, low: 0.5 },
      temperament: { energetic: 1.8, playful: 1.6, sociable: 1.3, lazy: 0.5 }
    }
  },
  {
    id: 'arrumacao_brinquedos',
    title: 'Arrumação dos Brinquedos',
    description: 'Recolha os brinquedos espalhados, inspecione o estado de cada um (descarte os danificados ou com peças soltas que possam ser engolidas) e guarde. A rotatividade de brinquedos — guardar alguns e reapresentá-los depois — mantém o interesse do pet e reduz o tédio.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.1, hamster: 1.2, bird: 1.2, guineapig: 1.1, ferret: 1.3 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.0 },
      energy_level: { high: 1.1, medium: 1.0, low: 1.0 },
      temperament: { playful: 1.3, energetic: 1.2, sociable: 1.0, lazy: 1.0 }
    }
  },
  {
    id: 'registro_diario_noite',
    title: 'Registro Diário do Pet',
    description: 'Anote brevemente as observações do dia: apetite, disposição, fezes, comportamento fora do comum e atividades realizadas. Esse histórico é valioso nas consultas veterinárias e ajuda a identificar padrões ou alterações precoces de saúde antes que se tornem sérias.',
    shift: 'night',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.0, rabbit: 1.2, hamster: 1.3, bird: 1.2, guineapig: 1.2, ferret: 1.1 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.6 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.2 },
      temperament: { anxious: 1.3, calm: 1.1, lazy: 1.1, sociable: 1.0 }
    }
  },


  // ─────────────────────────────────────────────
  // QUALQUER HORÁRIO — 25 atividades
  // ─────────────────────────────────────────────

  {
    id: 'hidratacao_monitoramento',
    title: 'Monitoramento de Hidratação',
    description: 'Observe se o pet está bebendo água regularmente. Um teste simples: pince levemente a pele do pescoço — se demorar para voltar, pode haver desidratação. Gatos são especialmente propensos a beber pouco; fontes de água corrente aumentam o consumo significativamente.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.6, rabbit: 1.4, hamster: 1.4, bird: 1.3, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.7 },
      energy_level: { high: 1.3, medium: 1.0, low: 1.2 },
      temperament: { energetic: 1.3, lazy: 1.1, anxious: 1.0, calm: 1.0 }
    }
  },
  {
    id: 'reforco_positivo_espontaneo',
    title: 'Reforço Positivo Espontâneo',
    description: 'Quando seu pet fizer algo certo — usar o banheiro no lugar correto, não pular em visitas, esperar a comida — recompense imediatamente com petisco, elogio ou carinho. O reforço deve acontecer em até 3 segundos do comportamento para o pet associar corretamente.',
    shift: 'any',
    duration: '3 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.4, bird: 1.5, ferret: 1.5, rabbit: 1.2 },
      age_group: { junior: 2.0, adult: 1.4, senior: 0.9 },
      energy_level: { high: 1.3, medium: 1.2, low: 1.0 },
      temperament: { energetic: 1.5, playful: 1.4, sociable: 1.4, anxious: 1.0 }
    }
  },
  {
    id: 'verificacao_fezes_urina',
    title: 'Verificação de Fezes e Urina',
    description: 'Observe a consistência, cor e frequência das fezes do pet. Fezes duras indicam desidratação; moles ou com sangue exigem atenção veterinária. Em coelhos, a presença de cecotrofes (fezes noturnas) sendo ingeridas é normal e saudável. Urina muito escura pode indicar desidratação.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.5, hamster: 1.4, bird: 1.4, guineapig: 1.4, ferret: 1.3 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.7 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.3 },
      temperament: { anxious: 1.3, calm: 1.1, lazy: 1.2, energetic: 0.9 }
    }
  },
  {
    id: 'troca_rotacao_brinquedos',
    title: 'Rotação de Brinquedos',
    description: 'Guarde alguns brinquedos por alguns dias e reapresente-os como se fossem novos. Para o pet, brinquedos que "voltam" são tão estimulantes quanto novidades. Essa estratégia simples combate o tédio, reduz comportamentos destrutivos e economiza dinheiro.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.5, rabbit: 1.3, hamster: 1.5, bird: 1.5, guineapig: 1.3, ferret: 1.5 },
      age_group: { junior: 1.6, adult: 1.3, senior: 1.0 },
      energy_level: { high: 1.4, medium: 1.2, low: 0.9 },
      temperament: { playful: 1.8, energetic: 1.5, sociable: 1.2, lazy: 0.7 }
    }
  },
  {
    id: 'verificacao_parasitas_externos',
    title: 'Verificação de Parasitas Externos',
    description: 'Passe os dedos contra o sentido do pelo procurando pontinhos escuros (fezes de pulga) ou parasitas acoplados à pele. Verifique especialmente orelhas, pescoço, virilha e entre os dedos. Após passeios em áreas verdes, faça uma vistoria completa para detectar carrapatos precocemente.',
    shift: 'any',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.3, rabbit: 1.4, ferret: 1.3, guineapig: 1.3 },
      age_group: { junior: 1.3, adult: 1.1, senior: 1.4 },
      energy_level: { high: 1.2, medium: 1.0, low: 1.1 },
      temperament: { anxious: 0.8, calm: 1.4, sociable: 1.2, lazy: 1.3 }
    }
  },
  {
    id: 'limpeza_comedouros',
    title: 'Limpeza de Comedouros e Bebedouros',
    description: 'Lave os recipientes de alimentação e hidratação com esponja e detergente neutro, enxagando bem para remover todo o resíduo. Recipientes plásticos acumulam mais bactérias que cerâmica ou inox. Faça pelo menos uma lavagem completa por dia.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.1, cat: 1.3, rabbit: 1.4, hamster: 1.5, bird: 1.4, guineapig: 1.4, ferret: 1.3 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.3 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.1 },
      temperament: { anxious: 1.2, calm: 1.1, glutton: 1.3, lazy: 1.0 }
    }
  },
  {
    id: 'treino_nome_resposta',
    title: 'Treino de Resposta ao Nome',
    description: 'Chame o pet pelo nome e recompense imediatamente quando ele olhar para você ou vier. Parece simples, mas muitos pets não respondem ao próprio nome de forma confiável. Pássaros podem aprender a vocalizar o próprio nome. Essa habilidade é fundamental para segurança.',
    shift: 'any',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'bird', 'ferret', 'rabbit'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.4, bird: 1.6, ferret: 1.5, rabbit: 1.2 },
      age_group: { junior: 2.2, adult: 1.4, senior: 0.9 },
      energy_level: { high: 1.3, medium: 1.2, low: 1.0 },
      temperament: { sociable: 1.8, playful: 1.5, energetic: 1.4, lazy: 0.6 }
    }
  },
  {
    id: 'inspecao_visual_rapida',
    title: 'Inspeção Visual Rápida',
    description: 'Faça uma observação geral rápida do pet: postura, brilho dos olhos, condição do pelo, respiração. Tutores atentos percebem sutilezas que médicos podem não ver numa consulta pontual. Essa observação diária cria uma base de referência que torna anomalias mais visíveis.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.1, rabbit: 1.3, hamster: 1.4, bird: 1.4, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.7 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.4 },
      temperament: { anxious: 1.3, calm: 1.1, lazy: 1.2, energetic: 0.9 }
    }
  },
  {
    id: 'limpeza_orelhas',
    title: 'Limpeza das Orelhas',
    description: 'Use solução otológica veterinária e algodão para limpar suavemente a parte externa e visível do canal auditivo. Nunca use cotonete fundo. Cães de orelhas caídas e furões precisam de atenção mais frequente. Coelhos têm orelhas autolimpantes — intervenha só se houver sinal de infecção.',
    shift: 'any',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.6, cat: 1.2, rabbit: 1.3, ferret: 1.5 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.5 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.3 },
      temperament: { calm: 1.6, sociable: 1.4, anxious: 0.4, lazy: 1.4 }
    }
  },
  {
    id: 'controle_peso',
    title: 'Controle de Peso',
    description: 'Pese seu pet regularmente na mesma balança e horário. Para animais pequenos, use uma balança de precisão. Variações de mais de 5% em pouco tempo merecem atenção veterinária. Mantenha um registro simples para acompanhar a tendência ao longo das semanas.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.3, rabbit: 1.4, hamster: 1.6, bird: 1.5, guineapig: 1.5, ferret: 1.3 },
      age_group: { junior: 1.4, adult: 1.1, senior: 1.6 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.4 },
      temperament: { glutton: 1.8, lazy: 1.5, calm: 1.2, energetic: 0.8 }
    }
  },
  {
    id: 'verificacao_medicacao',
    title: 'Verificação de Medicação e Suplementos',
    description: 'Confira se a medicação ou suplemento do dia foi administrado, no horário e dose corretos. Use uma tabela ou alarme para não esquecer. Anote reações como recusa, vômito ou comportamento alterado após a administração e comunique ao veterinário.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.1, rabbit: 1.2, hamster: 1.2, bird: 1.2, guineapig: 1.2, ferret: 1.1 },
      age_group: { junior: 1.2, adult: 1.0, senior: 2.0 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.5 },
      temperament: { anxious: 1.2, lazy: 1.2, calm: 1.1, energetic: 0.8 }
    }
  },
  {
    id: 'adaptacao_novos_estimulos',
    title: 'Adaptação a Novos Estímulos',
    description: 'Apresente ao pet situações novas gradualmente: sons diferentes, pessoas desconhecidas, cheiros incomuns. A dessensibilização progressiva reduz o medo e a reatividade. Nunca force o contato — deixe o pet aproximar-se no próprio ritmo, recompensando cada avanço.',
    shift: 'any',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.4, rabbit: 1.3, hamster: 1.4, bird: 1.5, guineapig: 1.3, ferret: 1.4 },
      age_group: { junior: 2.0, adult: 1.3, senior: 0.8 },
      energy_level: { high: 1.3, medium: 1.2, low: 0.9 },
      temperament: { anxious: 1.8, sociable: 1.3, playful: 1.4, calm: 1.2 }
    }
  },
  {
    id: 'limpeza_area_eliminacao',
    title: 'Limpeza da Área de Eliminação',
    description: 'Limpe a caixa de areia, tapete higiênico, gaiola ou baia no mínimo uma vez ao dia. Use produtos adequados que eliminem odor sem resíduos tóxicos. Pets que encontram o banheiro sujo tendem a criar hábitos inadequados e podem segurar a eliminação, causando problemas de saúde.',
    shift: 'any',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.8, rabbit: 1.6, hamster: 1.8, guineapig: 1.7 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.4 },
      energy_level: { high: 1.1, medium: 1.0, low: 1.1 },
      temperament: { anxious: 1.4, calm: 1.2, lazy: 1.2, energetic: 0.9 }
    }
  },
  {
    id: 'verificacao_brinquedos_seguranca',
    title: 'Inspeção de Segurança dos Brinquedos',
    description: 'Verifique o estado dos brinquedos: descarte os que estão com pedaços soltos, borracha quebrada, pelúcia rasgada com recheio exposto ou cordas desfiadas. Pets podem engolir fragmentos com risco de obstrução intestinal. Substitua brinquedos danificados imediatamente.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.3, rabbit: 1.2, hamster: 1.3, bird: 1.3, guineapig: 1.2, ferret: 1.3 },
      age_group: { junior: 1.5, adult: 1.0, senior: 1.1 },
      energy_level: { high: 1.3, medium: 1.0, low: 0.9 },
      temperament: { energetic: 1.4, playful: 1.3, anxious: 1.0, lazy: 0.9 }
    }
  },
  {
    id: 'sniff_enrichment',
    title: 'Enriquecimento Olfativo',
    description: 'Apresente itens com aromas seguros e novos: ervas frescas como manjericão, camomila ou hortelã (para coelhos e hamsters), especiarias em sachê (para cães), palitos de canela ou anis-estrelado (para furões). O olfato é o sentido dominante de vários pets — estimulá-lo é uma atividade cognitiva profunda.',
    shift: 'any',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'ferret', 'rabbit', 'hamster', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 2.0, cat: 1.5, ferret: 1.8, rabbit: 1.5, hamster: 1.6, guineapig: 1.4 },
      age_group: { junior: 1.6, adult: 1.4, senior: 1.1 },
      energy_level: { high: 1.3, medium: 1.4, low: 1.2 },
      temperament: { energetic: 1.5, playful: 1.5, sociable: 1.3, lazy: 1.1 }
    }
  },
  {
    id: 'controle_estresse_ambiental',
    title: 'Controle de Estresse Ambiental',
    description: 'Identifique e reduza fontes de estresse no ambiente: barulho excessivo, cheiro de produtos de limpeza, presença de animais perturbadores, movimentação intensa de pessoas. Pets estressados desenvolvem comportamentos destrutivos, automutilação e doenças imunossupressoras.',
    shift: 'any',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.2, cat: 1.4, rabbit: 1.5, hamster: 1.6, bird: 1.5, guineapig: 1.4, ferret: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.6 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.4 },
      temperament: { anxious: 2.0, calm: 0.8, sociable: 1.0, energetic: 0.9 }
    }
  },
  {
    id: 'sessao_afeto_espontanea',
    title: 'Sessão de Afeto Espontânea',
    description: 'Quando seu pet vier até você por conta própria, responda com afeto genuíno. Pets que iniciam contato merecem reforço positivo dessa aproximação. Ignore-os quando precisar de espaço, mas nunca puna um pet que buscou atenção — isso gera confusão e insegurança.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.5, cat: 1.3, rabbit: 1.3, guineapig: 1.4, ferret: 1.5 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.4 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.3 },
      temperament: { sociable: 2.2, playful: 1.5, calm: 1.4, anxious: 0.9 }
    }
  },
  {
    id: 'verificacao_acessorios',
    title: 'Verificação de Acessórios e Equipamentos',
    description: 'Inspecione coleira, guia, arreio, gaiola, bebedouro automático, roda de exercícios e demais acessórios. Coleiras muito apertadas machucam; muito folgadas possibilitam fugas. Verifique desgaste de costuras e fivelas. Troque qualquer item com risco de falha ou ferimento.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.2, rabbit: 1.3, hamster: 1.4, bird: 1.3, guineapig: 1.3, ferret: 1.3 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.2 },
      energy_level: { high: 1.1, medium: 1.0, low: 1.0 },
      temperament: { energetic: 1.2, anxious: 1.1, calm: 1.0, lazy: 1.0 }
    }
  },
  {
    id: 'brincadeira_espontanea_livre',
    title: 'Brincadeira Livre Espontânea',
    description: 'Observe seu pet brincar por conta própria sem interferência. Resista ao impulso de dirigir a brincadeira. Pets que brincam sozinhos demonstram autonomia e saúde emocional. Registre quais brinquedos ou atividades ele escolhe — isso revela muito sobre suas preferências.',
    shift: 'any',
    duration: '15 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.5, rabbit: 1.3, hamster: 1.6, bird: 1.5, guineapig: 1.3, ferret: 1.6 },
      age_group: { junior: 2.0, adult: 1.5, senior: 0.8 },
      energy_level: { high: 1.8, medium: 1.4, low: 0.6 },
      temperament: { playful: 2.2, energetic: 2.0, sociable: 1.3, lazy: 0.4 }
    }
  },
  {
    id: 'higiene_regiao_intima',
    title: 'Higiene da Região Íntima',
    description: 'Verifique e limpe suavemente a região anal e genital, especialmente em pets de pelo longo, fêmeas, idosos ou pets com baixa mobilidade. Resíduos de fezes nessa área causam dermatites graves. Em coelhos, limpe o espaço das glândulas odoríficas com cotonete umedecido periodicamente.',
    shift: 'any',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'guineapig'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.3, cat: 1.4, rabbit: 1.6, guineapig: 1.5 },
      age_group: { junior: 1.0, adult: 1.0, senior: 1.8 },
      energy_level: { high: 0.7, medium: 1.0, low: 1.5 },
      temperament: { calm: 1.7, sociable: 1.3, lazy: 1.5, anxious: 0.5 }
    }
  },
  {
    id: 'treino_manipulacao_veterinaria',
    title: 'Treino de Manipulação Veterinária',
    description: 'Habitue seu pet a ser tocado em regiões sensíveis: boca, ouvidos, patas, cauda e abdômen. Faça isso com calma e recompensas, como se fosse uma consulta simulada. Pets que aceitam manipulação têm consultas veterinárias muito menos traumáticas — para eles e para o médico.',
    shift: 'any',
    duration: '10 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.6, rabbit: 1.5, hamster: 1.6, bird: 1.7, guineapig: 1.5, ferret: 1.4 },
      age_group: { junior: 2.0, adult: 1.3, senior: 1.2 },
      energy_level: { high: 0.9, medium: 1.1, low: 1.3 },
      temperament: { anxious: 1.8, calm: 1.4, sociable: 1.3, energetic: 0.9 }
    }
  },
  {
    id: 'controle_qualidade_ar',
    title: 'Controle de Qualidade do Ar',
    description: 'Verifique a ventilação do ambiente — abra janelas por períodos ou use purificador de ar. Pets de pequeno porte e pássaros são extremamente sensíveis a fumaça, sprays, velas perfumadas e produtos de limpeza aerossol. Nunca use teflon superaquecido perto de pássaros — os vapores são letais.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.0, cat: 1.1, rabbit: 1.3, hamster: 1.4, bird: 2.0, guineapig: 1.4, ferret: 1.2 },
      age_group: { junior: 1.1, adult: 1.0, senior: 1.4 },
      energy_level: { high: 0.9, medium: 1.0, low: 1.3 },
      temperament: { anxious: 1.3, calm: 1.1, lazy: 1.1, energetic: 0.9 }
    }
  },
  {
    id: 'interacao_voz_calma',
    title: 'Interação com Voz Calma',
    description: 'Converse com seu pet usando voz suave e pausada. Animais reconhecem entonação e padrões vocais — sua voz calma tem efeito regulador sobre o sistema nervoso deles. Pássaros aprendem palavras dessa interação cotidiana. Coelhos e porquinhos respondem a donos que conversam regularmente.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.4, cat: 1.3, rabbit: 1.3, bird: 2.0, guineapig: 1.4, ferret: 1.3 },
      age_group: { junior: 1.3, adult: 1.0, senior: 1.5 },
      energy_level: { high: 0.8, medium: 1.0, low: 1.5 },
      temperament: { sociable: 2.0, calm: 1.6, anxious: 1.3, lazy: 1.2 }
    }
  },
  {
    id: 'escovacao_pos_passeio',
    title: 'Escovação Pós-Passeio',
    description: 'Após passeios em áreas externas, escove o pelo do pet para remover folhas, espinhos, sementes grudadas e possíveis parasitas. Aproveite para palpar o corpo em busca de inchaços ou cortes que possam ter passado despercebidos durante o passeio.',
    shift: 'any',
    duration: '8 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.8, cat: 1.4, rabbit: 1.5, ferret: 1.3 },
      age_group: { junior: 1.2, adult: 1.3, senior: 1.4 },
      energy_level: { high: 1.3, medium: 1.2, low: 1.1 },
      temperament: { energetic: 1.4, sociable: 1.3, calm: 1.3, anxious: 0.8 }
    }
  },
  {
    id: 'foto_registro_saude',
    title: 'Foto de Registro de Saúde',
    description: 'Tire uma foto do seu pet regularmente, sempre no mesmo ângulo e condição de luz. Ao longo das semanas, você poderá comparar e detectar variações sutis: perda de massa muscular, alteração de pelo, crescimento de unhas. É uma ferramenta visual simples e poderosa de monitoramento.',
    shift: 'any',
    duration: '5 min',
    allowed_species: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'guineapig', 'ferret'],
    base_weight: 1,
    weight_modifiers: {
      species: { dog: 1.1, cat: 1.2, rabbit: 1.3, hamster: 1.4, bird: 1.3, guineapig: 1.3, ferret: 1.2 },
      age_group: { junior: 1.2, adult: 1.0, senior: 1.6 },
      energy_level: { high: 1.0, medium: 1.0, low: 1.2 },
      temperament: { calm: 1.4, sociable: 1.3, lazy: 1.2, anxious: 0.9 }
    }
  }

];