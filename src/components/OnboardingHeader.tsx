'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import Image from 'next/image';

interface UserProfile {
  firstName: string;
  avatarUrl: string | null;
  initials: string;
}

export function OnboardingHeader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
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
  }, []);

  function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <header className="bg-[#F5F5F0]/80 backdrop-blur-sm border-b border-[#5F7C50]/10 px-8 lg:px-24 xl:px-32 py-4 sticky top-0 z-50">
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
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5F7C50]/20 animate-pulse" />
              <div className="w-20 h-4 bg-[#5F7C50]/20 rounded animate-pulse" />
            </div>
          ) : profile ? (
            <motion.div
              className="flex items-center gap-3"
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
            </motion.div>
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
        </div>
      </div>
    </header>
  );
}
