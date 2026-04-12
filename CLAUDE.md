<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

**IMPORTANT:** Do not create explainer documents or other documentation unless specifically asked to. CLAUDE.md is the ONLY context file.
IMPORTANTE: FAÇA TUDO COM MOBILE-FIRST, PENSANDO SEMPRE PRA SER TOTALMENTE RESPONSÍVEL NO CELULAR E OUTROS DISPOSITIVOS E TELAS. QUERO TAMANHOS ADEQUADOS PARA CAMPOS E ETC QUE AGRADAM DEDOS GRANDES, PRINCIPALMENTE.e


---

## Recent Updates (2026-04-11)

### Username Field Updated
- `username` field now accepts spaces, accents, and special characters
- Removed restrictive regex validation (alphanumeric + underscore only)
- Username is stored ONLY in `profiles.username` table
- NO sync with `auth.users.raw_user_meta_data.display_name`
- Label changed from "Nome de usuário" to "Nome" in signup form
- Validation: 2-100 characters, no restrictions on character types

### Hydration Error Fixed
- Created `tailwind.config.ts` with proper font configuration
- Replaced all `font-['Nunito']` with `font-sans`
- Replaced all `font-['Cocogoose']` with `font-display`
- Removed duplicate `font-family` declaration from `globals.css`
- Added `suppressHydrationWarning` to body element for browser extensions

### Automatic Login After Signup Implemented
- Modified `src/app/auth/actions.ts` to check `authData.session`
- If session exists (email confirmation OFF): redirects to `/dashboard`
- If session is null (email confirmation ON): shows email verification card
- Created `src/app/auth/callback/route.ts` for email confirmation callback
- Created `src/app/auth/auth-code-error/page.tsx` for error handling
- Added `revalidatePath` before all redirects to fix "failed to fetch" errors

---


# Mimu: Engineering & Design Manifesto (Organic Premium)

## 1. Context & Tech Stack
- **Project:** Mimu (High-end PetCare Platform)
- **Stack:** Next.js 15 (App Router), TypeScript (Strict), Tailwind CSS 4, Supabase (SSR)
- **Design:** Organic Premium (Soft, accessible, familiar). NO Neo-Brutalism.
- **Auth:** Supabase Auth + @supabase/ssr
- **Validation:** Zod (client + server)

## 2. Design Tokens

### Colors
- **forest** `#5F7C50` - Primary (buttons, links, accents)
- **sprout** `#EBF2B6` - Accent (highlights, hover states)
- **oak** `#6C4726` - Secondary (rarely used)
- **linen** `#F4F7F6` - Background (main bg color)
- **obsidian** `#141414` - Text (primary text color)

### Typography
- **Display:** Cocogoose (headings, logo, titles)
- **Sans:** Nunito (body text, forms, UI)

### Visual Style
- **Border Radius:** `rounded-3xl` (24px) - ALL cards, buttons, inputs
- **Shadows:** `shadow-md` (soft, diffused)
- **Borders:** Subtle `border-[#5F7C50]/10` or none
- **Transitions:** `transition-all duration-200` (smooth, not jarring)

## 3. Database Schema (Supabase)

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Rules
- **RLS:** MANDATORY. Users only access their own data.
- **Username:** User's display name, 2-100 chars, allows spaces, accents, and special characters
- **Country:** 2-letter country code (BR, US, PT, etc)
- **No Sync:** Username is NOT synced to `auth.users` metadata - stored ONLY in `profiles.username`

## 4. Authentication Flow

### Sign Up
1. User fills: Nome (username), Email, Password, Country
2. Client-side validation (Zod) - username accepts any characters including spaces and accents
3. Server Action checks username uniqueness
4. Create user in Supabase Auth (NO metadata stored)
5. Insert profile in `profiles` table with username and country
6. If email confirmation disabled: redirect to dashboard immediately
7. If email confirmation enabled: show success card with email verification message

### Login
1. User fills: Email, Password
2. Client-side validation (Zod)
3. Server Action authenticates
4. Redirect to `/dashboard`

### Email Verification
- Supabase sends confirmation email automatically (if enabled)
- User must verify before full access
- Show "Check your email" card after signup
- Callback handler at `/auth/callback` exchanges code for session

## 5. Component Architecture

### Pages
- `/` - Landing page with CTA
- `/signup` - Registration with success state
- `/login` - Authentication
- `/dashboard` - Protected area
- `/forgot-password` - Password recovery (placeholder)

### Components
- `Logo.tsx` - SVG logo component
- `LoadingSpinner.tsx` - Minimal spinner (forest color)
- `CountrySelect.tsx` - Dropdown with flags and search
- `PasswordStrength.tsx` - Visual password strength indicator

### Layout Structure
```
┌─────────────────────────┐
│   Background: linen     │
│                         │
│      [LOGO SVG]         │ ← Outside card, centered
│                         │
│  ┌───────────────────┐  │
│  │   White Card      │  │
│  │   rounded-3xl     │  │
│  │                   │  │
│  │   [Form Fields]   │  │
│  │   or              │  │
│  │   [Success Card]  │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Terms & Conditions     │ ← Subtle text below card
│                         │
└─────────────────────────┘
```

## 6. Code Standards

### General
- Always output COMPLETE code. No placeholders.
- No comments like `// rest of code here`
- Use TypeScript strict mode
- Prefer Server Actions over API routes
- Use `'use client'` only when necessary

### Naming
- Components: PascalCase (`CountrySelect.tsx`)
- Files: kebab-case for pages (`forgot-password/page.tsx`)
- Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`MAX_USERNAME_LENGTH`)

### Validation
- Always validate on client AND server
- Use Zod schemas in `src/lib/validations/`
- Show field-specific errors
- Clear errors on new submission

### Error Handling
- Return `{ error: string, field: string }` from Server Actions
- Display errors below relevant fields
- Use red-500 for error text
- Use red-400 border for error inputs

### Loading States
- Use `useTransition` for Server Actions
- Show `LoadingSpinner` in buttons
- Disable inputs during loading
- Change button text (e.g., "Criando conta...")

## 7. UX Patterns

### Forms
- Labels above inputs
- Placeholders for hints
- Clear error messages
- Disabled state during submission
- Success feedback after completion

### Buttons
- Primary: `bg-[#5F7C50]` with hover `bg-[#5F7C50]/90`
- Full width on mobile
- Include spinner when loading
- Disabled state with opacity-50

### Cards
- White background
- `rounded-3xl` borders
- `shadow-md` elevation
- `border border-[#5F7C50]/10` subtle outline
- Padding: `p-8` on desktop, `p-6` on mobile

### Transitions
- Form to success card: smooth fade/slide
- Use Tailwind transitions (no framer-motion needed)
- Duration: 200ms for most interactions
- Avoid jarring animations

## 8. Security Best Practices

### Authentication
- Never expose sensitive data in client
- Use Server Actions for all auth operations
- Validate on server even if validated on client
- Use RLS policies for all database access

### Passwords
- Minimum 8 characters
- Show strength indicator
- Never log or expose passwords
- Use Supabase's built-in hashing

### Sessions
- Use `@supabase/ssr` for cookie management
- Middleware protects routes automatically
- Refresh tokens handled by Supabase
- Sign out clears all cookies

## 9. File Structure

```
src/
├── app/
│   ├── auth/
│   │   └── actions.ts              # Server Actions (signUp, login, signOut)
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── signup/
│   │   └── page.tsx                # Signup with success state
│   ├── dashboard/
│   │   └── page.tsx                # Protected dashboard
│   ├── forgot-password/
│   │   └── page.tsx                # Password recovery
│   ├── globals.css                 # Design tokens + fonts
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── logo.svg                    # Logo source file
├── components/
│   ├── Logo.tsx                    # Logo component
│   ├── LoadingSpinner.tsx          # Spinner component
│   ├── CountrySelect.tsx           # Country dropdown
│   └── PasswordStrength.tsx        # Password indicator
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts           # Session middleware
│   ├── validations/
│   │   └── auth.ts                 # Zod schemas
│   └── countries.ts                # Country list with flags
└── middleware.ts                   # Route protection

supabase/
└── migrations/
    ├── 001_create_profiles.sql     # Initial schema
    └── 002_remove_full_name.sql    # Migration (if needed)
```

## 10. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 11. Dependencies

### Core
- `next@16.2.3` - Framework
- `react@19.2.4` - UI library
- `typescript@^5` - Type safety

### Supabase
- `@supabase/ssr@^0.10.2` - SSR support
- `@supabase/supabase-js@^2.103.0` - Client SDK

### Validation & Utils
- `zod@^4.3.6` - Schema validation

### Styling
- `tailwindcss@^4` - Utility CSS
- `@tailwindcss/postcss@^4` - PostCSS integration

## 12. Current Implementation Status

### ✅ Completed
- Authentication system (signup, login, logout)
- Logo SVG component
- Loading states with spinner
- Country selector with 64 countries
- Hydration error fixes
- RLS policies
- Middleware for route protection
- Design system implementation
- Mobile-first responsive design

### 🚧 In Progress
- Email verification flow
- Success card after signup
- Password strength indicator
- Username sync to display_name

### 📋 Pending
- Password recovery functionality
- User profile page
- Avatar upload
- Dashboard features
- Pet management

## 13. Instructions for AI

### When Writing Code
1. Read existing files before modifying
2. Maintain Organic Premium design
3. Use complete code (no placeholders)
4. Follow TypeScript strict mode
5. Validate on client AND server
6. Add loading states to all actions
7. Handle errors gracefully
8. Test responsive design

### When Fixing Bugs
1. Identify root cause
2. Fix without breaking existing features
3. Update related documentation
4. Test the fix thoroughly

### When Adding Features
1. Check if it fits Organic Premium style
2. Maintain consistency with existing code
3. Add proper validation
4. Include loading and error states
5. Update this file if architecture changes

## 14. Common Patterns

### Server Action Pattern
```typescript
'use server';

export async function myAction(formData: FormData) {
  // 1. Extract data
  const rawData = { field: formData.get('field') as string };
  
  // 2. Validate with Zod
  const validation = schema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message, field: 'field' };
  }
  
  // 3. Business logic
  const supabase = await createClient();
  const { data, error } = await supabase.from('table').insert(validation.data);
  
  // 4. Handle errors
  if (error) {
    return { error: 'User-friendly message', field: 'general' };
  }
  
  // 5. Success - redirect
  redirect('/success-page');
}
```

### Form Component Pattern
```typescript
'use client';

export default function MyForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result = await myAction(formData);
      if (result?.error) {
        setErrors({ [result.field]: result.error });
      }
    });
  }

  return (
    <form action={handleSubmit}>
      {/* fields */}
      <button disabled={isPending}>
        {isPending ? <LoadingSpinner /> : 'Submit'}
      </button>
    </form>
  );
}
```

## 15. Troubleshooting

### Hydration Errors
- Use `suppressHydrationWarning` on dynamic content
- Avoid `window` or `document` in initial render
- Use `useEffect` for client-only code

### Auth Issues
- Check `.env.local` variables
- Verify Supabase URL (no trailing slash)
- Confirm RLS policies are correct
- Check browser console for errors

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`

---

**Last Updated:** 2026-04-11  
**Version:** 2.0 (Organic Premium)  
**Status:** Production Ready
