# SLICE-EXTRACTION — AI Orientation Pipeline
## Classification: 🔴 GOVERNANCE (modifies what AI does with user input)
## Author: Blue Ocean (Foreman)
## Date: 2026-03-15
## Status: READY FOR BUILD

---

## What This Slice Does

Replaces the /api/orient stub with a real Claude API call.
Takes the user's brain dump, extracts 5-15 claims, places each
claim across the four POE axes, and returns structured JSON.
The UI transitions to a full "Orientation in progress..." screen
while the API call runs, then renders the raw JSON result.
(Visualization comes in SLICE-VIZ-FIELD — this slice proves the pipeline.)

---

## The Four Axes (extraction targets per claim)

1. **AQAL Quadrant** (Wilber)
   - UL: Upper-Left (Interior-Individual) — subjective experience, thoughts, feelings
   - UR: Upper-Right (Exterior-Individual) — body, behavior, observable actions
   - LL: Lower-Left (Interior-Collective) — culture, shared meaning, "we" space
   - LR: Lower-Right (Exterior-Collective) — systems, structures, environment

2. **Cynefin Domain** (Snowden)
   - Clear: cause-effect obvious, best practice applies
   - Complicated: cause-effect requires expertise to analyze
   - Complex: cause-effect only visible in retrospect, emergent
   - Chaotic: no cause-effect relationship, act first
   - Confused: domain unclear (use sparingly)

3. **Reasoning Mode**
   - Deductive: from general principle to specific conclusion
   - Inductive: from specific observations to general pattern
   - Abductive: best available explanation given incomplete data
   - Unknown: cannot be determined from the claim

4. **Observer Relevance** (Vervaeke — relevance realization)
   - High: directly present to the user, actively shaping attention
   - Medium: present but backgrounded
   - Low: peripheral, mentioned but not load-bearing

---

## System Prompt (The Constitutional Document)

The extraction system prompt is the most sensitive file in the project.
It must pass the Gyroscope Test on every line.

```
You are the Perspective Orientation Engine extraction layer.

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

ALLOWED QUESTION TYPES (only if claim is genuinely incomplete):
- Quadrant completion: "Is there an internal response to include?"
- Claim boundary: "Which claim is the central node?"
- Domain cue: "Do outcomes repeat reliably or vary?"
- Temporal scope: "One-time or recurring?"
- Language posture: "Description, request, commitment, or warning?"

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

RULES:
- Extract claims as close to the user's own language as possible
- claims array: minimum 5, maximum 15
- inferred: true only if you had to infer a claim not explicitly stated
- central_claim_id: the claim that most anchors the orientation
- socratic_needed: true only if critical map coordinates are missing
- If socratic_needed is true, add "socratic_questions": [max 3 strings]
```

---

## UI: Transitional Screen (while API call runs)

When Orient is clicked and passes auth/gate checks:
1. The main content area (Zones 2-4) fades out
2. A full-height transitional state replaces it:
   - Centered vertically in the content area
   - A slow-pulsing animation (CSS, no library needed)
   - Text: "Orientation in progress."
   - Subtext (smaller, muted): "Mapping your situation across multiple perspectives."
   - No spinner. No progress bar. Calm, deliberate pulse.
3. When response arrives: transition state fades, results area renders

The title bar (Zone 1) and disclaimer (Zone 5) remain visible throughout.
This is not a loading screen — it's a transitional state that communicates
the epistemic weight of what's happening. Intentional, not mechanical.

---

## UI: Results Area (after successful response)

For this slice, render the raw orientation output — clean but not yet
the full D3 visualization (that's SLICE-VIZ-FIELD).

Show:
- Heading: "Orientation Map Generated" (verbatim — vocabulary governance)
- Below: a clean card for each claim showing:
  - Claim text
  - Four axis badges: Quadrant | Domain | Reasoning | Relevance
  - Muted styling, dark cards, consistent with --poe-surface
- At the bottom: small "Orient again" link that resets to the input screen

Do NOT show:
- Raw JSON
- Debug information
- Any evaluation language ("strong claim", "uncertain", etc.)

---

## Files to Create/Modify

```
src/app/api/orient/route.ts      — REPLACE stub with real Claude API call
src/components/OrientTransition.tsx  — CREATE transitional screen component
src/components/OrientResults.tsx     — CREATE results display component
src/app/page.tsx                 — ADD transition/results state management
```

## What NOT to Touch
- `.governance/` — any file
- `src/utils/supabase/` — untouched
- `src/hooks/` — untouched
- `src/components/AuthModal.tsx`, `AuthGate.tsx` — untouched
- `next.config.ts`, `tsconfig.json`, `package.json`
- Do NOT install new packages (Anthropic SDK already installed)

---

## API Route Implementation

`src/app/api/orient/route.ts` — replace stub with:
- Import Anthropic SDK: `import Anthropic from '@anthropic-ai/sdk'`
- Initialize: `const anthropic = new Anthropic()`
- Accept POST with `{ brainDump: string }`
- Validate: brainDump must be a non-empty string
- Call `anthropic.messages.create()` with:
  - model: `claude-sonnet-4-20250514`
  - max_tokens: 2000
  - system: [the full system prompt from above]
  - messages: [{ role: 'user', content: brainDump }]
- Parse response text as JSON
- Return the parsed JSON with status 200
- On parse error: return `{ error: 'Orientation could not be mapped. Please try again.' }`
- On API error: return same error message, log to console

---

## Checkpoints

- [ ] CP-1: POST to /api/orient with brain dump returns valid JSON
- [ ] CP-2: JSON contains `claims` array with 5-15 items
- [ ] CP-3: Each claim has text, quadrant, domain, reasoning, relevance
- [ ] CP-4: No claim text contains evaluative language from the AI
- [ ] CP-5: Orient click → transitional screen appears immediately
- [ ] CP-6: Transition text: "Orientation in progress." (verbatim)
- [ ] CP-7: Results heading: "Orientation Map Generated" (verbatim)
- [ ] CP-8: Each claim rendered as a card with 4 axis badges
- [ ] CP-9: "Orient again" resets to input screen
- [ ] CP-10: Error state: "Orientation could not be mapped. Please try again."
- [ ] CP-11: No raw JSON visible to user
- [ ] CP-12: Vercel build succeeds, live at perspective.super-intelligent.ai

---

## Invariants Referenced (Variable Check)

- Variable 1: Orientation vs adjudication — VERY HIGH — system prompt enforces TRUE-BY-ASSUMPTION
- Variable 3: Claim granularity — 5-15 per brain dump — enforced in prompt
- Variable 4: Tensor strictness — 4 states per axis — enforced in output format
- Variable 12: Vocabulary governance — "Orientation Map Generated" not "Analysis Complete"
- POE-DOCTRINE.md: Forbidden questions hardcoded in system prompt
- POE-DOCTRINE.md: Legal disclaimer remains on screen during transition and results

---

## Foreman Decision Log

| Decision | Rationale |
|----------|-----------|
| Complete JSON, not streaming | Robust engineering. Viz layer needs complete data to render. |
| Full transitional screen | High-impact visual. Communicates epistemic weight. |
| Results as cards, not raw JSON | Vocabulary governance — no debug data shown to users |
| claude-sonnet-4-20250514 | Extraction layer spec: Sonnet for extraction (Opus reserved for diagnostics) |
| No new packages | Anthropic SDK already installed — use it directly |

---
*Slice written by Blue Ocean — Session 2 — 2026-03-15*
*Awaiting Russell sign-off before handoff to Claude Code*
