# SLICE-INFRA — Infrastructure Setup & First Deploy
## Classification: 🔵 NEW SLICE (New vertical behavior — the entire project foundation)
## Author: Blue Ocean (Foreman)
## Date: 2026-03-14

---

## What This Slice Does

Sets up the entire development infrastructure from zero:
- Next.js 14+ project with TypeScript + Tailwind + App Router
- Git initialized and connected to GitHub
- Supabase client configured
- Environment variables set
- First deploy to Vercel
- "Hello World" confirmation that the full stack works

## Preconditions
- Russell has created a GitHub repo (name TBD — Russell confirms)
- Russell has created a Supabase project (URL + anon key provided)
- Git is installed on the Lenovo (confirmed: v2.51.2)
- Node.js is available (verify during build)

---

## Walkthrough

**Step 1:** Developer runs `npx create-next-app@latest` in staging-app/
- TypeScript: YES
- Tailwind: YES
- ESLint: YES
- App Router: YES
- src/ directory: YES
- Import alias: @/

**Step 2:** Install project dependencies
- `@supabase/supabase-js` (Supabase client)
- `@anthropic-ai/sdk` (Claude API — used in API routes)
- `d3` + `@types/d3` (visualization — installed now, used later)
- `framer-motion` (animations — installed now, used later)
- `zustand` (client state — installed now, used later)
- `zod` (schema validation — installed now, used later)

**Step 3:** Create `.env.local` with Supabase + Anthropic keys
- NEXT_PUBLIC_SUPABASE_URL=[from Russell]
- NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Russell]
- SUPABASE_SERVICE_ROLE_KEY=[from Russell, if available]
- ANTHROPIC_API_KEY=[from Russell]

**Step 4:** Create Supabase client utility at `src/utils/supabase/`
- `client.ts` — browser client (uses anon key)
- `server.ts` — server client (uses service role key)

**Step 5:** Replace default page.tsx with POE placeholder
- Title: "PERSPECTIVE ORIENTATION ENGINE"
- Subtitle: "A multi-ontology orientation instrument"
- The operational tagline centered below
- Simple, dark background, clean typography
- This is NOT the full first screen — just proof of life

**Step 6:** Git init + first commit + push to GitHub
```
git init
git remote add origin [GITHUB_URL]
git add -A
git commit -m "S-001: Initial project + governance + POE placeholder"
git push -u origin main
```

**Step 7:** Vercel auto-deploys from GitHub push
- Russell verifies the live URL shows the POE placeholder
- Confirms: title visible, no errors, HTTPS working

---

## Checkpoints (Testable — each must PASS or FAIL)

- [ ] CP-1: `npm run dev` starts without errors on localhost:3000
- [ ] CP-2: Placeholder page shows "PERSPECTIVE ORIENTATION ENGINE" title
- [ ] CP-3: `.env.local` contains all 3-4 environment variables
- [ ] CP-4: Supabase client files exist at src/utils/supabase/
- [ ] CP-5: Git repo has initial commit and is pushed to GitHub
- [ ] CP-6: Vercel deployment is live and shows the placeholder page
- [ ] CP-7: All dependencies installed (check package.json includes
      @supabase/supabase-js, @anthropic-ai/sdk, d3, framer-motion,
      zustand, zod)

## Error Scenarios

**What if Node.js is not installed?**
- Claude Code should check `node --version` first
- If missing, instruct Russell to install Node.js LTS

**What if git push fails (auth)?**
- Russell may need to authenticate via GitHub Desktop or CLI
- Claude Code provides the commands, Russell handles auth

**What if Vercel doesn't auto-deploy?**
- Russell connects the repo manually in Vercel dashboard
- Import → Select GitHub repo → Deploy

## Invariants Referenced
- `invariants/POE-DOCTRINE.md` — placeholder text uses correct vocabulary
- `invariants/interface-contract.md` — Axiom 5 (hierarchy by density)

## Notes
- This is foundation-only. No application logic yet.
- The placeholder page should feel like POE from the first pixel:
  dark background, clean type, the tagline. Observatory aesthetic.
- All future slices build on this foundation.

---
*Slice written by Blue Ocean — Session 1*
