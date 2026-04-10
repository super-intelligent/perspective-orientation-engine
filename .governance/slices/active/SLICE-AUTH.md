# SLICE-AUTH — Magic Link Authentication + Session Gating
## Classification: 🔵 NEW SLICE (New vertical behavior — identity + access control)
## Author: Blue Ocean (Foreman)
## Date: 2026-03-15
## Status: READY FOR BUILD

---

## What This Slice Does

Gates the Orient button behind email authentication.
Uses Supabase magic link (no passwords — ever).
Tracks session count per user.
Free tier: 1 orientation session lifetime.
Member tier: unlimited sessions.
The gate feels like POE — not a jarring login wall.

---

## The User Journey

### Journey A — First-time visitor (unauthenticated)
1. User arrives at perspective.super-intelligent.ai
2. Sees the 5-zone screen normally
3. Types in textarea (20+ chars)
4. Clicks "Orient"
5. Instead of API call → email capture modal appears
6. User enters email → clicks "Send orientation link"
7. Screen shows: "Check your email. Your orientation link is waiting."
8. User clicks link in email → returns to site, authenticated
9. Orient button now works → calls /api/orient
10. Session count incremented to 1

### Journey B — Returning free-tier user (1 session used)
1. User arrives, already authenticated
2. Sees 5-zone screen normally
3. Clicks "Orient"
4. Sees gating message (see Zone copy below)
5. CTA to upgrade (placeholder link for now — SLICE-GATING handles full flow)

### Journey C — Member user (authenticated, unlimited)
1. User arrives, already authenticated
2. Sees 5-zone screen normally
3. Clicks "Orient" → works, no gate

---

## UI Changes

### Email capture modal (Journey A)
- Appears OVER the first screen (not a new page)
- Dark overlay, centered card — consistent with --poe-surface
- Heading: "Orient requires an email."
- Subtext: "We send a one-time link. No password. No account setup."
- Email input field, full width
- Button: "Send orientation link" — same green accent as Orient button
- Below button (small, muted): "You get one free orientation. Members get unlimited."
- No social login. No OAuth. Magic link only.
- Vocabulary check: "Orient" not "Login". "Orientation link" not "magic link".

### Post-send confirmation (Journey A, step 7)
- Modal content replaced with:
  "Check your email. Your orientation link is waiting."
- No spinner. No countdown. Just the message, centered, calm.
- Small link below: "Resend link" (calls same endpoint again)

### Free-tier gate message (Journey B)
- Replaces the modal with a gating card:
  Heading: "Your free orientation is complete."
  Body: "Members orient without limits."
  CTA button: "Become a member" → placeholder href="#" for now
- Tone: matter-of-fact, not guilt-based. Variable 6: gentle.
- Never: "You've used your free trial!" or anything promotional.

### Auth state in title bar
- When authenticated: show email address (truncated) far right of title bar
- When unauthenticated: show nothing (the right side stays empty)
- No "Login" / "Sign out" buttons cluttering the bar
- Sign out: only accessible via clicking the email address → small dropdown
  with one item: "Sign out"

---

## Supabase Configuration (Claude Code provides exact steps — Russell pastes/clicks)

Claude Code will output three things for Russell to action in Supabase:

**1. Auth URL settings** (Authentication → URL Configuration in Supabase dashboard)
Claude Code outputs the exact values to paste.

**2. SQL to run** (Supabase dashboard → SQL Editor → New query → paste → Run)
Claude Code outputs the complete SQL block.

**3. Email template subject** (Authentication → Email Templates → Magic Link)
Claude Code outputs the exact subject line to set.

Russell does not need to figure out any of this — Claude Code provides copy-paste ready instructions as part of its build output.

---

## New Files to Create

```
src/app/auth/callback/route.ts     — Supabase auth callback handler
src/components/AuthModal.tsx        — Email capture + confirmation modal
src/components/AuthGate.tsx         — Free tier gating card
src/hooks/useAuth.ts                — Auth state hook (user, loading, signOut)
src/hooks/useSessionCount.ts        — Session count hook
```

## Files to Modify

```
src/app/page.tsx                    — Wire auth state to Orient button behavior
src/components/OrientInput.tsx      — Replace API call with auth check first
src/app/layout.tsx                  — Wrap with Supabase session provider
```

---

## Auth Callback Route

`src/app/auth/callback/route.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)) }}
    )
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL('/', request.url))
}
```

---

## Orient Button Logic (updated flow)

```
User clicks "Orient"
  → if unauthenticated → show AuthModal
  → if authenticated + session_count >= 1 + not member → show AuthGate
  → if authenticated + (session_count === 0 OR member) → call /api/orient
```

Member check: user has `is_member: true` in user metadata (set manually
for now — SLICE-GATING handles upgrade flow later).

---

## Checkpoints (Each must PASS or FAIL)

- [ ] CP-1: Unauthenticated user clicks Orient → AuthModal appears
- [ ] CP-2: AuthModal heading is "Orient requires an email." (verbatim)
- [ ] CP-3: Email submitted → confirmation message appears (no page reload)
- [ ] CP-4: Magic link in email redirects to perspective.super-intelligent.ai
- [ ] CP-5: After redirect, user is authenticated (title bar shows email)
- [ ] CP-6: Authenticated user with 0 sessions → Orient calls /api/orient
- [ ] CP-7: Session count increments to 1 after successful Orient call
- [ ] CP-8: Authenticated free-tier user with 1+ sessions → AuthGate appears
- [ ] CP-9: AuthGate heading: "Your free orientation is complete." (verbatim)
- [ ] CP-10: "Become a member" CTA present, href="#" placeholder
- [ ] CP-11: Authenticated user email visible (truncated) in title bar top right
- [ ] CP-12: Clicking email in title bar → dropdown with "Sign out" only
- [ ] CP-13: Sign out clears session, title bar returns to empty
- [ ] CP-14: No console errors on any journey
- [ ] CP-15: Vercel build succeeds after push

---

## Invariants Referenced

- POE-DOCTRINE.md: Vocabulary governance (Variable 12)
  — "Orient" not "Login", "Orientation link" not "magic link"
  — Gate copy is matter-of-fact, never guilt-based (Variable 6: gentle)
- interface-contract.md:
  — Axiom 8: Modal only appears for a decision that cannot proceed otherwise ✓
  — Axiom 1: Minimum viable surface — modal has email + button only
  — Axiom 4: Actions narrated — confirmation message on send
  — Axiom 6: Errors specific — "Invalid email" not "Something went wrong"

---

## Error Scenarios

**Invalid email format**
→ Inline error below input: "Please enter a valid email address."

**Supabase send fails**
→ Inline error: "Couldn't send the link. Please try again."
→ Never silent failure

**Auth callback fails (bad/expired code)**
→ Redirect to / with query param ?error=auth_failed
→ Page shows small banner: "That link has expired. Try again."

---

## Foreman Decision Log

| Decision | Rationale |
|----------|-----------|
| Magic link only, no OAuth | Doctrine purity — no third-party identity signals entering the system |
| Modal over new page | Preserves orientation context — user stays on the first screen |
| "Orient requires an email" not "Sign in" | Vocabulary governance — framed as continuation, not interruption |
| Free tier = 1 session lifetime (not per month) | Creates genuine upgrade incentive without artificial reset complexity |
| Member check via user metadata | Simplest path — no extra table needed until SLICE-GATING |
| No "Login"/"Sign out" in nav | Axiom 1: minimum viable surface. Auth is ambient, not featured. |

---

## Notes for Builder

- Use `@supabase/ssr` package (already installed) for server-side auth
- Use `createBrowserClient` from `@supabase/ssr` for client components
- The `user_sessions` table must exist in Supabase before this slice works
  (Russell creates it manually per the Supabase Configuration section above)
- Do NOT implement the upgrade/payment flow — href="#" placeholder only
- Do NOT modify any governance files
- Commit message: `S-003: SLICE-AUTH — magic link auth + session gating`

---
*Slice written by Blue Ocean — Session 2 — 2026-03-15*
*Awaiting Russell sign-off + Supabase table creation before handoff to Claude Code*
