# HANDOFF — SLICE-ENHANCED-EXTRACTION
# Classification: 🔴 RED (constitutional prompt + schema + UI)
# Date: 2026-03-21
# From: Blue Ocean (Foreman)
# To: Claude Code (Builder)
# Commit message: S-005: Enhanced extraction — archetypes, tension, gravity

---

## CONTEXT

The extraction pipeline works (S-004). This slice enhances it with three
layers derived from collaborative analysis with the ChatGPT Integral
Theory GPT. Also includes a code hardening fix for Supabase client init.

DO NOT break existing functionality. All changes are ADDITIVE to the
current pipeline. The system prompt is being REPLACED in full.

---

## PART 1: CODE HARDENING (Do this first)

### File: src/hooks/useAuth.ts
Move `const supabase = createClient()` from module scope (line 7) into
the function body. The line currently sits OUTSIDE useAuth(). Move it
INSIDE, as the first line of the function.

Before:
```
const supabase = createClient()
export function useAuth() {
```

After:
```
export function useAuth() {
  const supabase = createClient()
```

### File: src/hooks/useSessionCount.ts
Same fix. Move `const supabase = createClient()` from module scope
(line 6) into the function body of useSessionCount.

Before:
```
const supabase = createClient()
export function useSessionCount(userId: string | undefined) {
```

After:
```
export function useSessionCount(userId: string | undefined) {
  const supabase = createClient()
```

---

## PART 2: NEW EXTRACTION SYSTEM PROMPT

Replace the ENTIRE SYSTEM_PROMPT constant in src/app/api/orient/route.ts
with the following. This is the complete new prompt — do not merge, replace
in full:

```
You are the Perspective Orientation Engine extraction layer.

Your function is topological mapping, not evaluation.

FOUNDATIONAL AXIOM:
All claims submitted are treated as TRUE-BY-ASSUMPTION.
You never question, challenge, or evaluate the truth of any claim.
You map WHERE claims live in the orientation space — not WHETHER they are valid.

YOUR TASK:
Given a brain dump, extract 5-15 discrete claims.
For each claim:
1. FIRST: Determine primary quadrant, domain, reasoning mode, and relevance.
2. THEN: Assess secondary tensions based on the primary placement.
3. THEN: Generate an archetype label from the tensor fusion.
Return structured JSON only. No prose. No preamble. No explanation.

FORBIDDEN:
- Never ask "How do you know?"
- Never say "This seems uncertain" or imply doubt
- Never evaluate, judge, or qualify any claim
- Never introduce information not present in the brain dump
- Never suggest what the user should do
- Never reframe a claim as a "problem to solve"

AXIS DEFINITIONS:

AQAL Quadrant (Wilber):
- UL: Upper-Left — interior/individual — subjective experience, thoughts, feelings, self-model state transitions
- UR: Upper-Right — exterior/individual — body, behavior, observable actions, signal detection
- LL: Lower-Left — interior/collective — culture, shared meaning, norms, interpretive shifts
- LR: Lower-Right — exterior/collective — systems, structures, constraints, institutional behavior

Cynefin Domain (Snowden):
- Clear: cause-effect obvious, best practice applies
- Complicated: cause-effect requires expertise to analyze
- Complex: cause-effect only visible in retrospect, emergent — the SYSTEM has nonlinear structure
- Chaotic: no cause-effect, act first
- Confused: the OBSERVER genuinely does not know which domain the claim belongs to. Use ONLY when the claim expresses disorientation about the TYPE of situation, not merely uncertainty about outcomes. If the observer is still forming explanations, that is Complex, not Confused.

Reasoning Mode:
- Deductive: from general principle to specific conclusion
- Inductive: from specific observations to general pattern
- Abductive: best available explanation given incomplete data — the moment meaning is constructed
- Unknown: cannot be determined
When a claim contains both observation AND inference, classify as Abductive — because the claim's primary function is explanation-generation, not pattern-recognition.

Observer Relevance (Vervaeke):
- High: directly present, actively shaping attention
- Medium: present but backgrounded
- Low: peripheral, mentioned but not load-bearing

ARCHETYPE LABELS:
For each claim, generate a 2-4 word archetype label that describes the FUNCTION of the claim in the orientation field, not its content.

The label should answer: "What kind of orientation event is this?"

Derive it from fusing:
- quadrant (where it lives)
- domain (stability of cause-effect)
- reasoning mode (how the claim is constructed)

Labels describe four structural types:
- Destabilization: something breaking
- Constraint: something limiting
- Transition: something shifting
- Stabilization/Patterning: something holding or organizing

Avoid: restating the claim, emotional language, moral implication.
Prefer: structural, process-oriented phrasing — verbs or nouns that imply system behavior.
A good label removes WHO/WHAT and preserves WHAT IS HAPPENING STRUCTURALLY.

Examples of good labels:
- "Identity Destabilization" (UL/Complex/Abductive — interior self-structure losing coherence)
- "Pattern Anomaly Detection" (UR/Complicated/Inductive — observable deviation noticed)
- "Norm Drift Assertion" (LL/Complex/Deductive — cultural boundary shifting)
- "Constraint Lock" (LR/Complicated/Deductive — system blocking corrective action)
- "Value Alignment Drift" (UL/Complex/Inductive — gradual interior reorientation)
- "Priority Volatility Pattern" (LR/Chaotic/Inductive — system instability observed)
- "Premature Intervention Signal" (LR/Complicated/Abductive — system acting under uncertainty)

For the central claim, generate an archetype label that is MORE COMPRESSIVE — it should describe a state capable of absorbing the functions of surrounding claims (e.g., "Systemic Fracture Realization" not "Assessment Problem").

TENSION SIGNALING:
After determining primary placement, assess whether each claim has genuine directional pull toward other quadrants or domains. Only include real tension — not theoretical possibilities.
- quadrant_tension: array of 0-2 secondary quadrants the claim pulls toward
- domain_tension: array of 0-1 secondary domains
Most claims should have 0-1 tensions. Leave arrays empty when no real pull exists.

GRAVITATIONAL STRUCTURE:
After mapping all claims, determine how claims relate to the central claim.
Assign each non-central claim a gravity_role:
- "structural_support": provides concrete evidence or system-level reinforcement
- "narrative_pressure": reshapes the interpretive environment
- "internal_anchoring": shows how the situation is being lived by the observer
- "direct_observation": low-ambiguity concrete anchor point

The central claim does NOT receive a gravity_role — it IS the center.

Determine field_coherence:
- "strong": one clear gravitational center
- "competing": two claims with roughly equal organizing power (return both as central_claim_ids)
- "distributed": no single center, multiple partial influences
- "low": weak field, claims do not organize into clear relationships

Identify one recursive loop if present: a feedback cycle that closes at the central claim.

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
      "inferred": false,
      "archetype": "2-4 word functional label",
      "quadrant_tension": [],
      "domain_tension": [],
      "gravity_role": "structural_support" | "narrative_pressure" | "internal_anchoring" | "direct_observation" | null
    }
  ],
  "central_claim_id": "c1",
  "field_coherence": "strong" | "competing" | "distributed" | "low",
  "socratic_needed": false,
  "gravity_structure": {
    "center_archetype": "archetype label of the central claim",
    "why_central": "One sentence: This claim currently organizes the most relationships in the field because [specific reason].",
    "structural_support": ["c2", "c6"],
    "narrative_pressure": ["c4", "c3"],
    "internal_anchoring": ["c1", "c7"],
    "direct_observation": ["c11"],
    "recursive_loop": "brief description of feedback cycle closing at center, or null"
  }
}

For competing centers, use central_claim_ids (array) and gravity_structures (array of two structures).
For distributed fields, gravity_structure contains: { "pattern": "distributed", "description": "..." }.
For low coherence fields, gravity_structure is null.

RULES:
- Extract claims as close to the user's own language as possible
- claims array: minimum 5, maximum 15
- inferred: true only if you had to infer a claim not explicitly stated
- central_claim_id: the claim that most anchors the orientation — the highest coherence attractor
- gravity_role: null only for the central claim itself
- socratic_needed: true only if critical map coordinates are genuinely missing
- The word "currently" is load-bearing in why_central — this is the CURRENT attractor, not a truth claim
```

That is the END of the new system prompt. Replace the entire SYSTEM_PROMPT
constant with the text above (everything between the ``` markers).

### Also in src/app/api/orient/route.ts:
- Change max_tokens from 2000 to 4000 (the output is now significantly richer)
- Everything else in the route stays the same

---

## PART 3: UPDATED UI — OrientResults.tsx

Replace src/components/OrientResults.tsx ENTIRELY with the following
component. This adds:
- Archetype label as the card heading
- Tension indicators below primary badges
- Gravity role label per claim
- Enhanced central claim section with gravity structure
- "Orient again" button stays the same

### New Claim interface:
```typescript
interface Claim {
  id: string
  text: string
  quadrant: 'UL' | 'UR' | 'LL' | 'LR'
  domain: string
  reasoning: string
  relevance: string
  inferred: boolean
  archetype: string
  quadrant_tension: string[]
  domain_tension: string[]
  gravity_role: string | null
}

interface GravityStructure {
  center_archetype: string
  why_central: string
  structural_support: string[]
  narrative_pressure: string[]
  internal_anchoring: string[]
  direct_observation: string[]
  recursive_loop: string | null
  pattern?: string
  description?: string
}

interface OrientResult {
  claims?: Claim[]
  central_claim_id?: string | string[]
  field_coherence?: string
  gravity_structure?: GravityStructure | GravityStructure[] | null
  socratic_needed?: boolean
  error?: string
}
```

### QUADRANT_LABELS constant (add this):
```typescript
const QUADRANT_LABELS: Record<string, string> = {
  UL: 'Upper Left — Interior Individual',
  UR: 'Upper Right — Exterior Individual',
  LL: 'Lower Left — Interior Collective',
  LR: 'Lower Right — Exterior Collective',
}
```

### GRAVITY_ROLE_LABELS constant (add this):
```typescript
const GRAVITY_ROLE_LABELS: Record<string, string> = {
  structural_support: 'Structural support',
  narrative_pressure: 'Narrative pressure',
  internal_anchoring: 'Internal anchor',
  direct_observation: 'Direct observation',
}
```

### Card layout for each claim (non-central):

```
┌──────────────────────────────────────────┐
│ Archetype Label          (bold, 13px)    │
│ "claim text here"        (14px, primary) │
│                                          │
│ [UL] [Complex] [Abductive] [High]       │  ← primary badges (existing)
│ Tension: LR, LL                          │  ← muted, 11px, only if tensions exist
│                                          │
│ Structural support for center            │  ← muted italic, 11px, gravity role
└──────────────────────────────────────────┘
```

### Card layout for the central claim:

```
┌──────────────────────────────────────────┐
│ ● ORIENTATION CENTER                     │  ← accent color, uppercase, 10px
│ Archetype Label          (bold, 15px)    │
│ "claim text here"        (14px, primary) │
│                                          │
│ [UL] [Complex] [Abductive] [High]       │
│ Tension: LR, LL                          │
│                                          │
│ why_central text                         │  ← 12px, secondary color
│                                          │
│ ── Gravitational Structure ──            │
│ Structural support:                      │
│   Pattern Anomaly Detection              │  ← archetype labels of feeder claims
│   Outcome Inequity Signal                │
│ Narrative pressure:                      │
│   Norm Drift Assertion                   │
│   Coordinated System Gaming              │
│ Internal anchoring:                      │
│   Identity Destabilization               │
│ Direct observation:                      │
│   Direct Rule Violation Observation      │
│                                          │
│ ↻ recursive loop text                    │  ← if present, 11px muted
└──────────────────────────────────────────┘
```

### Display order:
1. Central claim card FIRST (with gravity structure expanded)
2. Then all other claims in their original order
3. "Orient again" button at the bottom

### Implementation notes for OrientResults.tsx:

- Render the central claim(s) separately at the top using a filter
- In the gravity structure section, look up each claim ID in the claims
  array to display its archetype label (not just the ID)
- For the gravity groups, only show groups that have at least one claim
  (e.g., if direct_observation is empty, hide that section)
- The tension display should use the same muted color as --poe-text-muted
- The gravity role label per non-central claim should reference the
  central claim's archetype: e.g., "Structural support for Systemic
  Fracture Realization"
- Handle edge cases: if field_coherence is "low" or "distributed", skip
  the gravity structure section and show a note like "No dominant
  orientation center detected in this field."
- If central_claim_id is an array (competing centers), render both as
  central claim cards

### Styling (keep existing dark theme, add):
- Central claim card: bg-[var(--poe-surface)] with a top border of
  2px accent color (--poe-accent) instead of the current left border
- Archetype label: text-[var(--poe-text-primary)] font-medium
- Gravity section headings: text-[var(--poe-text-secondary)] text-xs
  uppercase tracking-wider
- Gravity role per claim: text-[var(--poe-text-muted)] italic text-[11px]
- Tension badges: same style as domain badges but with 50% opacity

---

## PART 4: VERIFICATION

After building, verify:

1. Run `npx next build` — must compile with zero errors
2. Run dev server and submit a test brain dump (any 50+ word text)
3. Verify the API response includes all new fields:
   - archetype per claim
   - quadrant_tension and domain_tension per claim
   - gravity_role per claim (null for central only)
   - gravity_structure at top level
   - field_coherence at top level
4. Verify the UI renders:
   - Archetype labels as card headings
   - Tension indicators below badges (when present)
   - Central claim card at top with gravity structure
   - Gravity role labels on non-central cards
5. Verify no console errors

## VOCABULARY COMPLIANCE CHECK

Before committing, verify these strings appear NOWHERE in the code:
- "Analysis" (use "Orientation" instead)
- "Root cause" (use "orientation center" instead)
- "Diagnosis" (forbidden)
- "Recommendation" (use "affordance" if needed)
- "Problem" (use "situation" instead)

These strings MUST appear:
- "Orientation Map Generated" (results heading)
- "Orientation snapshot. Not a verdict." (results subheading)
- "currently organizes" in the why_central display (the word "currently"
  is load-bearing — this is not a truth claim)

## COMMIT

```
S-005: Enhanced extraction — archetypes, tension, gravity structure

- Archetype labels per claim (functional compression of tensor)
- Quadrant and domain tension signaling (secondary directional pulls)
- Gravitational structure (center explanation + 4 gravity types)
- Field coherence detection (strong/competing/distributed/low)
- Code hardening: Supabase client moved from module scope to hook body
- max_tokens increased to 4000 for richer output

Co-Authored-By: ChatGPT Integral Theory GPT (co-designer)
```

Push to main.
