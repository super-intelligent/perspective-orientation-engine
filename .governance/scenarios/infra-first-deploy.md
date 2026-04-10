# SCENARIO: Infrastructure First Deploy
## Slice: SLICE-INFRA
## Classification: 🔵 NEW SLICE
## Author: Blue Ocean (Foreman)
## Date: 2026-03-14

---

## Preconditions
- GitHub repo exists and is empty
- Supabase project exists with URL + anon key
- Lenovo has Git 2.51+ and Node.js installed
- Vercel account ready to import from GitHub

## Walkthrough

**Step 1:** A developer opens a terminal in the staging-app directory.
They run `npm run dev`. The Next.js dev server starts.
- They see: localhost:3000 loads without errors.

**Step 2:** They open localhost:3000 in a browser.
- They see: a dark page (#0f1117 background) with:
  - "PERSPECTIVE ORIENTATION ENGINE" in white, large, bold
  - "A multi-ontology orientation instrument" below in muted text
  - The tagline: "The system does not evaluate reality.
    It stabilizes orientation toward it." centered, in green (#10b981)

- The page has no scrolling content, no navigation, no buttons yet.
- It is a single centered composition. Calm. Observatory aesthetic.

**Step 3:** They push to GitHub. Vercel auto-deploys.
- They see: the Vercel deployment URL shows the exact same page.
- HTTPS is working. No console errors.

**Step 4:** They check package.json.
- They see: all 6 additional dependencies listed
  (@supabase/supabase-js, @anthropic-ai/sdk, d3, framer-motion,
  zustand, zod)

**Step 5:** They check src/utils/supabase/.
- They see: client.ts and server.ts exist.
- client.ts exports a createClient function using the public env vars.
- server.ts exports a createServerClient using service role key.

## Checkpoints

- [ ] CP-1: `npm run dev` succeeds with zero errors
- [ ] CP-2: Browser shows POE title + subtitle + tagline on dark bg
- [ ] CP-3: Vercel deployment matches local exactly
- [ ] CP-4: package.json lists all 6 dependencies
- [ ] CP-5: src/utils/supabase/client.ts exists and is syntactically valid
- [ ] CP-6: No forbidden vocabulary on the placeholder page

## Perlocutionary Checkpoints (POE-Specific)

- [ ] PC-1: Looking at the placeholder, does it feel like an
  ORIENTATION INSTRUMENT or a generic SaaS app? (Must feel like
  an instrument — dark, calm, precise, observatory aesthetic.)
- [ ] PC-2: Does the tagline feel like a philosophical statement
  or a marketing slogan? (Must feel philosophical.)

## Error Scenarios

**What if Vercel doesn't auto-deploy?**
- Russell imports the repo manually in Vercel dashboard.
- Expected: deploy succeeds after manual import.

**What if env vars are missing on Vercel?**
- Russell adds them in Vercel → Settings → Environment Variables.
- The placeholder page doesn't use them yet, so no runtime error.
- They'll be needed for SLICE-EXTRACTION.

## Invariants Referenced
- `invariants/POE-DOCTRINE.md` — vocabulary governance on placeholder
- `invariants/interface-contract.md` — Axiom 1 (minimum viable surface)

---
*Scenario written by Blue Ocean — Session 1*
*This scenario is BUILD-FACING (visible to Claude Code)*
