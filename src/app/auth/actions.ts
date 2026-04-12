'use server';

import { createClient } from '@/lib/supabase/server';
import { signUpSchema, loginSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signUp(formData: FormData) {
  const rawData = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    country: formData.get('country') as string,
  };

  const validation = signUpSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
      field: validation.error.issues[0].path[0] as string,
    };
  }

  const { username, email, password, country } = validation.data;

  const supabase = await createClient();

  // Check username uniqueness before creating user
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (existingProfile) {
    return {
      success: false,
      error: 'Este nome de usuário já está em uso',
      field: 'username',
    };
  }

  // Create user with metadata - trigger will handle profile creation
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        country,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (authError) {
    return {
      success: false,
      error: authError.message === 'User already registered'
        ? 'Este e-mail já está cadastrado'
        : authError.message,
      field: 'email',
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: 'Erro ao criar conta. Tente novamente.',
      field: 'general',
    };
  }

  // Check if session was created (email confirmation disabled)
  if (authData.session) {
    // User is automatically logged in, redirect to dashboard
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  // No session (email confirmation enabled), show success card
  return {
    success: true,
    email,
  };
}

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validation = loginSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
      field: validation.error.issues[0].path[0] as string,
    };
  }

  const { email, password } = validation.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'E-mail ou senha incorretos',
      field: 'general',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function completeProfile(formData: FormData) {
  const username = formData.get('username') as string;
  const country = formData.get('country') as string;

  // Validate
  if (!username || username.length < 2) {
    return { error: 'Nome deve ter pelo menos 2 caracteres', field: 'username' };
  }
  if (!country) {
    return { error: 'Selecione um país', field: 'country' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado', field: 'general' };
  }

  // Check username uniqueness
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (existingProfile) {
    return { error: 'Este nome já está em uso', field: 'username' };
  }

  // Create profile
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    country,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return { error: 'Erro ao salvar perfil', field: 'general' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function createPet(formData: FormData) {
  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const size = formData.get('size') as string;
  const breed = formData.get('breed') as string;
  const photo = formData.get('photo') as File | null;
  const sex = formData.get('sex') as string;
  const weight = formData.get('weight') as string;
  const birthDate = formData.get('birthDate') as string;
  const temperamentsJson = formData.get('temperaments') as string;

  let temperaments: string[] = [];
  try {
    temperaments = temperamentsJson ? JSON.parse(temperamentsJson) : [];
  } catch (e) {
    temperaments = [];
  }

  // Validate
  if (!name || name.length < 2) {
    return { error: 'Nome deve ter pelo menos 2 caracteres', field: 'name' };
  }
  if (!species || !['dog', 'cat', 'other'].includes(species)) {
    return { error: 'Selecione uma espécie válida', field: 'species' };
  }
  if (!size || !['small', 'medium', 'large'].includes(size)) {
    return { error: 'Selecione o porte do pet', field: 'size' };
  }
  // Breed is optional - only validate if provided
  if (breed && breed.length < 2) {
    return { error: 'Raça inválida', field: 'breed' };
  }
  if (!sex || !['male', 'female'].includes(sex)) {
    return { error: 'Selecione o sexo do pet', field: 'sex' };
  }
  if (!weight || parseFloat(weight) <= 0) {
    return { error: 'Informe um peso válido', field: 'weight' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado', field: 'general' };
  }

  let photoUrl: string | null = null;

  // Upload photo if provided
  if (photo && photo.size > 0) {
    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, photo, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: 'Erro ao fazer upload da foto', field: 'photo' };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName);

      photoUrl = publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      return { error: 'Erro ao processar foto', field: 'photo' };
    }
  }

  // Create pet
  const { error } = await supabase.from('pets').insert({
    owner_id: user.id,
    name,
    species,
    size,
    breed: breed || 'Sem Raça Definida (SRD)',
    sex,
    weight: parseFloat(weight),
    birth_date: birthDate || null,
    tags: temperaments,
    photo_url: photoUrl,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Pet creation error:', error);
    return { error: 'Erro ao cadastrar pet. Tente novamente.', field: 'general' };
  }

  return { success: true };
}
