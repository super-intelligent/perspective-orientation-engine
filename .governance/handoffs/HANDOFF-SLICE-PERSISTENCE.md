# HANDOFF — SLICE-PERSISTENCE
# Classification: 🟡 YELLOW (new route + API change + table)
# Date: 2026-03-23
# From: Blue Ocean (Foreman)
# To: Claude Code (Builder)
# Commit message: S-006: Orientation persistence — auto-save + retrieval by URL

---

## CONTEXT

Orientations vanish when the browser closes. This slice adds:
- Auto-save every orientation to Supabase after extraction
- Unique URL per orientation (/orient/[id])
- Retrievable results page that loads from database
- No auth required (anonymous saves — auth is still bypassed)

## DESIGN DECISIONS (made by Blue Ocean)
- Auto-save: every Orient click saves automatically, no manual button
- Anonymous: no login required, no user_id, no tenant_id for now
- Shareable: the URL /orient/[id] is shareable and works for anyone
- Auth and tenancy will be layered on later when SLICE-AUTH is unparked

---

## PART 1: SUPABASE TABLE (Russell pastes this SQL)

After Claude Code finishes building, output this block clearly labeled:

═══════════════════════════════════════════════
RUSSELL — PASTE THIS SQL INTO SUPABASE SQL EDITOR
═══════════════════════════════════════════════

```sql
create table public.orientations (
  id            uuid primary key default gen_random_uuid(),
  brain_dump    text not null,
  result_json   jsonb not null,
  field_coherence text,
  central_archetype text,
  created_at    timestamptz default now()
);

-- Allow anyone to read orientations (shareable URLs)
alter table public.orientations enable row level security;

create policy "Anyone can read orientations"
  on public.orientations for select
  using (true);

create policy "Service role can insert orientations"
  on public.orientations for insert
  with check (true);
```

═══════════════════════════════════════════════

Note: No user_id, no tenant_id. Anonymous for now. Auth layered later.

---

## PART 2: API ROUTE CHANGES

### File: src/app/api/orient/route.ts

After the existing Claude API call succeeds and the result JSON is parsed,
ADD a Supabase insert to save the orientation. Then return the orientation
ID alongside the result.

Add this import at the top:
```typescript
import { createClient } from '@supabase/supabase-js'
```

Add this helper near the top (after imports):
```typescript
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

After `const result = JSON.parse(cleaned)`, add:
```typescript
// Save orientation to Supabase
let orientationId: string | null = null
try {
  const supabase = getServiceClient()
  const { data: saved, error: saveError } = await supabase
    .from('orientations')
    .insert({
      brain_dump: brainDump,
      result_json: result,
      field_coherence: result.field_coherence ?? null,
      central_archetype: result.gravity_structure?.center_archetype ?? null,
    })
    .select('id')
    .single()

  if (!saveError && saved) {
    orientationId = saved.id
  }
} catch (saveErr) {
  console.error('[/api/orient] Save error (non-fatal):', saveErr)
}
```

Change the return statement to include the orientation ID:
```typescript
return NextResponse.json({ ...result, orientation_id: orientationId })
```

The save is NON-FATAL — if it fails, the orientation still returns to the user.
The orientation_id will be null if save failed, which the frontend handles.

### New File: src/app/api/orient/[id]/route.ts

Create this new API route to fetch a saved orientation:

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('orientations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Orientation not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    brain_dump: data.brain_dump,
    ...data.result_json,
    orientation_id: data.id,
    created_at: data.created_at,
  })
}
```

---

## PART 3: NEW PAGE — /orient/[id]

### New File: src/app/orient/[id]/page.tsx

This page loads a saved orientation by UUID and renders it.

```typescript
import { Metadata } from 'next'
import OrientationViewer from '@/components/OrientationViewer'

export const metadata: Metadata = {
  title: 'Orientation — Perspective Orientation Engine',
}

export default function OrientationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <OrientationViewer paramsPromise={params} />
}
```

### New File: src/components/OrientationViewer.tsx

Client component that fetches and displays the saved orientation:

```typescript
'use client'

import { useEffect, useState, use } from 'react'
import OrientResults from '@/components/OrientResults'
import Link from 'next/link'

export default function OrientationViewer({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>
}) {
  const { id } = use(paramsPromise)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [brainDump, setBrainDump] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/orient/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setBrainDump(data.brain_dump ?? null)
          setResult(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load orientation.')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
        <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center px-6 z-10">
          <Link href="/" className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)] hover:text-[var(--poe-accent)] transition-colors">
            PERSPECTIVE ORIENTATION ENGINE
          </Link>
        </header>
        <main className="flex-1 pt-12 flex flex-col items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--poe-accent)] animate-pulse" style={{ animationDuration: '2s' }} />
          <p className="text-[var(--poe-text-secondary)] mt-4 text-sm">Loading orientation...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
        <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center px-6 z-10">
          <Link href="/" className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)] hover:text-[var(--poe-accent)] transition-colors">
            PERSPECTIVE ORIENTATION ENGINE
          </Link>
        </header>
        <main className="flex-1 pt-12 flex flex-col items-center justify-center">
          <p className="text-[var(--poe-text-primary)] mb-4">{error}</p>
          <Link href="/" className="text-sm text-[var(--poe-accent)] hover:underline">Start a new orientation</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center justify-between px-6 z-10">
        <Link href="/" className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)] hover:text-[var(--poe-accent)] transition-colors">
          PERSPECTIVE ORIENTATION ENGINE
        </Link>
        <p className="text-[10px] text-[var(--poe-text-muted)]">
          Saved orientation
        </p>
      </header>
      <main className="flex-1 pt-12 flex flex-col">
        <div className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col">
          {brainDump && (
            <details className="mb-6">
              <summary className="text-xs text-[var(--poe-text-secondary)] cursor-pointer hover:text-[var(--poe-text-primary)] transition-colors">
                Original brain dump
              </summary>
              <p className="mt-2 text-sm text-[var(--poe-text-secondary)] bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded p-4 whitespace-pre-wrap">
                {brainDump}
              </p>
            </details>
          )}
          {result && (
            <OrientResults result={result} onReset={() => window.location.href = '/'} />
          )}
        </div>
        <footer className="w-full px-6 py-6 text-center">
          <p className="text-[11px] text-[var(--poe-text-muted)] max-w-3xl mx-auto leading-relaxed">
            This system does not determine truth or prescribe action.
            It visualizes how claims, experiences, and narratives distribute across
            multiple ontological perspectives and complexity domains.
            Its purpose is orientation, not verification.
          </p>
        </footer>
      </main>
    </div>
  )
}
```

---

## PART 4: FRONTEND CHANGES — Auto-save + URL update

### File: src/app/page.tsx

After the Orient results come back and are displayed, the frontend should:
1. Check if `orientation_id` is in the result
2. If present, update the browser URL to /orient/[id] using window.history.pushState
3. Show a small "Link copied" affordance so the user knows the URL is shareable

Add this to the Home component, after the existing state declarations:

```typescript
const [orientationUrl, setOrientationUrl] = useState<string | null>(null)
```

Modify the section where onResult is called. In page.tsx, the onResult
prop is `setOrientResult`. After setting the result, check for the ID:

Add a useEffect that watches for orientResult changes:
```typescript
useEffect(() => {
  if (orientResult && 'orientation_id' in orientResult && orientResult.orientation_id) {
    const url = `/orient/${orientResult.orientation_id}`
    window.history.pushState({}, '', url)
    setOrientationUrl(`${window.location.origin}${url}`)
  }
}, [orientResult])
```

In the results section of the JSX, add a shareable link display
ABOVE the OrientResults component:

```tsx
{pageState === 'results' && orientResult && (
  <>
    {orientationUrl && (
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[11px] text-[var(--poe-text-muted)]">
          Saved — shareable link:
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(orientationUrl)
          }}
          className="text-[11px] text-[var(--poe-accent)] hover:underline"
        >
          Copy link
        </button>
      </div>
    )}
    <OrientResults result={orientResult} onReset={handleReset} />
  </>
)}
```

This replaces the existing results rendering block in page.tsx.

---

## PART 5: VERIFICATION

After building, verify:

1. Run `npx next build` — must compile with zero errors
2. Run dev server, submit a brain dump, verify:
   - Results appear as before
   - Browser URL changes to /orient/[uuid]
   - "Saved — shareable link" text appears with Copy link button
3. Copy the URL, open a NEW browser tab, paste the URL
   - The saved orientation loads with all claims, archetypes, gravity
   - "Original brain dump" expandable section shows the input text
   - "Orient again" button redirects to home page
4. Verify no console errors

## COMMIT

```
S-006: Orientation persistence — auto-save + retrieval by URL

- Orientations auto-saved to Supabase after extraction
- New /orient/[id] route loads saved orientations
- Browser URL updates to shareable link after Orient completes
- Copy link button for sharing saved orientations
- Original brain dump preserved and viewable on saved page
- Non-fatal save: if Supabase fails, orientation still returns to user
```

Push to main.

---

## SUMMARY OF NEW/MODIFIED FILES

New files:
- src/app/api/orient/[id]/route.ts (fetch saved orientation by UUID)
- src/app/orient/[id]/page.tsx (saved orientation page shell)
- src/components/OrientationViewer.tsx (client component for loading/displaying)

Modified files:
- src/app/api/orient/route.ts (add Supabase save after extraction)
- src/app/page.tsx (add URL update + shareable link display)


---

# CORRECTIONS ADDED BY BLUE OCEAN (Anti-Rush Review, 2026-03-23)

## CORRECTION 1: handleReset must also reset the URL

In PART 4, the handleReset function in page.tsx currently only resets
React state. After pushState changes the URL to /orient/[id], clicking
"Orient again" would show the input form but leave the URL on /orient/[id].

CHANGE the handleReset function to:
```typescript
const handleReset = () => {
  setPageState('input')
  setOrientResult(null)
  setOrientationUrl(null)
  window.history.pushState({}, '', '/')
}
```

This clears the result, the saved URL, AND resets the browser URL to /.

## CORRECTION 2: Add Suspense boundary to the orient/[id] page

The OrientationViewer component uses React's `use()` hook to unwrap the
params Promise. While Next.js 16 typically resolves this before hydration,
a Suspense boundary is safer.

CHANGE src/app/orient/[id]/page.tsx to:
```typescript
import { Suspense } from 'react'
import { Metadata } from 'next'
import OrientationViewer from '@/components/OrientationViewer'

export const metadata: Metadata = {
  title: 'Orientation — Perspective Orientation Engine',
}

export default function OrientationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--poe-bg)] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[var(--poe-accent)] animate-pulse" style={{ animationDuration: '2s' }} />
      </div>
    }>
      <OrientationViewer paramsPromise={params} />
    </Suspense>
  )
}
```

## CORRECTION 3: Add UUID format validation on retrieval route

In src/app/api/orient/[id]/route.ts, add a UUID format check before
hitting Supabase. This prevents ugly Postgres errors on bad URLs.

Add this at the top of the GET function, after extracting the id:
```typescript
// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!uuidRegex.test(id)) {
  return NextResponse.json(
    { error: 'Orientation not found.' },
    { status: 404 }
  )
}
```

## CORRECTION 4: Use anon key for reads, service key for writes

The retrieval route (/api/orient/[id]) only READS orientations. The
select RLS policy is `using (true)` (anyone can read). So use the anon
key, not the service role key. This is more secure — doesn't expose
the service key unnecessarily.

CHANGE the retrieval route's createClient call to:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Keep the service role key ONLY in the orient POST route (for inserts).

## CORRECTION 5: Note for future — RLS insert policy

The current insert policy `with check (true)` is intentionally permissive
for anonymous saves during development. When SLICE-AUTH is unparked,
this policy MUST be tightened to:
```sql
create policy "Authenticated users can insert"
  on public.orientations for insert
  with check (auth.uid() is not null);
```

Add this as a comment in the SQL block that Russell pastes:
```sql
-- NOTE: Insert policy is wide open for dev. Tighten when auth is unparked.
```

## ADDITIONAL REVIEW NOTES (no changes needed, just verified)

1. `@supabase/supabase-js` is already installed (v2.99.1) — the
   `createClient` import will work without npm install.

2. Next.js 16.1.6 params are Promises — the `params: Promise<{ id: string }>`
   pattern in the API route and `use()` in the client component are correct
   for this version.

3. The `result_json` JSONB column will store the raw Claude output WITHOUT
   the `orientation_id` field (which is added at response time). This is
   correct — the ID lives in the row, not inside the JSON.

4. The non-fatal save pattern means the API response time is not blocked
   by Supabase latency. If the DB is slow or down, the user still gets
   their orientation instantly.

5. The existing OrientResults component receives the result as a prop and
   renders it identically whether it comes from a fresh API call or a
   saved database fetch. No changes to OrientResults needed.

---

END OF CORRECTIONS. The handoff with these 5 corrections applied is
ready for Claude Code.
