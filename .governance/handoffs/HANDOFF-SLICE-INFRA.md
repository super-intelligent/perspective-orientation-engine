# HANDOFF TO CLAUDE CODE — SLICE-INFRA
## Date: 2026-03-14
## Classification: 🔵 NEW SLICE
## Slice spec: .governance/slices/active/SLICE-INFRA.md
## Scenario: .governance/scenarios/infra-first-deploy.md

---

## WHAT TO BUILD

Initialize the Perspective Orientation Engine (POE) as a Next.js 14+
application with the full dependency stack. This is the foundation
everything else builds on.

### Step 1: Create the Next.js app

```bash
cd "C:\Users\ourpr\OneDrive\Desktop\POE-Perspective-Orientation-Engine\software"
npx create-next-app@latest staging-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd staging-app
```

### Step 2: Install dependencies

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk d3 framer-motion zustand zod
npm install -D @types/d3
```

### Step 3: Create .env.local

Create file `staging-app/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://pvrirrwgiyejsuoaohvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_E4OywSaPPD1oEB79qHFi7w_y1ZIAyig
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase-dashboard>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### Step 4: Create Supabase client utilities

Create `src/utils/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `src/utils/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

NOTE: Also install `@supabase/ssr`:
```bash
npm install @supabase/ssr
```

### Step 5: Replace src/app/page.tsx with POE placeholder

Replace the entire contents of `src/app/page.tsx` with:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          PERSPECTIVE{' '}
          <span className="text-emerald-400">ORIENTATION</span>
          {' '}ENGINE
        </h1>
        <p className="text-lg text-slate-400 mb-8">
          A multi-ontology orientation instrument
        </p>
        <p className="text-sm text-emerald-400/80 font-medium max-w-lg mx-auto leading-relaxed">
          &ldquo;The system does not evaluate reality.
          It stabilizes orientation toward it.&rdquo;
        </p>
      </div>
    </main>
  )
}
```

### Step 6: Update src/app/globals.css

Keep Tailwind directives, remove all default Next.js styles.
The file should contain ONLY:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 7: Update src/app/layout.tsx metadata

Update the metadata in `src/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: 'Perspective Orientation Engine',
  description: 'A multi-ontology orientation instrument. The system does not evaluate reality. It stabilizes orientation toward it.',
}
```

### Step 8: Git init + connect to GitHub + push

```bash
cd "C:\Users\ourpr\OneDrive\Desktop\POE-Perspective-Orientation-Engine\software\staging-app"
git init
git add -A
git commit -m "S-001: Initial POE project + governance + placeholder"
git branch -M main
git remote add origin https://github.com/super-intelligent/perspective-orientation-engine.git
git push -u origin main
```

### Step 9: Verify

```bash
npm run dev
```
Open localhost:3000 — confirm POE placeholder renders.
Open Vercel — confirm auto-deploy succeeded.

---

## WHAT NOT TO TOUCH

- Do NOT create any API routes yet (that's SLICE-EXTRACTION)
- Do NOT create any database tables (that's SLICE-DATABASE)
- Do NOT build the first screen UI yet (that's SLICE-FIRST-SCREEN)
- Do NOT set up auth yet (that's SLICE-AUTH)
- Do NOT modify .governance/ files — those are Foreman territory

## VERIFICATION

After build, confirm all of these:
1. `npm run dev` starts clean (no errors, no warnings beyond linting)
2. localhost:3000 shows dark page with POE title + tagline
3. package.json lists: @supabase/supabase-js, @supabase/ssr,
   @anthropic-ai/sdk, d3, @types/d3, framer-motion, zustand, zod
4. src/utils/supabase/client.ts and server.ts exist
5. .env.local exists with environment variables
6. Git commit pushed to GitHub
7. Vercel deployment live

---
*Handoff written by Blue Ocean (Foreman) — Session 1*
*Russell: paste this to Claude Code after providing GitHub URL + Supabase credentials*
