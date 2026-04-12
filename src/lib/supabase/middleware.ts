import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes - always accessible
  const publicRoutes = [
    '/auth/callback',
    '/auth/auth-code-error',
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Auth pages - only for non-authenticated users
  const authPages = ['/login', '/signup', '/forgot-password', '/'];

  // Protected routes - require authentication
  const protectedRoutes = ['/dashboard', '/onboarding'];

  // === LOGGED OUT USER ===
  if (!user) {
    // Allow access to auth pages
    if (authPages.includes(pathname)) {
      return supabaseResponse;
    }

    // Redirect to login for any other route
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // === LOGGED IN USER ===
  
  // Block access to auth pages - redirect to dashboard
  if (authPages.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Check if user has completed onboarding (has at least one pet)
  const { data: pets, error } = await supabase
    .from('pets')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  const hasCompletedOnboarding = pets && pets.length > 0;

  // User trying to access onboarding
  if (pathname === '/onboarding') {
    // If onboarding already completed, block access and redirect to dashboard
    if (hasCompletedOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    // Allow access if not completed
    return supabaseResponse;
  }

  // User trying to access dashboard or other protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // If onboarding NOT completed, force redirect to onboarding
    if (!hasCompletedOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
    // Allow access if onboarding completed
    return supabaseResponse;
  }

  return supabaseResponse;
}
