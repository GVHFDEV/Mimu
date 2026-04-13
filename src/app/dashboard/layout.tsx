'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import Image from 'next/image';

interface UserProfile {
  firstName: string;
  avatarUrl: string | null;
  initials: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Try to get avatar from Google OAuth metadata
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        // Get username from metadata or profiles table
        let username = user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name;

        // If no username in metadata, fetch from profiles table
        if (!username) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (profileData) {
            username = profileData.username;
            // Use avatar from profiles if exists and no Google avatar
            if (!googleAvatar && profileData.avatar_url) {
              setProfile({
                firstName: username.split(' ')[0],
                avatarUrl: profileData.avatar_url,
                initials: getInitials(username),
              });
              setIsLoading(false);
              return;
            }
          }
        }

        // Extract first name
        const firstName = username ? username.split(' ')[0] : 'Usuário';
        const initials = getInitials(username || 'Usuário');

        setProfile({
          firstName,
          avatarUrl: googleAvatar || null,
          initials,
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#F5F5F0] to-[#A6B89E]/10">
      {/* Header - seguindo padrão OnboardingHeader */}
      <header className="bg-[#F5F5F0]/80 backdrop-blur-sm border-b border-[#5F7C50]/10 px-8 lg:px-24 xl:px-32 py-4 sticky top-0 z-50">
        {/* Mobile: Logo centralizada */}
        <div className="flex justify-center md:hidden">
          <Logo className="w-32 h-auto" />
        </div>

        {/* Desktop: Layout completo */}
        <div className="hidden md:flex items-center justify-between">
          <Logo className="w-32 h-auto" />

          <div className="flex items-center gap-6">
            {/* Botão Rotina */}
            <button
              onClick={() => router.push('/dashboard/routine')}
              className="px-4 py-2 text-sm text-[#141414]/60 hover:text-[#141414] transition-colors font-sans"
            >
              Rotina
            </button>

            {/* Divisória */}
            <div className="w-px h-8 bg-[#5F7C50]/20" />

            {/* Área de perfil com dropdown */}
            <div className="relative" ref={dropdownRef}>
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5F7C50]/20 animate-pulse" />
                  <div className="w-20 h-4 bg-[#5F7C50]/20 rounded animate-pulse" />
                </div>
              ) : profile ? (
                <motion.button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  {profile.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#5F7C50]/20">
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.firstName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center text-white font-display text-sm shadow-md">
                      {profile.initials}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#141414] font-sans">
                    {profile.firstName}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#5F7C50] transition-transform ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5F7C50] to-[#A6B89E] flex items-center justify-center text-white font-display text-sm">
                    US
                  </div>
                  <span className="text-sm font-medium text-[#141414] font-sans">
                    Usuário
                  </span>
                </div>
              )}

              {/* Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#5F7C50]/10 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/settings');
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors font-sans flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Configurações
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-sans flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#5F7C50]/10 z-40">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center justify-center gap-1 text-[#5F7C50] bg-[#5F7C50]/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-[10px] font-medium font-sans">Home</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/routine')}
            className="flex flex-col items-center justify-center gap-1 text-[#1A1A1A]/40 hover:text-[#5F7C50] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[10px] font-medium font-sans">Rotina</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1 text-[#1A1A1A]/40 hover:text-[#5F7C50] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-[10px] font-medium font-sans">Loja</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1 text-[#1A1A1A]/40 hover:text-[#5F7C50] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-[10px] font-medium font-sans">Conta</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1 text-[#1A1A1A]/40 hover:text-[#5F7C50] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-[10px] font-medium font-sans">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
