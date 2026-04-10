## HANDOFF TO CLAUDE CODE — SLICE-FIRST-SCREEN
**Date:** 2026-03-15
**Classification:** 🔵 NEW SLICE
**Slice spec:** .governance/slices/active/SLICE-FIRST-SCREEN.md
**Doctrine:** .governance/invariants/POE-DOCTRINE.md
**Interface contract:** .governance/invariants/interface-contract.md

---

### CONTEXT

You are the Builder. You do not evaluate your own work.
You implement exactly what is specified. Nothing more.
Read the slice spec at `.governance/slices/active/SLICE-FIRST-SCREEN.md`
before writing a single line of code.

The project is a Next.js 16 app (App Router, TypeScript, Tailwind v4).
It is live at: perspective-orientation-engine.vercel.app
Tailwind v4 syntax is already in place — globals.css uses `@import "tailwindcss"`.

---

### WHAT TO BUILD

**1. Update `src/app/globals.css`**
Add these CSS variables AFTER the existing `@import "tailwindcss"` line:

```css
:root {
  --poe-bg: #0a0a0a;
  --poe-surface: #111111;
  --poe-border: #1f1f1f;
  --poe-text-primary: #f0f0f0;
  --poe-text-secondary: #6b6b6b;
  --poe-text-muted: #3a3a3a;
  --poe-accent: #4ade80;
  --poe-accent-dim: #166534;
}
```

**2. Create `src/components/OrientInput.tsx`** (Client Component)
A textarea + button component with:
- `"use client"` directive at top
- useState for: `value` (string), `isLoading` (boolean), `error` (string | null)
- Textarea: full width, min-height 280px, expands with content,
  placeholder "Begin here." that fades on focus
- Orient button: full width, disabled when value.length < 20,
  label "Orient", shows "Orienting..." when loading
- On click: set isLoading true, POST to /api/orient with { brainDump: value },
  log response to console, set isLoading false
- On error: set error to "Something went wrong. Please try again."
  display error inline below button, never silent failure

**3. Replace `src/app/page.tsx` entirely** with 5-zone layout:

Zone 1 — Fixed title bar (top, ~48px height):
- Background: var(--poe-surface), border-bottom: 1px solid var(--poe-border)
- Left: "PERSPECTIVE ORIENTATION ENGINE" — small, uppercase, letter-spaced
- Right: empty div (placeholder for auth — do not implement auth)

Zone 2 — Tagline (centered, below title bar):
- Exact text: "The system does not evaluate reality. It stabilizes orientation toward it."
- Color: var(--poe-text-secondary)

Zone 3 — Disorder invitation:
- Exact text: "Describe your current situation. Whatever feels most present."
- Color: var(--poe-text-primary), font-weight normal
- NOT a list. NOT multiple sentences. One line only.

Zone 4 — Input area:
- Render the <OrientInput /> component here

Zone 5 — Disclaimer (bottom, always visible):
- Exact text: "This system does not determine truth or prescribe action.
  It visualizes how claims, experiences, and narratives distribute across
  multiple ontological perspectives and complexity domains.
  Its purpose is orientation, not verification."
- Font size ~11px, color: var(--poe-text-muted)

Page background: var(--poe-bg) on the html/body element.

**4. Create `src/app/api/orient/route.ts`** (stub only):
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('[/api/orient stub] Received brain dump:', body.brainDump?.slice(0, 100))
  return NextResponse.json({
    status: 'stub',
    message: 'Orientation pipeline not yet connected.',
    received: true
  })
}
```

---

### WHAT NOT TO TOUCH

- `.governance/` — any file in this directory
- `src/utils/supabase/` — untouched
- `next.config.ts`, `tsconfig.json`, `package.json`
- `public/` directory
- Any existing dependencies — do NOT install new packages

---

### VERIFICATION (run through each before committing)

- [ ] `npm run dev` starts without errors
- [ ] All 5 zones render in correct vertical order on localhost:3000
- [ ] Title bar is fixed at top, ~48px, does not dominate the page
- [ ] Tagline text is verbatim as specified
- [ ] Textarea placeholder "Begin here." fades on focus
- [ ] Orient button disabled until 20+ characters in textarea
- [ ] Orient button shows "Orienting..." while loading
- [ ] POST to /api/orient returns { status: "stub", received: true }
- [ ] Error state shows "Something went wrong. Please try again." on failure
- [ ] Legal disclaimer visible, small, muted at bottom
- [ ] No white backgrounds anywhere — full dark theme
- [ ] No console errors on page load

---

### COMMIT MESSAGE

```
S-002: SLICE-FIRST-SCREEN — 5-zone entry screen + /api/orient stub
```

Then push to main. Vercel will auto-deploy.

---
*Handoff written by Blue Ocean — Session 2*
