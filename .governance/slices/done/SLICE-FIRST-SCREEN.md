# SLICE-FIRST-SCREEN — The 5-Zone First Screen
## Classification: 🔵 NEW SLICE (New vertical behavior — the primary user-facing entry point)
## Author: Blue Ocean (Foreman)
## Date: 2026-03-15
## Status: READY FOR BUILD

---

## What This Slice Does

Replaces the placeholder page with the real first screen.
Five zones, rendered in order, dark theme, full-viewport.
This is the only screen the user sees before submitting their brain dump.
It ends with the user clicking Submit — triggering the orientation pipeline.

The Submit button wires to a stub `/api/orient` route that returns a
hardcoded JSON response. This makes the full flow testable end-to-end
without requiring the real AI extraction logic (SLICE-EXTRACTION handles that).

---

## The Five Zones (Top to Bottom)

### Zone 1 — Title Bar (fixed top, minimal)
- POE wordmark: "PERSPECTIVE ORIENTATION ENGINE"
- Typeset small, uppercase, letter-spaced — not a hero heading
- Far right: placeholder avatar/auth area (empty for now — SLICE-AUTH handles it)
- Height: ~48px. Never dominates. The instrument, not the brand.

### Zone 2 — Opening Frame
- One line: the operational tagline
- `"The system does not evaluate reality. It stabilizes orientation toward it."`
- Centered, muted — sets epistemic context before the user types
- This is the only text that frames expectations. Nothing else.

### Zone 3 — Disorder Statement (the invitation)
- A single sentence inviting the brain dump. Something like:
  `"Describe your current situation. Whatever feels most present."`
- NOT a prompt list. NOT bullet points. NOT guiding questions.
- The entry point is subjective — we do not pre-shape it.
- Doctrine: Axiom 2 (entry point is subjective), Axiom 3 (disorder is natural)

### Zone 4 — Input Area (the heart of the screen)
- Large textarea. Minimal chrome.
- No character count. No formatting toolbar. No guidance text inside.
- Placeholder text (fades on focus): `"Begin here."`
- Minimum height: 280px. Expands with content.
- Submit button below the textarea — full width, dark fill, white text
- Button label: `"Orient"` — not "Submit", not "Analyze", not "Send"
- Button is disabled until textarea has at least 20 characters
- On click: button shows loading state, calls `/api/orient` stub

### Zone 5 — Reinforcement (bottom, subtle)
- The legal disclaimer from POE-DOCTRINE.md, rendered small and muted:
  `"This system does not determine truth or prescribe action. It visualizes
  how claims, experiences, and narratives distribute across multiple
  ontological perspectives and complexity domains. Its purpose is
  orientation, not verification."`
- Font size: ~11px. Color: very muted. Always visible, never prominent.
- Axiom 8: Interruption is Earned — this is ambient, not a modal.

---

## The `/api/orient` Stub (to be replaced in SLICE-EXTRACTION)

Create `src/app/api/orient/route.ts` that:
- Accepts POST with `{ brainDump: string }`
- Returns hardcoded JSON:
```json
{
  "status": "stub",
  "message": "Orientation pipeline not yet connected.",
  "received": true
}
```
- Logs the received brain dump to console (for dev verification)
- Returns 200 always

This stub is ONLY for flow testing. SLICE-EXTRACTION replaces it entirely.

---

## Design Tokens (use CSS variables — all in globals.css)

```css
--poe-bg: #0a0a0a;
--poe-surface: #111111;
--poe-border: #1f1f1f;
--poe-text-primary: #f0f0f0;
--poe-text-secondary: #6b6b6b;
--poe-text-muted: #3a3a3a;
--poe-accent: #4ade80;       /* green — orientation, not evaluation */
--poe-accent-dim: #166534;
```

Title bar: `--poe-surface` background, `--poe-border` bottom border
Tagline: `--poe-text-secondary`
Disorder statement: `--poe-text-primary` but lighter weight
Textarea: `--poe-surface` bg, `--poe-border` border, `--poe-text-primary` text
Orient button: `--poe-accent` bg, black text, full width
Disclaimer: `--poe-text-muted`

---

## File Changes (Builder scope — touch ONLY these files)

```
src/app/page.tsx          — REPLACE entirely with 5-zone layout
src/app/globals.css       — ADD design tokens (keep existing @import)
src/app/api/orient/route.ts  — CREATE new file (stub API route)
```

**DO NOT TOUCH:**
- Any governance files in `.governance/`
- `src/utils/supabase/` — untouched until SLICE-DATABASE
- `next.config.ts`, `tsconfig.json`, `package.json`
- Any existing dependencies

---

## Checkpoints (Each must PASS or FAIL — no partial credit)

- [ ] CP-1: All 5 zones render on localhost:3000 in correct vertical order
- [ ] CP-2: Title bar is fixed, ~48px, does not dominate
- [ ] CP-3: Tagline renders exactly as specified (no paraphrase)
- [ ] CP-4: Textarea placeholder is "Begin here." — fades on focus
- [ ] CP-5: Orient button is disabled until 20+ characters entered
- [ ] CP-6: Orient button shows loading state on click
- [ ] CP-7: POST to `/api/orient` returns `{ status: "stub", received: true }`
- [ ] CP-8: Legal disclaimer is visible but muted (11px, --poe-text-muted)
- [ ] CP-9: Dark theme consistent across all zones (no white backgrounds)
- [ ] CP-10: No console errors on page load
- [ ] CP-11: Vercel deployment builds successfully after git push

---

## Error Scenarios

**Textarea too short — Orient button stays disabled**
Expected: Button remains greyed out, no API call made

**API route missing — POST fails**
Expected: Button shows error state, user sees:
"Something went wrong. Please try again." (Axiom 6 — errors are specific)
Never: Silent failure, spinner that never stops

**Network offline**
Expected: Same error state as above, never a crash

---

## Invariants Referenced

- `POE-DOCTRINE.md` — Axiom 2 (subjective entry), Axiom 3 (disorder natural),
  Axiom 4 (TRUE-BY-ASSUMPTION — no evaluative language anywhere on screen),
  Three Ethical NOTs (no problem-solving framing), Forbidden Questions (none present),
  Vocabulary governance (Orient not Submit/Analyze, Situation not Problem),
  Legal disclaimer (verbatim)
- `interface-contract.md` — Axiom 1 (minimum viable surface — nothing on screen
  that doesn't serve orientation), Axiom 4 (actions narrated — loading state on Orient),
  Axiom 5 (hierarchy by density — tagline recedes, input dominates),
  Axiom 8 (interruption earned — disclaimer ambient, not modal)

---

## Notes for Builder

- This is a React Server Component for the page shell, Client Component for
  the textarea + button (need useState for character count and loading state)
- Mark the interactive zone `"use client"` — extract as `<OrientInput />` component
- No external UI libraries — build from scratch with Tailwind utilities only
- The font is the system font stack — no custom fonts in this slice
- Mobile-responsive: textarea full width on all viewports
- Commit message format: `S-002: SLICE-FIRST-SCREEN — 5-zone entry screen + /api/orient stub`

---

## Foreman Decision Log

| Decision | Rationale |
|----------|-----------|
| Textarea minimal chrome, no guiding text | Axiom 2: entry point is subjective. Pre-shaping violates doctrine. |
| Button label "Orient" not "Submit" | Vocabulary governance: navigational not clinical |
| Stub API wired up | Flow testable end-to-end. Dead-end UI slice creates false "done". |
| Disclaimer always visible | Legal requirement from POE-DOCTRINE.md. Ambient = compliant. |
| 20-char minimum before Orient enables | Prevents empty/accidental submissions. Not a truth gate. |

---
*Slice written by Blue Ocean — Session 2 — 2026-03-15*
*Awaiting Russell sign-off before handoff to Claude Code*
