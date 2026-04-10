## HANDOFF TO CLAUDE CODE — SLICE-EXTRACTION
**Date:** 2026-03-15
**Classification:** 🔴 GOVERNANCE (replaces stub with real AI pipeline)
**Slice spec:** .governance/slices/active/SLICE-EXTRACTION.md
**Doctrine:** .governance/invariants/POE-DOCTRINE.md
**Interface contract:** .governance/invariants/interface-contract.md

---

### CONTEXT

You are the Builder. Read the slice spec before writing any code.
Stack: Next.js 16, TypeScript, Tailwind v4, Anthropic SDK (already installed).
Live URL: perspective.super-intelligent.ai
Git hash to build on: ab1ed25

---

### WHAT TO BUILD

**1. Replace `src/app/api/orient/route.ts`**

Replace the stub entirely with a real Claude API call:

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are the Perspective Orientation Engine extraction layer.

Your function is topological mapping, not evaluation.

FOUNDATIONAL AXIOM:
All claims submitted are treated as TRUE-BY-ASSUMPTION.
You never question, challenge, or evaluate the truth of any claim.
You map WHERE claims live in the orientation space — not WHETHER they are valid.

YOUR TASK:
Given a brain dump, extract 5-15 discrete claims.
For each claim, map it across four axes.
Return structured JSON only. No prose. No preamble. No explanation.

FORBIDDEN:
- Never ask "How do you know?"
- Never say "This seems uncertain" or imply doubt
- Never evaluate, judge, or qualify any claim
- Never introduce information not present in the brain dump
- Never suggest what the user should do
- Never reframe a claim as a "problem to solve"

OUTPUT FORMAT (JSON only — no markdown fences, no prose):
{
  "claims": [
    {
      "id": "c1",
      "text": "exact or near-exact phrase from brain dump",
      "quadrant": "UL" | "UR" | "LL" | "LR",
      "domain": "Clear" | "Complicated" | "Complex" | "Chaotic" | "Confused",
      "reasoning": "Deductive" | "Inductive" | "Abductive" | "Unknown",
      "relevance": "High" | "Medium" | "Low",
      "inferred": false
    }
  ],
  "socratic_needed": false,
  "central_claim_id": "c1"
}

AXIS DEFINITIONS:

AQAL Quadrant (Wilber):
- UL: Upper-Left — interior/individual — subjective experience, thoughts, feelings
- UR: Upper-Right — exterior/individual — body, behavior, observable actions
- LL: Lower-Left — interior/collective — culture, shared meaning, "we" space
- LR: Lower-Right — exterior/collective — systems, structures, environment

Cynefin Domain (Snowden):
- Clear: cause-effect obvious, best practice applies
- Complicated: cause-effect requires expertise to analyze
- Complex: cause-effect only visible in retrospect, emergent
- Chaotic: no cause-effect, act first
- Confused: domain genuinely unclear

Reasoning Mode:
- Deductive: from general principle to specific conclusion
- Inductive: from specific observations to general pattern
- Abductive: best available explanation given incomplete data
- Unknown: cannot be determined

Observer Relevance (Vervaeke):
- High: directly present, actively shaping attention
- Medium: present but backgrounded
- Low: peripheral, mentioned but not load-bearing

RULES:
- Extract claims as close to the user's own language as possible
- claims array: minimum 5, maximum 15
- inferred: true only if you had to infer a claim not explicitly stated
- central_claim_id: the claim that most anchors the orientation
- socratic_needed: true only if critical map coordinates are genuinely missing`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brainDump } = body

    if (!brainDump || typeof brainDump !== 'string' || brainDump.trim().length === 0) {
      return NextResponse.json(
        { error: 'Orientation could not be mapped. Please try again.' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: brainDump }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip any accidental markdown fences
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/orient] Error:', err)
    return NextResponse.json(
      { error: 'Orientation could not be mapped. Please try again.' },
      { status: 500 }
    )
  }
}
```

**2. Create `src/components/OrientTransition.tsx`**

Full-height transitional screen. Replaces Zones 2-4 while API call runs.

```typescript
'use client'

export default function OrientTransition() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24">
      <div className="w-2 h-2 rounded-full bg-[var(--poe-accent)] animate-pulse mb-8"
           style={{ animationDuration: '2s' }} />
      <p className="text-[var(--poe-text-primary)] text-lg font-light tracking-wide mb-3">
        Orientation in progress.
      </p>
      <p className="text-[var(--poe-text-secondary)] text-sm">
        Mapping your situation across multiple perspectives.
      </p>
    </div>
  )
}
```

**3. Create `src/components/OrientResults.tsx`**

Renders the orientation output as claim cards.

- Heading: "Orientation Map Generated" (verbatim)
- One card per claim showing:
  - Claim text (--poe-text-primary)
  - Four badge pills: quadrant | domain | reasoning | relevance
  - Badge styling: small, uppercase, letter-spaced, --poe-surface bg, --poe-border border
  - Quadrant badge color hint: UL=blue-ish, UR=green-ish, LL=purple-ish, LR=amber-ish (subtle, muted)
- Central claim card has a subtle left border accent (--poe-accent)
- At bottom: "Orient again" — small link, --poe-text-secondary, resets to input
- Error state: if result.error exists, show error message + "Try again" link
- Never show raw JSON to user
- Never use evaluative language in UI labels

**4. Update `src/app/page.tsx`**

Add three states to the page: 'input' | 'loading' | 'results'

- 'input': current first screen (default)
- 'loading': show OrientTransition, hide Zones 2-4
- 'results': show OrientResults with the API response

State transitions:
- Orient clicked → 'loading' (immediately, before API call)
- API responds → 'results'
- "Orient again" clicked → 'input' (reset textarea too)
- On API error → back to 'input', show error on Orient button

Pass setPageState and setOrientResult down to OrientInput.
OrientInput calls setPageState('loading') before fetch,
then setOrientResult(data) and setPageState('results') on success.

---

### WHAT NOT TO TOUCH
- `.governance/` — any file
- `src/utils/supabase/` — untouched
- `src/hooks/` — untouched
- `src/components/AuthModal.tsx`, `AuthGate.tsx` — untouched
- `next.config.ts`, `tsconfig.json`, `package.json`
- Do NOT install new packages

---

### VERIFICATION CHECKPOINTS
- [ ] POST to /api/orient returns valid JSON with claims array
- [ ] Claims array has 5-15 items
- [ ] Each claim has text, quadrant, domain, reasoning, relevance, inferred
- [ ] No evaluative language in any claim text returned by AI
- [ ] Orient click → transitional screen appears immediately (before API responds)
- [ ] Transition shows "Orientation in progress." (verbatim)
- [ ] Results heading: "Orientation Map Generated" (verbatim)
- [ ] Each claim rendered as card with 4 axis badges
- [ ] Central claim has accent left border
- [ ] "Orient again" resets to input screen
- [ ] Error state shows "Orientation could not be mapped. Please try again."
- [ ] No raw JSON visible anywhere in UI
- [ ] Title bar and disclaimer visible during all states
- [ ] No console errors
- [ ] Vercel build succeeds

---

### COMMIT MESSAGE
```
S-004: SLICE-EXTRACTION — real AI orientation pipeline + transitional UI
```

---
*Handoff written by Blue Ocean — Session 2 — 2026-03-15*
