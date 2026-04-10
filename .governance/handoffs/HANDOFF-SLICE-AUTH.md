## HANDOFF TO CLAUDE CODE — SLICE-AUTH
**Date:** 2026-03-15
**Classification:** 🔵 NEW SLICE
**Slice spec:** .governance/slices/active/SLICE-AUTH.md
**Doctrine:** .governance/invariants/POE-DOCTRINE.md
**Interface contract:** .governance/invariants/interface-contract.md

---

### CONTEXT

You are the Builder. Read the slice spec before writing any code.
Stack: Next.js 16, TypeScript, Tailwind v4, Supabase (@supabase/ssr already installed).
Live URL: perspective.super-intelligent.ai

At the END of your build, output a "RUSSELL ACTION REQUIRED" block
with exact copy-paste instructions for Supabase. Russell does not
configure Supabase manually — you tell him exactly what to do.

---

### WHAT TO BUILD

**1. Auth callback route**
Create `src/app/auth/callback/route.ts`:
- Handles the Supabase magic link redirect
- Exchanges code for session
- Redirects to / after successful auth

**2. useAuth hook**
Create `src/hooks/useAuth.ts` (client-side):
- Returns: { user, loading, signOut }
- Uses createBrowserClient from @supabase/ssr
- Listens to onAuthStateChange
- signOut calls supabase.auth.signOut()

**3. useSessionCount hook**
Create `src/hooks/useSessionCount.ts` (client-side):
- Returns: { count, loading, increment }
- Queries user_sessions table for current user's row count
- increment() inserts a new row with { user_id, completed: false }

**4. AuthModal component**
Create `src/components/AuthModal.tsx` ("use client"):
- Dark overlay + centered card (--poe-surface, --poe-border)
- Heading: "Orient requires an email." (verbatim)
- Subtext: "We send a one-time link. No password. No account setup."
- Email input, full width
- Button: "Send orientation link" (--poe-accent, full width)
- Below button (small, muted): "You get one free orientation. Members get unlimited."
- On submit: call supabase.auth.signInWithOtp({ email, options: {
    emailRedirectTo: 'https://perspective.super-intelligent.ai/auth/callback' }})
- After send: replace modal content with:
  "Check your email. Your orientation link is waiting."
  + small "Resend link" button below
- On error: inline message "Couldn't send the link. Please try again."
- Invalid email: "Please enter a valid email address."

**5. AuthGate component**
Create `src/components/AuthGate.tsx` ("use client"):
- Dark overlay + centered card (same style as AuthModal)
- Heading: "Your free orientation is complete." (verbatim)
- Body: "Members orient without limits."
- Button: "Become a member" → href="#" (placeholder)
- Tone: matter-of-fact. No exclamation marks. No promotional language.

**6. Update OrientInput.tsx**
Replace the direct /api/orient call with this logic:
```
onClick:
  if not authenticated → show AuthModal
  else if sessionCount >= 1 AND not member → show AuthGate
  else → call /api/orient, then increment session count
```
Member check: user.user_metadata?.is_member === true

**7. Update page.tsx**
- Import useAuth hook
- Pass auth state down to OrientInput
- Show AuthModal or AuthGate as overlays when triggered
- Title bar right side: if authenticated show truncated email
  with onClick dropdown containing one item: "Sign out"
  If unauthenticated: empty (no button)

**8. Update layout.tsx**
Ensure the Supabase session is available server-side.
Use createServerClient from @supabase/ssr in the layout if needed.

---

### WHAT NOT TO TOUCH
- `.governance/` — any file in this directory
- `src/utils/supabase/` — already configured, do not modify
- `src/app/api/orient/route.ts` — stub stays as-is
- `next.config.ts`, `tsconfig.json`, `package.json`
- Do NOT install any new packages

---

### VERIFICATION CHECKPOINTS
- [ ] Unauthenticated user clicks Orient → AuthModal appears
- [ ] AuthModal heading: "Orient requires an email." (verbatim)
- [ ] Email submitted → confirmation message replaces modal content
- [ ] Magic link redirects to perspective.super-intelligent.ai correctly
- [ ] After redirect, user is authenticated (email shows in title bar)
- [ ] Authenticated user 0 sessions → Orient calls /api/orient
- [ ] Session count increments after successful call
- [ ] Authenticated free-tier 1+ sessions → AuthGate appears
- [ ] AuthGate heading: "Your free orientation is complete." (verbatim)
- [ ] "Become a member" CTA present, href="#"
- [ ] Email truncated in title bar top right when authenticated
- [ ] Clicking email → dropdown with "Sign out" only
- [ ] Sign out clears session, title bar returns empty
- [ ] No console errors on any journey
- [ ] Vercel build succeeds

---

### COMMIT MESSAGE
```
S-003: SLICE-AUTH — magic link auth + free tier session gating
```

---

### RUSSELL ACTION REQUIRED (output this block at the end of your build)

At the end of your build, output a clearly labeled block:

```
═══════════════════════════════════════════════
RUSSELL — 3 ACTIONS NEEDED IN SUPABASE BEFORE TESTING
═══════════════════════════════════════════════

ACTION 1 — Auth URL Settings
Go to: Supabase dashboard → Authentication → URL Configuration
Set Site URL to:
  https://perspective.super-intelligent.ai
Add to Redirect URLs:
  https://perspective.super-intelligent.ai/auth/callback

ACTION 2 — Run this SQL
Go to: Supabase dashboard → SQL Editor → New query
Paste and click Run:

  create table public.user_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    created_at timestamptz default now(),
    completed boolean default false
  );

  alter table public.user_sessions enable row level security;

  create policy "Users can read own sessions"
    on public.user_sessions for select
    using (auth.uid() = user_id);

  create policy "Users can insert own sessions"
    on public.user_sessions for insert
    with check (auth.uid() = user_id);

ACTION 3 — Email Template Subject
Go to: Supabase dashboard → Authentication → Email Templates → Magic Link
Change Subject to:
  Your orientation link

═══════════════════════════════════════════════
Once done, tell Blue Ocean — ready to test.
═══════════════════════════════════════════════
```

---
*Handoff written by Blue Ocean — Session 2 — 2026-03-15*
