# HANDOFF — SLICE-CONTEMPLATIVE-VOICE
# Classification: 🔴 RED (constitutional prompt modification)
# Date: 2026-03-23
# From: Blue Ocean (Foreman)
# To: Claude Code (Builder)
# Commit message: S-007: Contemplative voice — narrative field per claim

---

## CONTEXT

The extraction pipeline produces archetype labels, tensor badges, tension
indicators, and gravitational structure. All structurally correct. But
the output reads like instrument readouts — not like something a human
can contemplate. Russell's direct feedback: "Your description of the
results was more impactful than the results itself."

This slice adds a `narrative` field per claim — 3-5 sentences of
plain-language explanation in the contemplative voice designed
collaboratively with the ChatGPT Integral Theory GPT.

The narrative explains HOW the claim BEHAVES in the orientation field.
Not what it means. Not what to do about it. Only structural explanation.

---

## WHAT CHANGES

1. Extraction prompt: add NARRATIVE section with voice rules + example
2. Output schema: add `narrative` string field per claim
3. max_tokens: 4000 → 8000 (narrative roughly triples output size)
4. UI: central claim shows narrative always; others show expandable

## WHAT DOES NOT CHANGE

- No changes to OrientationViewer.tsx (passes result through)
- No changes to API save/retrieve routes (narrative lives in result_json)
- No changes to Supabase schema (result_json is JSONB, accommodates new fields)
- No changes to gravity structure, tension, or archetype logic

---

## PART 1: EXTRACTION PROMPT ADDITION

In src/app/api/orient/route.ts, find the SYSTEM_PROMPT constant.

ADD the following section AFTER the ARCHETYPE LABELS section and BEFORE
the TENSION SIGNALING section. Insert it between these two existing
blocks:

AFTER this line:
```
For the central claim, generate an archetype label that is MORE COMPRESSIVE...
```

BEFORE this line:
```
TENSION SIGNALING:
```

INSERT this new section:

```
CONTEMPLATIVE NARRATIVE:
For each claim, write a "narrative" field containing 3-5 sentences of
plain-language explanation. The narrative explains how the claim BEHAVES
in the orientation field — not what it means, not what to do about it.

The narrative must follow these rules:
1. Name the quadrant in full English (e.g., "the upper-left quadrant of
   the Wilber framework, which concerns interior individual experience")
   — never use abbreviations like UL or LR in the narrative
2. State why THIS specific claim lives in that quadrant — not a generic
   definition, but what about THIS claim makes it interior/exterior,
   individual/collective
3. Name and briefly define the reasoning mode, then show what is
   specifically that mode about THIS claim (specificity of instantiation)
4. Connect this claim to the gravitational center in one sentence —
   how it feeds, pressures, anchors, or observes the center

Voice constraints:
- Explain how the claim BEHAVES in the system, not what it means
- No evaluation, no advice, no correction, no truth claims
- Only structural explanation
- The secret ingredient is SPECIFICITY OF INSTANTIATION: not "this is
  abductive reasoning" but "this is abductive because the observer is
  constructing an explanation for something they cannot fully verify"

Example narrative for a claim "My co-founder keeps overriding product
decisions after we agree on them" (UR / Complex / Abductive / High):

"This claim sits in the upper-right quadrant of the Wilber framework,
the exterior individual domain — something observable in behavior that
can be pointed to and documented. The domain is Complex because the
repeated overriding suggests an emergent relational dynamic only visible
over time, not reducible to a single cause. The reasoning is Abductive
— the observer is constructing a model of what this behavior means about
trust and alignment, even though the internal state driving it cannot be
fully verified. This claim acts as structural support for the orientation
center, providing concrete behavioral evidence that the agreement
structure is not functioning as intended."

Keep narratives concise — 3-5 sentences, not paragraphs. Each narrative
should feel like a thoughtful colleague explaining placement, not a
textbook definition.
```


Also update the OUTPUT FORMAT section of the prompt. In the claims
object definition, add the narrative field. Change the claim object from:

```
{
  "id": "c1",
  "text": "exact or near-exact phrase from brain dump",
  "quadrant": "UL" | "UR" | "LL" | "LR",
  ...
  "gravity_role": "..." | null
}
```

To:

```
{
  "id": "c1",
  "text": "exact or near-exact phrase from brain dump",
  "quadrant": "UL" | "UR" | "LL" | "LR",
  "domain": "Clear" | "Complicated" | "Complex" | "Chaotic" | "Confused",
  "reasoning": "Deductive" | "Inductive" | "Abductive" | "Unknown",
  "relevance": "High" | "Medium" | "Low",
  "inferred": false,
  "archetype": "2-4 word functional label",
  "narrative": "3-5 sentence contemplative explanation of placement",
  "quadrant_tension": [],
  "domain_tension": [],
  "gravity_role": "..." | null
}
```

Also change max_tokens from 4000 to 8000:
```typescript
max_tokens: 8000,
```

---

## PART 2: UI CHANGES — OrientResults.tsx

### Update the Claim interface

Add the narrative field:
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
  narrative: string        // ← NEW
  quadrant_tension: string[]
  domain_tension: string[]
  gravity_role: string | null
}
```

### CentralClaimCard — narrative ALWAYS VISIBLE

In the CentralClaimCard function, ADD the narrative display AFTER the
tension display and BEFORE the why_central text. Insert between:

```
<TensionDisplay ... />
```

and:

```
{gravityStructure?.why_central && (
```

Add this block:
```tsx
{claim.narrative && (
  <p className="text-sm text-[var(--poe-text-secondary)] mt-3 leading-relaxed">
    {claim.narrative}
  </p>
)}
```

The central claim narrative is always visible — it is the most important
explanation in the entire output and should never be hidden.

### ClaimCard — narrative as EXPANDABLE green link

In the ClaimCard function, ADD an expandable narrative section AFTER
the gravity role label. Insert after:

```tsx
{roleLabel && (
  <p className="text-[11px] text-[var(--poe-text-muted)] italic mt-2">
    {roleLabel} for {centerArchetype ?? 'center'}
  </p>
)}
```

Add this block:
```tsx
{claim.narrative && (
  <details className="mt-3">
    <summary className="text-xs text-[var(--poe-accent)] cursor-pointer hover:underline">
      Why this placement
    </summary>
    <p className="text-sm text-[var(--poe-text-secondary)] mt-2 leading-relaxed">
      {claim.narrative}
    </p>
  </details>
)}
```

This uses the native HTML `<details>` element — no React state needed.
The summary text "Why this placement" appears as clickable green text
(accent color). Clicking it reveals the narrative paragraph below.
Clicking again collapses it.

The green color signals interactivity without being a button. The word
"placement" connects to the orientation vocabulary — not "analysis" or
"explanation" but "placement" as in where the claim was placed in the
orientation field.

---

## PART 3: VERIFICATION

After building, verify:

1. Run `npx next build` — must compile with zero errors
2. Run dev server, submit a test brain dump
3. Verify the API response includes `narrative` field per claim
4. Verify the central claim card shows the narrative text always
   visible — a 3-5 sentence paragraph in readable secondary text
5. Verify non-central claim cards show "Why this placement" in
   green text at the bottom of each card
6. Click "Why this placement" on a non-central card — narrative
   paragraph should expand below it
7. Click again — should collapse
8. Verify narratives use full English quadrant names (not UL/UR/LL/LR)
9. Verify narratives contain NO evaluation, advice, or truth claims
10. Verify no console errors

## VOCABULARY COMPLIANCE CHECK

Narratives must NEVER contain:
- "This means you should..."
- "The problem is..."
- "You need to..."
- "This is true/false/right/wrong..."
- Any advice, suggestion, or evaluation

Narratives MUST contain:
- Full quadrant names ("upper-left quadrant of the Wilber framework")
- Reasoning mode named and specifically instantiated
- Connection to the gravitational center
- The word "orientation" or "placement" (not "analysis" or "diagnosis")

## COMMIT

```
S-007: Contemplative voice — narrative field per claim

- 3-5 sentence narrative per claim explaining orientation placement
- Contemplative voice: structural explanation, no evaluation or advice
- Central claim narrative always visible
- Non-central claims: expandable "Why this placement" green link
- max_tokens increased from 4000 to 8000
- Voice designed collaboratively with ChatGPT Integral Theory GPT
```

Push to main.

---

## SUMMARY OF CHANGES

Modified files:
- src/app/api/orient/route.ts
  - SYSTEM_PROMPT: new CONTEMPLATIVE NARRATIVE section with voice rules
    and gold standard example
  - SYSTEM_PROMPT: updated OUTPUT FORMAT to include narrative field
  - max_tokens: 4000 → 8000
- src/components/OrientResults.tsx
  - Claim interface: added narrative: string
  - CentralClaimCard: narrative paragraph always visible after tension
  - ClaimCard: expandable <details> with "Why this placement" summary

No new files. No Supabase changes. No route changes.

---

## ANTI-RUSH REVIEW NOTES

### Reviewed: Prompt consistency
The existing prompt says "Return structured JSON only. No prose."
The narrative is prose INSIDE a JSON string field — that is consistent.
The instruction refers to output FORMAT (no wrapping text), not to
the content of string values. No clarification needed.

### Reviewed: Token budget
14 claims × ~100 words narrative = ~1400 words = ~1900 tokens for
narratives. Plus existing output (~2000 tokens). Total ~4000 tokens.
8000 max_tokens is safely sufficient.

### Reviewed: API response time
Doubling max_tokens will increase response time. The existing
transitional screen ("Orientation in progress.") already handles
waiting. No UI change needed. But if response time exceeds 30
seconds, consider adding a subtle progress message. Monitor after
deploy.

### Reviewed: Saved orientations
Narratives are stored inside `result_json` JSONB in Supabase.
No schema change needed. Previously saved orientations will NOT
have narratives — the UI handles `claim.narrative` being undefined
by not rendering the section (the `{claim.narrative && (...)}` guard).
Old saved orientations continue to work unchanged.

### Reviewed: Voice drift risk
ChatGPT identified this as the #1 hidden risk: "archetypes drifting
into interpretation." The same risk applies to narratives. The prompt
instruction explicitly says "No evaluation. No advice. Only structural
explanation." But this must be monitored across runs. If narratives
start containing advice or evaluation, the prompt needs tightening.

### Reviewed: Narrative for central claim with null gravity
If field_coherence is "low" or "distributed", the central claim
narrative won't have a meaningful "connects to center" sentence.
The narrative instruction says "Connect this claim to the gravitational
center in one sentence." For null-center cases, the AI should
naturally omit this sentence since there is no center. No special
handling needed in the prompt — the AI will adapt.
