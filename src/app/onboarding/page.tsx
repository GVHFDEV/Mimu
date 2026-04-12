'use client';

import { useState, useTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { createPet } from '@/app/auth/actions';
import { Logo } from '@/components/Logo';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { OnboardingHeader } from '@/components/OnboardingHeader';
import { AnimalSelect } from '@/components/AnimalSelect';
import { BreedSelect, hasSpecificBreeds } from '@/components/BreedSelect';

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  // Step 1 states
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [showOtherSelect, setShowOtherSelect] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 states
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [size, setSize] = useState('');
  const [breed, setBreed] = useState('');

  // Step 3 states
  const [temperaments, setTemperaments] = useState<string[]>([]);
  const [showMimuId, setShowMimuId] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const mimuIdRef = useRef<HTMLDivElement>(null);

  // Multi-pet states
  const [showFamilyList, setShowFamilyList] = useState(false);
  const [createdPets, setCreatedPets] = useState<Array<{
    name: string;
    species: string;
    size: string;
    breed: string;
    sex: string;
    weight: string;
    birthDate: string;
    temperaments: string[];
    photoPreview: string | null;
  }>>([]);

  const temperamentOptions = [
    { value: 'playful', label: 'Brincalhão', icon: '🎾' },
    { value: 'lazy', label: 'Preguiçoso', icon: '😴' },
    { value: 'stubborn', label: 'Teimoso', icon: '🦴' },
    { value: 'protective', label: 'Protetor', icon: '🛡️' },
    { value: 'sociable', label: 'Sociável', icon: '🤝' },
    { value: 'foodie', label: 'Comilão', icon: '🍖' },
  ];

  const toggleTemperament = (value: string) => {
    if (temperaments.includes(value)) {
      setTemperaments(temperaments.filter(t => t !== value));
    } else {
      setTemperaments([...temperaments, value]);
    }
    triggerHaptic();
  };

  // Reset form for new pet
  const resetForm = () => {
    setPetName('');
    setSpecies('');
    setShowOtherSelect(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSex('');
    setWeight('');
    setBirthDate('');
    setSize('');
    setBreed('');
    setTemperaments([]);
    setStep(1);
    setShowMimuId(false);
    setShowFamilyList(false);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Share Mimu ID
  const handleShareMimuId = async () => {
    if (!mimuIdRef.current) return;

    setIsSharing(true);
    triggerHaptic();

    try {
      // Generate image from DOM element
      const dataUrl = await toPng(mimuIdRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create file from blob
      const file = new File([blob], `mimu-id-${petName.toLowerCase().replace(/\s+/g, '-')}.png`, {
        type: 'image/png',
      });

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mimu ID - ${petName}`,
          text: `Conheça ${petName}, meu novo companheiro no Mimu! 🐾`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.download = `mimu-id-${petName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error sharing Mimu ID:', error);
      alert('Erro ao compartilhar. Tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };

  // Haptic feedback function
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  // Resize and compress image
  const resizeAndCompressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas size to 200x200
          canvas.width = 200;
          canvas.height = 200;

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate crop dimensions to maintain aspect ratio
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;

          // Draw image centered and cropped
          ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200);

          // Try different quality levels to get file size between 5-10kb
          let quality = 0.7;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Could not compress image'));
                  return;
                }

                // Check file size
                const sizeKb = blob.size / 1024;

                if (sizeKb > 10 && quality > 0.3) {
                  // Too large, reduce quality
                  quality -= 0.1;
                  tryCompress();
                } else {
                  // Good size, create file
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle photo selection
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, photo: 'Por favor, selecione uma imagem válida' });
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, photo: 'Imagem muito grande. Máximo 5MB' });
      return;
    }

    setIsProcessingImage(true);
    triggerHaptic();

    try {
      // Resize and compress
      const compressedFile = await resizeAndCompressImage(file);
      setPhotoFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Clear error
      const newErrors = { ...errors };
      delete newErrors.photo;
      setErrors(newErrors);
    } catch (error) {
      setErrors({ ...errors, photo: 'Erro ao processar imagem' });
    } finally {
      setIsProcessingImage(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (step === 1) {
      // Validate step 1
      if (!petName || petName.length < 2) {
        setErrors({ name: 'Nome deve ter pelo menos 2 caracteres' });
        return;
      }
      if (!species) {
        setErrors({ species: 'Selecione uma espécie' });
        return;
      }

      // Move to step 2
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (step === 2) {
      // Validate step 2
      if (!size) {
        setErrors({ size: 'Selecione o porte do pet' });
        return;
      }
      // Only validate breed if species has specific breeds
      if (hasSpecificBreeds(species) && !breed) {
        setErrors({ breed: 'Selecione a raça do pet' });
        return;
      }
      if (!sex) {
        setErrors({ sex: 'Selecione o sexo do pet' });
        return;
      }
      if (!weight || parseFloat(weight) <= 0) {
        setErrors({ weight: 'Informe um peso válido' });
        return;
      }
      // Move to step 3
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (step === 3) {
      // Submit all data
      const formData = new FormData();
      formData.set('name', petName);
      formData.set('species', species);
      formData.set('size', size);
      // Set breed to SRD if species doesn't have specific breeds
      formData.set('breed', hasSpecificBreeds(species) ? breed : 'Sem Raça Definida (SRD)');
      formData.set('sex', sex);
      formData.set('weight', weight);
      formData.set('birthDate', birthDate);
      formData.set('temperaments', JSON.stringify(temperaments));
      if (photoFile) {
        formData.set('photo', photoFile);
      }

      startTransition(async () => {
        const result = await createPet(formData);
        if (result?.error) {
          setErrors({ [result.field]: result.error });
        } else {
          // Save pet data to createdPets array
          setCreatedPets([...createdPets, {
            name: petName,
            species,
            size,
            breed: hasSpecificBreeds(species) ? breed : 'Sem Raça Definida (SRD)',
            sex,
            weight,
            birthDate,
            temperaments,
            photoPreview,
          }]);
          // Show Mimu ID before redirect
          setShowMimuId(true);
        }
      });
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10 flex flex-col">
      {/* Header dinâmico */}
      <OnboardingHeader />


      {/* Conteúdo principal */}
      <main className="flex-1 flex items-start justify-center px-8 lg:px-16 py-10 relative">
        <div className="w-full max-w-5xl relative z-10">
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
                {step === 1 ? '33%' : step === 2 ? '66%' : '100%'} completo
              </span>
            </div>
            <div className="h-2.5 bg-[#5F7C50]/10 rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{
                  background: 'linear-gradient(to right, #4F6D45, #A6B89E)',
                }}
                initial={{ width: step === 1 ? 0 : step === 2 ? '33%' : '66%' }}
                animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
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
            key={step}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#A6B89E]/30 to-[#A6B89E]/20 border border-[#4F6D45]/20 mb-4 shadow-sm">
              <span className="text-sm font-medium text-[#4F6D45] font-sans">
                {step === 1 ? 'Novo Companheiro 🐾' : step === 2 ? 'Saúde e Detalhes 🧬' : 'Temperamento e Estilo 🎭'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#4F6D45] mb-3 font-display leading-tight">
              {step === 1 ? 'Vamos conhecer seu primeiro companheiro!' : step === 2 ? 'Informações de saúde e biometria' : 'Qual é a personalidade dele?'}
            </h1>
            <p className="text-sm md:text-base text-[#1A1A1A]/70 font-sans max-w-2xl">
              {step === 1
                ? 'Fale um pouco sobre o pet que você vai cuidar. Essas informações nos ajudarão a personalizar sua experiência.'
                : step === 2
                ? 'Esses dados nos ajudam a oferecer recomendações personalizadas de cuidados e saúde.'
                : 'Selecione os temperamentos que melhor descrevem seu companheiro. Você pode escolher quantos quiser!'}
            </p>
          </motion.div>

          {/* Formulário */}
          <form id="pet-form" onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
              <motion.div
                className="flex flex-col lg:flex-row gap-6 items-center lg:items-start"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
              {/* Foto do Pet - Centralizada no mobile, tamanho fixo */}
              <div className="flex-shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isPending || isProcessingImage}
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  disabled={isPending || isProcessingImage}
                  className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-3xl bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5 border-2 border-dashed border-[#8B7355]/40 flex flex-col items-center justify-center gap-2.5 hover:border-[#8B7355]/60 transition-all duration-200 group min-h-[128px] md:min-h-[160px] lg:min-h-[176px] shadow-sm hover:shadow-md overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {photoPreview ? (
                    <>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-sans">Alterar foto</span>
                      </div>
                    </>
                  ) : isProcessingImage ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="text-xs text-[#8B7355]/70 font-sans">
                        Processando...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#8B7355]/10 flex items-center justify-center group-hover:bg-[#8B7355]/20 transition-colors">
                        <svg className="w-6 h-6 md:w-7 md:h-7 text-[#8B7355]/60 group-hover:text-[#8B7355] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-[#8B7355]/70 group-hover:text-[#8B7355] font-sans">
                        Adicionar foto
                      </span>
                      <span className="text-[10px] text-[#8B7355]/50 font-sans">
                        JPG, PNG até 5MB
                      </span>
                    </>
                  )}
                </motion.button>
                {errors.photo && (
                  <motion.p
                    className="mt-2 text-xs text-red-500 font-sans text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.photo}
                  </motion.p>
                )}
              </div>

              {/* Informações do Pet - Largura total no mobile */}
              <div className="w-full flex-1 space-y-5">
                {/* Nome do Pet */}
                <div>
                  <label htmlFor="petName" className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans flex items-center gap-2">
                    <span>Nome do pet</span>
                    <span className="text-xs text-[#1A1A1A]/40 font-normal">*obrigatório</span>
                  </label>
                  <input
                    type="text"
                    id="petName"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    disabled={isPending}
                    className={`w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border-2 transition-all duration-200 text-sm shadow-sm ${
                      errors.name
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#4F6D45]/20 focus:border-[#4F6D45] hover:border-[#4F6D45]/30'
                    } focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/10 text-[#1A1A1A] font-sans disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#1A1A1A]/40`}
                    placeholder="Ex: Rex, Mimi, Bob..."
                  />
                  {errors.name && (
                    <motion.p
                      className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Espécie */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-3 font-sans flex items-center gap-2">
                    <span>Espécie</span>
                    <span className="text-xs text-[#1A1A1A]/40 font-normal">*obrigatório</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Cão */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSpecies('dog');
                        setShowOtherSelect(false);
                        triggerHaptic();
                      }}
                      className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[90px] md:min-h-[100px] shadow-sm ${
                        species === 'dog'
                          ? 'border-[#4F6D45] bg-gradient-to-br from-[#4F6D45]/10 to-[#4F6D45]/5 shadow-md ring-2 ring-[#4F6D45]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#4F6D45]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                        species === 'dog' ? 'bg-[#4F6D45] shadow-lg' : 'bg-[#A6B89E]/30'
                      }`}>
                        <span className="text-xl md:text-2xl">🐕</span>
                      </div>
                      <span className={`text-xs md:text-sm font-medium font-sans ${
                        species === 'dog' ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
                      }`}>
                        Cão
                      </span>
                    </motion.button>

                    {/* Gato */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSpecies('cat');
                        setShowOtherSelect(false);
                        triggerHaptic();
                      }}
                      className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[90px] md:min-h-[100px] shadow-sm ${
                        species === 'cat'
                          ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5 shadow-md ring-2 ring-[#8B7355]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#8B7355]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                        species === 'cat' ? 'bg-[#8B7355] shadow-lg' : 'bg-[#A6B89E]/30'
                      }`}>
                        <span className="text-xl md:text-2xl">🐈</span>
                      </div>
                      <span className={`text-xs md:text-sm font-medium font-sans ${
                        species === 'cat' ? 'text-[#8B7355]' : 'text-[#1A1A1A]'
                      }`}>
                        Gato
                      </span>
                    </motion.button>

                    {/* Outro */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setShowOtherSelect(true);
                        if (species === 'dog' || species === 'cat') {
                          setSpecies('');
                        }
                        triggerHaptic();
                      }}
                      className={`p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[90px] md:min-h-[100px] shadow-sm ${
                        showOtherSelect
                          ? 'border-[#A6B89E] bg-gradient-to-br from-[#A6B89E]/20 to-[#A6B89E]/10 shadow-md ring-2 ring-[#A6B89E]/30'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#A6B89E] hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                        showOtherSelect ? 'bg-[#A6B89E] shadow-lg' : 'bg-[#A6B89E]/20'
                      }`}>
                        <span className="text-xl md:text-2xl">🐾</span>
                      </div>
                      <span className={`text-xs md:text-sm font-medium font-sans ${
                        showOtherSelect ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
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
            </>
            )}

            {step === 2 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Sexo */}
                {/* Porte */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-3 font-sans flex items-center gap-2">
                    <span>Porte</span>
                    <span className="text-xs text-[#1A1A1A]/40 font-normal">*obrigatório</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Pequeno */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSize('small');
                        triggerHaptic();
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[100px] shadow-sm ${
                        size === 'small'
                          ? 'border-[#4F6D45] bg-gradient-to-br from-[#4F6D45]/10 to-[#4F6D45]/5 shadow-md ring-2 ring-[#4F6D45]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#4F6D45]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`text-3xl ${size === 'small' ? 'scale-110' : ''} transition-transform`}>
                        🐾
                      </div>
                      <span className={`text-sm font-medium font-sans ${
                        size === 'small' ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
                      }`}>
                        Pequeno
                      </span>
                    </motion.button>

                    {/* Médio */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSize('medium');
                        triggerHaptic();
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[100px] shadow-sm ${
                        size === 'medium'
                          ? 'border-[#4F6D45] bg-gradient-to-br from-[#4F6D45]/10 to-[#4F6D45]/5 shadow-md ring-2 ring-[#4F6D45]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#4F6D45]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`text-3xl ${size === 'medium' ? 'scale-110' : ''} transition-transform`}>
                        🐕
                      </div>
                      <span className={`text-sm font-medium font-sans ${
                        size === 'medium' ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
                      }`}>
                        Médio
                      </span>
                    </motion.button>

                    {/* Grande */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSize('large');
                        triggerHaptic();
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[100px] shadow-sm ${
                        size === 'large'
                          ? 'border-[#4F6D45] bg-gradient-to-br from-[#4F6D45]/10 to-[#4F6D45]/5 shadow-md ring-2 ring-[#4F6D45]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#4F6D45]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`text-3xl ${size === 'large' ? 'scale-110' : ''} transition-transform`}>
                        🦮
                      </div>
                      <span className={`text-sm font-medium font-sans ${
                        size === 'large' ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
                      }`}>
                        Grande
                      </span>
                    </motion.button>
                  </div>
                  {errors.size && (
                    <p className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.size}
                    </p>
                  )}
                </div>

                {/* Raça - só mostra se tiver raças específicas */}
                {hasSpecificBreeds(species) && (
                  <div className="mb-6">
                    <label htmlFor="breed" className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans flex items-center gap-2">
                      <span>Raça</span>
                      <span className="text-xs text-[#1A1A1A]/40 font-normal">*obrigatório</span>
                    </label>
                    <BreedSelect
                      species={species}
                      value={breed}
                      onChange={setBreed}
                      error={errors.breed}
                      disabled={isPending}
                    />
                  </div>
                )}

                {/* Sexo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-3 font-sans flex items-center gap-2">
                    <span>Sexo</span>
                    <span className="text-xs text-[#1A1A1A]/40 font-normal">*obrigatório</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Macho */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSex('male');
                        triggerHaptic();
                      }}
                      className={`p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 min-h-[110px] shadow-sm ${
                        sex === 'male'
                          ? 'border-[#4F6D45] bg-gradient-to-br from-[#4F6D45]/10 to-[#4F6D45]/5 shadow-md ring-2 ring-[#4F6D45]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#4F6D45]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        sex === 'male' ? 'bg-[#4F6D45] shadow-lg' : 'bg-[#A6B89E]/30'
                      }`}>
                        <svg className={`w-6 h-6 ${sex === 'male' ? 'text-white' : 'text-[#4F6D45]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4v6m0 0l-6-6m6 6l-6 6m-8-2a6 6 0 100-12 6 6 0 000 12z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium font-sans ${
                        sex === 'male' ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
                      }`}>
                        Macho
                      </span>
                    </motion.button>

                    {/* Fêmea */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSex('female');
                        triggerHaptic();
                      }}
                      className={`p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 min-h-[110px] shadow-sm ${
                        sex === 'female'
                          ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/10 to-[#8B7355]/5 shadow-md ring-2 ring-[#8B7355]/20'
                          : 'border-[#4F6D45]/20 bg-white hover:border-[#8B7355]/40 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        sex === 'female' ? 'bg-[#8B7355] shadow-lg' : 'bg-[#A6B89E]/30'
                      }`}>
                        <svg className={`w-6 h-6 ${sex === 'female' ? 'text-white' : 'text-[#8B7355]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a6 6 0 100-12 6 6 0 000 12zm0 0v8m-4-4h8" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium font-sans ${
                        sex === 'female' ? 'text-[#8B7355]' : 'text-[#1A1A1A]'
                      }`}>
                        Fêmea
                      </span>
                    </motion.button>
                  </div>
                  {errors.sex && (
                    <motion.p
                      className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.sex}
                    </motion.p>
                  )}
                </div>

                {/* Peso */}
                <div className="mb-6">
                  <label htmlFor="weight" className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans flex items-center gap-2">
                    <span>Peso aproximado</span>
                    <span className="text-xs text-[#1A1A1A]/40 font-normal">*obrigatório</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      step="0.1"
                      min="0"
                      required
                      disabled={isPending}
                      className={`w-full px-4 py-3 pr-12 min-h-[48px] rounded-xl bg-white border-2 transition-all duration-200 text-sm shadow-sm ${
                        errors.weight
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-[#4F6D45]/20 focus:border-[#4F6D45] hover:border-[#4F6D45]/30'
                      } focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/10 text-[#1A1A1A] font-sans disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#1A1A1A]/40`}
                      placeholder="Ex: 5.5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#1A1A1A]/50 font-sans">
                      kg
                    </span>
                  </div>
                  {errors.weight && (
                    <motion.p
                      className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.weight}
                    </motion.p>
                  )}
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-[#1A1A1A] mb-2 font-sans flex items-center gap-2">
                    <span>Data de nascimento</span>
                    <span className="text-xs text-[#1A1A1A]/40 font-normal">opcional</span>
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isPending}
                    className={`w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border-2 transition-all duration-200 text-sm shadow-sm ${
                      errors.birthDate
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#4F6D45]/20 focus:border-[#4F6D45] hover:border-[#4F6D45]/30'
                    } focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/10 text-[#1A1A1A] font-sans disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {errors.birthDate && (
                    <motion.p
                      className="mt-2 text-xs text-red-500 font-sans flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.birthDate}
                    </motion.p>
                  )}
                </div>

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
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Temperamentos */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-4 font-sans">
                    Temperamento
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {temperamentOptions.map((temp) => (
                      <motion.button
                        key={temp.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleTemperament(temp.value)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 min-h-[100px] shadow-sm ${
                          temperaments.includes(temp.value)
                            ? 'border-[#A6B89E] bg-gradient-to-br from-[#A6B89E]/20 to-[#A6B89E]/10 shadow-md ring-2 ring-[#A6B89E]/30'
                            : 'border-[#4F6D45]/20 bg-white hover:border-[#A6B89E]/40 hover:shadow-md'
                        }`}
                      >
                        <span className="text-3xl">{temp.icon}</span>
                        <span className={`text-sm font-medium font-sans ${
                          temperaments.includes(temp.value) ? 'text-[#4F6D45]' : 'text-[#1A1A1A]'
                        }`}>
                          {temp.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

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
            <div className="border-t-2 border-[#4F6D45]/10 mb-6"></div>
            <div className="flex items-center justify-between">
              {step > 1 && (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="px-6 py-2.5 rounded-2xl bg-white border-2 border-[#4F6D45]/20 text-[#4F6D45] text-sm font-medium hover:bg-[#4F6D45]/5 focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/20 transition-all duration-200 font-sans flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Voltar</span>
                </motion.button>
              )}
              <motion.button
                type="submit"
                form="pet-form"
                disabled={isPending || (step === 1 && (!petName || !species)) || (step === 2 && (!size || (hasSpecificBreeds(species) && !breed) || !sex || !weight))}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className={`${step === 1 ? 'ml-auto' : ''} px-8 py-3 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#4F6D45] to-[#4F6D45]/90 text-white text-sm font-medium hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#4F6D45]/20 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center justify-center gap-2 group`}
              >
                {isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 3 ? 'Finalizar e Conhecer o Mimu' : 'Continuar'}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="border-t border-[#4F6D45]/5 pt-6">
            <p className="text-center text-xs text-[#1A1A1A]/40 font-sans">
              © 2026 Mimu
            </p>
          </div>
        </div>
      </footer>

      {/* Mimu ID Modal */}
      {showMimuId && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#4F6D45', '#A6B89E', '#8B7355'][i % 3],
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Mimu ID Card */}
          <motion.div
            ref={mimuIdRef}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="text-center mb-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#A6B89E]/30 to-[#A6B89E]/20 border border-[#4F6D45]/20 mb-3">
                <span className="text-xs font-medium text-[#4F6D45] font-sans">
                  Mimu ID Criado! 🎉
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#4F6D45] font-display mb-1">
                Passaporte Digital
              </h2>
              <p className="text-xs text-[#1A1A1A]/70 font-sans">
                Seu companheiro agora faz parte da família Mimu
              </p>
            </div>

            {/* Pet Card */}
            <div className="bg-gradient-to-br from-[#F5F5F0] to-[#A6B89E]/10 rounded-2xl p-5 mb-4 relative z-10">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={petName}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#A6B89E]/30 flex items-center justify-center border-4 border-white shadow-lg flex-shrink-0">
                      <span className="text-2xl">🐾</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#4F6D45] font-display truncate">{petName}</h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-sans capitalize">
                      {species === 'dog' ? 'Cão' : species === 'cat' ? 'Gato' : 'Outro'} · {sex === 'male' ? 'Macho' : 'Fêmea'}
                    </p>
                  </div>
                </div>
                {/* Logo ao lado do nome */}
                <div className="flex-shrink-0">
                  <Logo className="w-16 h-auto opacity-80" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/50 rounded-xl p-2.5">
                  <p className="text-[#1A1A1A]/50 font-sans text-[10px] mb-0.5">Peso</p>
                  <p className="text-[#4F6D45] font-semibold font-sans text-sm">{weight} kg</p>
                </div>
                <div className="bg-white/50 rounded-xl p-2.5">
                  <p className="text-[#1A1A1A]/50 font-sans text-[10px] mb-0.5">Nascimento</p>
                  <p className="text-[#4F6D45] font-semibold font-sans text-sm">
                    {new Date(birthDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {temperaments.length > 0 && (
                <div className="mt-3">
                  <p className="text-[#1A1A1A]/50 font-sans text-[10px] mb-2">Temperamento</p>
                  <div className="flex flex-wrap gap-1.5">
                    {temperaments.map((temp) => {
                      const option = temperamentOptions.find(t => t.value === temp);
                      return (
                        <span key={temp} className="px-2.5 py-1 bg-white/70 rounded-full text-[10px] font-sans text-[#4F6D45]">
                          {option?.icon} {option?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 relative z-10">
              <motion.button
                onClick={handleShareMimuId}
                disabled={isSharing}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#A6B89E] to-[#A6B89E]/90 text-[#4F6D45] font-medium hover:shadow-xl transition-all duration-200 shadow-lg font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isSharing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Gerando Mimu ID...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Compartilhar Mimu ID</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={() => {
                  setShowMimuId(false);
                  setShowFamilyList(true);
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2.5 rounded-2xl bg-transparent border-2 border-[#4F6D45]/20 text-[#4F6D45] font-medium hover:bg-[#4F6D45]/5 hover:border-[#4F6D45]/40 transition-all duration-200 font-sans text-sm"
              >
                Adicionar Novo Pet
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/dashboard'}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#4F6D45] to-[#4F6D45]/90 text-white font-medium hover:shadow-xl transition-all duration-200 shadow-lg font-sans text-sm"
              >
                Ir para o Dashboard
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Family List View */}
      {showFamilyList && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#4F6D45] font-display mb-2">
                Sua Família Mimu
              </h2>
              <p className="text-sm text-[#1A1A1A]/70 font-sans">
                {createdPets.length} {createdPets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'} nesta sessão
              </p>
            </div>

            {/* Pet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {createdPets.map((pet, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-[#F5F5F0] to-[#A6B89E]/10 rounded-2xl p-4 border-2 border-[#4F6D45]/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {pet.photoPreview ? (
                      <img
                        src={pet.photoPreview}
                        alt={pet.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#A6B89E]/30 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-xl">🐾</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-[#4F6D45] font-display">{pet.name}</h3>
                      <p className="text-xs text-[#1A1A1A]/70 font-sans capitalize">
                        {pet.species === 'dog' ? 'Cão' : pet.species === 'cat' ? 'Gato' : 'Outro'} · {pet.sex === 'male' ? 'Macho' : 'Fêmea'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/50 rounded-lg p-2">
                      <p className="text-[#1A1A1A]/50 font-sans text-[9px]">Porte</p>
                      <p className="text-[#4F6D45] font-semibold font-sans">
                        {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Médio' : 'Grande'}
                      </p>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2">
                      <p className="text-[#1A1A1A]/50 font-sans text-[9px]">Raça</p>
                      <p className="text-[#4F6D45] font-semibold font-sans truncate">{pet.breed}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={resetForm}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F6D45] to-[#4F6D45]/90 text-white font-medium hover:shadow-xl transition-all duration-200 shadow-lg font-sans text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Adicionar Mais um Pet</span>
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/dashboard'}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-2xl bg-transparent border-2 border-[#4F6D45]/20 text-[#4F6D45] font-medium hover:bg-[#4F6D45]/5 hover:border-[#4F6D45]/40 transition-all duration-200 font-sans text-sm"
              >
                Ir para o Dashboard
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
