# HANDOFF — SLICE-ATOMIZED-NARRATIVE
# Classification: 🔴 RED (prompt output structure + UI overhaul)
# Date: 2026-03-23
# From: Blue Ocean (Foreman)
# To: Claude Code (Builder)
# Commit: S-008: Atomized narrative — clickable badges + structured explanations

---

## CONTEXT

S-007 added a narrative string per claim. It works, but the output is
one dense paragraph. Russell wants each vector layer (quadrant, domain,
reasoning, relevance, gravity) broken into separate addressable fields.

This enables:
- Clickable badges that reveal their specific explanation
- A relevance gradient legend
- Paragraph breaks between conceptual layers
- Future: individual sections feed into D3 visualization

Russell's design direction: "We should be able to click the pill
'Abductive' and explain what it means in relationship with the
associated claim. Same with the others. 'Medium' should click to a
section that explains the gradient — and the selection 'Medium' should
be green. The key is context and contrast framing."

Russell's architectural insight: "Bonus is we can use this later in
far more complex graphics because we atomize it."

---

## PART 1: PROMPT CHANGES

In src/app/api/orient/route.ts, find the CONTEMPLATIVE NARRATIVE section
in SYSTEM_PROMPT. REPLACE the entire narrative instruction block.

FIND this section (everything from "CONTEMPLATIVE NARRATIVE:" through
the example and "Keep narratives concise" line).

REPLACE WITH:

```
CONTEMPLATIVE NARRATIVE:
For each claim, produce a "narrative" object (not a string) with five
fields. Each field explains one vector layer of the placement.

"narrative": {
  "quadrant": "2-3 sentences. Name the quadrant in full English.
    State why THIS claim lives here by contrasting with what it is NOT.
    Example: 'This sits in the upper-left — interior individual
    experience. It is not observable behavior (upper-right), not shared
    cultural meaning (lower-left), not institutional structure
    (lower-right). It lives here because it is a personal realization
    happening inside the observer.'",

  "domain": "2-3 sentences. Name the Cynefin domain. Explain why this
    claim belongs in THIS domain by showing what makes the cause-effect
    relationship clear/complicated/complex/chaotic for THIS specific
    situation. Use specificity of instantiation.",

  "reasoning": "2-3 sentences. Name the reasoning mode. Show what is
    specifically deductive/inductive/abductive about THIS claim — not a
    generic definition. The secret ingredient is specificity: 'This is
    abductive because the observer is constructing an explanation for
    something they cannot fully verify' not just 'This is abductive
    reasoning.'",

  "relevance": "1-2 sentences. State the relevance level and why. What
    makes this claim high/medium/low in terms of how actively it shapes
    the observer's attention?",

  "gravity": "1-2 sentences. How this claim relates to the gravitational
    center — what type of gravity it provides (structural support,
    narrative pressure, internal anchoring, or direct observation) and
    why."
}

Voice constraints (apply to ALL five fields):
- Explain how the claim BEHAVES in the system, not what it means
- No evaluation, no advice, no correction, no truth claims
- Only structural explanation
- Use contrast framing where natural: explain what something IS by
  noting what it is NOT
- Each field should feel like a thoughtful colleague explaining one
  aspect of placement
```

Also in the OUTPUT FORMAT section, change the claim object's narrative
field from:
```
"narrative": "3-5 sentence contemplative explanation of placement",
```
To:
```
"narrative": {
  "quadrant": "...",
  "domain": "...",
  "reasoning": "...",
  "relevance": "...",
  "gravity": "..."
},
```

---

## PART 2: UI CHANGES — OrientResults.tsx

This is a significant UI overhaul. The claim card layout changes from
static badges to interactive, explorable badges.

### Update TypeScript interfaces

Replace the narrative field in the Claim interface:
```typescript
interface ClaimNarrative {
  quadrant: string
  domain: string
  reasoning: string
  relevance: string
  gravity: string
}

interface Claim {
  id: string
  text: string
  quadrant: 'UL' | 'UR' | 'LL' | 'LR'
  domain: string
  reasoning: string
  relevance: string
  inferred: boolean
  archetype: string
  narrative: ClaimNarrative | string  // string for backward compat with S-007 saves
  quadrant_tension: string[]
  domain_tension: string[]
  gravity_role: string | null
}
```

Note: narrative is `ClaimNarrative | string` because old saved
orientations have string narratives. The UI must handle both.

### Helper: Parse narrative (handles both formats)

Add this helper function near the top:
```typescript
function getNarrative(n: ClaimNarrative | string | undefined): ClaimNarrative | null {
  if (!n) return null
  if (typeof n === 'string') return null  // old format, can't atomize
  return n
}
```

### New Component: ClickableBadge

Replace the current Badge component with a clickable version that can
toggle an explanation panel. Add React state for this.

```typescript
function ClickableBadge({
  label,
  explanation,
  quadrantColor,
  isActive,
  onClick,
}: {
  label: string
  explanation?: string | null
  quadrantColor?: string
  isActive?: boolean
  onClick?: () => void
}) {
  const base = 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border cursor-pointer transition-all'
  const colors = quadrantColor ?? 'border-[var(--poe-border)] text-[var(--poe-text-secondary)]'
  const activeStyle = isActive ? 'ring-1 ring-[var(--poe-accent)] bg-[var(--poe-accent)]/10' : ''
  const clickable = explanation ? 'hover:border-[var(--poe-accent)]' : 'cursor-default'

  return (
    <span
      className={`${base} ${colors} ${activeStyle} ${clickable}`}
      onClick={explanation ? onClick : undefined}
    >
      {label}
    </span>
  )
}
```

### New Component: RelevanceLegend

When the relevance badge is clicked, show a gradient legend with the
current level highlighted in green:

```typescript
function RelevanceLegend({ level }: { level: string }) {
  const levels = ['Low', 'Medium', 'High']
  return (
    <div className="flex items-center gap-3 mt-2 mb-1">
      {levels.map((l) => (
        <span
          key={l}
          className={`text-[11px] px-2 py-0.5 rounded ${
            l === level
              ? 'text-[var(--poe-accent)] border border-[var(--poe-accent)] font-medium'
              : 'text-[var(--poe-text-muted)] border border-[var(--poe-border)]'
          }`}
        >
          {l}
        </span>
      ))}
    </div>
  )
}
```

### New Component: NarrativeSection

Displays one atomized narrative section with proper spacing:

```typescript
function NarrativeSection({ text }: { text: string | undefined }) {
  if (!text) return null
  return (
    <p className="text-sm text-[var(--poe-text-secondary)] leading-relaxed mt-2 mb-3">
      {text}
    </p>
  )
}
```

### New Component: InteractiveBadgeRow

This replaces the static badge row in both CentralClaimCard and
ClaimCard. It manages which badge is currently expanded.

```typescript
'use client'
import { useState } from 'react'

function InteractiveBadgeRow({ claim }: { claim: Claim }) {
  const [activeBadge, setActiveBadge] = useState<string | null>(null)
  const narr = getNarrative(claim.narrative)

  const toggle = (key: string) => {
    setActiveBadge(activeBadge === key ? null : key)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ClickableBadge
          label={claim.quadrant}
          quadrantColor={QUADRANT_COLORS[claim.quadrant]}
          explanation={narr?.quadrant}
          isActive={activeBadge === 'quadrant'}
          onClick={() => toggle('quadrant')}
        />
        <ClickableBadge
          label={claim.domain}
          explanation={narr?.domain}
          isActive={activeBadge === 'domain'}
          onClick={() => toggle('domain')}
        />
        <ClickableBadge
          label={claim.reasoning}
          explanation={narr?.reasoning}
          isActive={activeBadge === 'reasoning'}
          onClick={() => toggle('reasoning')}
        />

        <ClickableBadge
          label={claim.relevance}
          explanation={narr?.relevance}
          isActive={activeBadge === 'relevance'}
          onClick={() => toggle('relevance')}
        />
      </div>

      {/* Expanded explanation panel */}
      {activeBadge && narr && (
        <div className="mt-3 pl-2 border-l-2 border-[var(--poe-accent)]/30">
          {activeBadge === 'relevance' && (
            <RelevanceLegend level={claim.relevance} />
          )}
          <NarrativeSection
            text={
              activeBadge === 'quadrant' ? narr.quadrant :
              activeBadge === 'domain' ? narr.domain :
              activeBadge === 'reasoning' ? narr.reasoning :
              activeBadge === 'relevance' ? narr.relevance :
              null
            }
          />
        </div>
      )}
    </div>
  )
}
```

Note: the useState import is already at the top of the file from
page.tsx imports. If OrientResults.tsx does not currently import
useState, add it:
```typescript
import { useState } from 'react'
```
at the top of the file, right after 'use client'.

### Update CentralClaimCard

Replace the static badge section AND the old single narrative paragraph.

FIND this block inside CentralClaimCard:
```tsx
<div className="flex flex-wrap gap-2">
  <Badge label={claim.quadrant} ... />
  <Badge label={claim.domain} />
  <Badge label={claim.reasoning} />
  <Badge label={claim.relevance} />
</div>
<TensionDisplay ... />
{claim.narrative && (
  <p className="text-sm ...">
    {claim.narrative}
  </p>
)}
```

REPLACE WITH:
```tsx
<InteractiveBadgeRow claim={claim} />
<TensionDisplay
  quadrantTension={claim.quadrant_tension ?? []}
  domainTension={claim.domain_tension ?? []}
/>

{/* Full narrative sections — always visible for central claim */}
{getNarrative(claim.narrative) ? (
  <div className="mt-4 space-y-3">
    <NarrativeSection text={getNarrative(claim.narrative)?.quadrant} />
    <NarrativeSection text={getNarrative(claim.narrative)?.domain} />
    <NarrativeSection text={getNarrative(claim.narrative)?.reasoning} />
    <NarrativeSection text={getNarrative(claim.narrative)?.relevance} />
    <NarrativeSection text={getNarrative(claim.narrative)?.gravity} />
  </div>
) : typeof claim.narrative === 'string' && claim.narrative ? (
  <p className="text-sm text-[var(--poe-text-secondary)] mt-3 leading-relaxed">
    {claim.narrative}
  </p>
) : null}
```

The central claim shows ALL five narrative sections always visible with
paragraph breaks between them. The clickable badges provide ADDITIONAL
interactive exploration on top of the always-visible narrative. This
means clicking a badge highlights and scrolls to that section — but all
sections are already readable without clicking.

### Update ClaimCard

Replace the static badge section AND the old expandable narrative.

FIND this block inside ClaimCard:
```tsx
<div className="flex flex-wrap gap-2">
  <Badge label={claim.quadrant} ... />
  <Badge label={claim.domain} />
  <Badge label={claim.reasoning} />
  <Badge label={claim.relevance} />
</div>
<TensionDisplay ... />
{roleLabel && ( ... )}
{claim.narrative && (
  <details className="mt-3">
    <summary ...>Why this placement</summary>
    <p ...>{claim.narrative}</p>
  </details>
)}
```

REPLACE WITH:
```tsx
<InteractiveBadgeRow claim={claim} />
<TensionDisplay
  quadrantTension={claim.quadrant_tension ?? []}
  domainTension={claim.domain_tension ?? []}
/>
{roleLabel && (
  <p className="text-[11px] text-[var(--poe-text-muted)] italic mt-2">
    {roleLabel} for {centerArchetype ?? 'center'}
  </p>
)}

{/* Expandable narrative — sections with paragraph breaks */}
{getNarrative(claim.narrative) ? (
  <details className="mt-3">
    <summary className="text-xs text-[var(--poe-accent)] cursor-pointer hover:underline">
      Why this placement
    </summary>
    <div className="mt-2 space-y-3">
      <NarrativeSection text={getNarrative(claim.narrative)?.quadrant} />
      <NarrativeSection text={getNarrative(claim.narrative)?.domain} />
      <NarrativeSection text={getNarrative(claim.narrative)?.reasoning} />
      <NarrativeSection text={getNarrative(claim.narrative)?.relevance} />
      <NarrativeSection text={getNarrative(claim.narrative)?.gravity} />
    </div>
  </details>
) : typeof claim.narrative === 'string' && claim.narrative ? (
  <details className="mt-3">
    <summary className="text-xs text-[var(--poe-accent)] cursor-pointer hover:underline">
      Why this placement
    </summary>
    <p className="text-sm text-[var(--poe-text-secondary)] mt-2 leading-relaxed">
      {claim.narrative}
    </p>
  </details>
) : null}
```

Non-central claims keep "Why this placement" as expandable. When
expanded, sections are shown with paragraph breaks (space-y-3).
Clickable badges ALSO work independently — clicking a badge shows
just that one section even when the full narrative is collapsed.

### Remove the old Badge component

The old Badge function is no longer needed — remove it entirely.
ClickableBadge replaces it everywhere.

---

## PART 3: VERIFICATION

1. Run `npx next build` — zero errors
2. Submit a brain dump and verify:
   - Badge pills are clickable (hover shows border change)
   - Clicking a badge reveals its specific explanation below badges
   - Clicking the same badge again collapses it
   - Clicking a different badge swaps to that explanation
   - Clicking "Relevance" badge shows gradient legend (Low, Medium,
     High) with the active level highlighted in green
   - Central claim shows all 5 narrative sections always visible
     with clear paragraph breaks between them
   - Non-central claims show "Why this placement" expandable green link
   - Expanding "Why this placement" shows 5 sections with breaks
3. Load an OLD saved orientation URL — should still render correctly
   (string narrative falls through to old paragraph display)
4. Verify no console errors

## COMMIT

```
S-008: Atomized narrative — clickable badges + structured explanations

- Narrative field changed from string to structured object with 5 sections
  (quadrant, domain, reasoning, relevance, gravity)
- Clickable badge pills reveal section-specific explanations
- Relevance badge shows gradient legend (Low/Medium/High) with active
  level highlighted in green
- Central claim: all 5 sections always visible with paragraph breaks
- Non-central claims: expandable "Why this placement" shows structured
  sections
- Contrast framing in prompt: explains what placement IS by noting
  what it is NOT
- Backward compatible with S-007 string narratives in saved orientations
```

Push to main.

---

## ANTI-RUSH REVIEW

### Reviewed: Backward compatibility
Old saved orientations have `narrative` as a string. The new type is
`ClaimNarrative | string`. The `getNarrative()` helper returns null for
strings, and all rendering paths check for both types. Old URLs continue
to work with the old paragraph-style display.

### Reviewed: Token budget
Atomized narrative has 5 fields × ~40 words each = ~200 words per claim.
14 claims × 200 words = ~2800 words = ~3700 tokens for narratives.
Plus existing output (~2000 tokens). Total ~5700. 8000 max_tokens is
still sufficient. No change needed.

### Reviewed: Prompt complexity
The prompt is getting long. This is a known concern. The system prompt
is now the most complex single string in the codebase. However, it is
well-structured with clear sections. Claude Sonnet handles long system
prompts well. Monitor for quality degradation across runs.

### Reviewed: State management
InteractiveBadgeRow uses local useState for which badge is expanded.
Each card manages its own state independently. No global state needed.
No conflict with the existing page-level React state.

### Reviewed: CSS consistency
All new components use existing CSS variables. No new variables needed.
The accent green ring on active badges uses --poe-accent with /10
opacity for background, which is consistent with the existing accent
color usage.

---

## SUMMARY OF CHANGES

Modified files:
- src/app/api/orient/route.ts
  - SYSTEM_PROMPT: narrative section rewritten for structured object
  - SYSTEM_PROMPT: contrast framing instruction added
  - SYSTEM_PROMPT: output format updated (narrative object, not string)
- src/components/OrientResults.tsx
  - ClaimNarrative interface added
  - Claim interface: narrative changed to ClaimNarrative | string
  - Badge component replaced with ClickableBadge
  - New components: RelevanceLegend, NarrativeSection, InteractiveBadgeRow
  - CentralClaimCard: all 5 sections visible + interactive badges
  - ClaimCard: expandable sections + interactive badges
  - getNarrative() helper for backward compatibility
  - useState import added

No new files. No Supabase changes. No route changes.


---

# DATACUBE FUTURE-PROOFING REVIEW (Anti-Rush, 2026-03-23)
# Added by Blue Ocean after Russell invoked no-rush for visualization readiness

## What I Checked

I reviewed the entire handoff against three future visualization targets:
1. D3.js radial orientation field (SLICE-VIZ-FIELD in build queue)
2. 3D tensor datacube (claims as nodes in multi-axis space)
3. Interactive exploration (click a claim, see all its axes highlighted)

## Finding 1: Narrative Keys Are Correct (No Change Needed)

The five narrative keys — quadrant, domain, reasoning, relevance, gravity
— map exactly to what visualization needs:

  quadrant → position in AQAL 2x2 grid (x,y in the field)
  domain → position on Cynefin spectrum (ordinal axis)
  reasoning → position on reasoning axis (ordinal axis)
  relevance → node SIZE or OPACITY in visualization
  gravity → CONNECTION LINES to center node

Each key has both a STRUCTURAL value (the badge: "UL", "Complex") and
a NARRATIVE value (the explanation text). A datacube can use the badge
for coordinates and the narrative for tooltips/sidebars. This is clean.

## Finding 2: Add Section Keys to NarrativeSection (CHANGE)

The current NarrativeSection component only takes `text: string`. For
future visualization binding, it should ALSO accept a `sectionKey` prop
so D3/Three.js code can programmatically target specific sections.

CHANGE the NarrativeSection component to:
```typescript
function NarrativeSection({
  text,
  sectionKey,
}: {
  text: string | undefined | null
  sectionKey?: string
}) {
  if (!text) return null
  return (
    <p
      className="text-sm text-[var(--poe-text-secondary)] leading-relaxed mt-2 mb-3"
      data-narrative-key={sectionKey}
    >
      {text}
    </p>
  )
}
```

And update ALL NarrativeSection usages to pass sectionKey:
```tsx
<NarrativeSection text={narr?.quadrant} sectionKey="quadrant" />
<NarrativeSection text={narr?.domain} sectionKey="domain" />
<NarrativeSection text={narr?.reasoning} sectionKey="reasoning" />
<NarrativeSection text={narr?.relevance} sectionKey="relevance" />
<NarrativeSection text={narr?.gravity} sectionKey="gravity" />
```

The data-narrative-key attribute costs nothing now but lets future
visualization code do:
  document.querySelectorAll('[data-narrative-key="quadrant"]')
to highlight all quadrant explanations simultaneously across claims.

## Finding 3: Add data-claim-id to Claim Cards (CHANGE)

For future datacube interactivity (hover a node in the visualization,
highlight the corresponding card in the text), each claim card wrapper
div should carry a data attribute.

In BOTH CentralClaimCard and ClaimCard, add to the outer div:
```tsx
<div
  className="p-4 bg-[var(--poe-surface)] ..."
  data-claim-id={claim.id}
>
```

This costs nothing now. When D3 renders a radial field, hovering a
node can trigger: document.querySelector(`[data-claim-id="${id}"]`)
to scroll to or highlight the claim card.

## Finding 4: ClickableBadge Should Carry Axis Type (CHANGE)

Currently ClickableBadge doesn't know WHICH axis it represents — it
just knows its label and explanation. For future visualization binding,
add an `axisKey` prop and a data attribute:

CHANGE the ClickableBadge props to include:
```typescript
function ClickableBadge({
  label,
  explanation,
  quadrantColor,
  isActive,
  onClick,
  axisKey,
}: {
  label: string
  explanation?: string | null
  quadrantColor?: string
  isActive?: boolean
  onClick?: () => void
  axisKey?: string
})
```

And add to the span element:
```tsx
<span
  className={`${base} ${colors} ${activeStyle} ${clickable}`}
  onClick={explanation ? onClick : undefined}
  data-axis-key={axisKey}
>
```

Then update InteractiveBadgeRow to pass axisKey to each badge:
```tsx
<ClickableBadge
  label={claim.quadrant}
  quadrantColor={QUADRANT_COLORS[claim.quadrant]}
  explanation={narr?.quadrant}
  isActive={activeBadge === 'quadrant'}
  onClick={() => toggle('quadrant')}
  axisKey="quadrant"
/>
<ClickableBadge
  label={claim.domain}
  explanation={narr?.domain}
  isActive={activeBadge === 'domain'}
  onClick={() => toggle('domain')}
  axisKey="domain"
/>
<ClickableBadge
  label={claim.reasoning}
  explanation={narr?.reasoning}
  isActive={activeBadge === 'reasoning'}
  onClick={() => toggle('reasoning')}
  axisKey="reasoning"
/>
<ClickableBadge
  label={claim.relevance}
  explanation={narr?.relevance}
  isActive={activeBadge === 'relevance'}
  onClick={() => toggle('relevance')}
  axisKey="relevance"
/>
```

This means D3 can programmatically trigger:
  document.querySelector(`[data-axis-key="domain"]`)?.click()
to open the domain explanation when the user hovers a domain axis
in the datacube.

## Finding 5: Tension Narrative Section (CONSIDERATION — Defer)

Tension is currently NOT in the narrative object. It appears as a
separate "Tension: LR" line below badges. For datacube visualization,
tension becomes directional arrows between quadrant positions. The
narrative doesn't need a tension section because tension is SPATIAL
— it's rendered as lines, not explained as text.

HOWEVER: if we later want a tooltip on a tension arrow, we'd need
the AI to explain WHY there's tension toward LR. This could be a
6th narrative field: `tension`. But adding it now increases prompt
complexity and token cost for a field that only matters in
visualization mode.

DECISION: Defer. When SLICE-VIZ-FIELD is built, add tension narrative
as a prompt extension if needed. The narrative object structure
supports adding a 6th key without breaking anything.

## Summary of Changes From This Review

1. NarrativeSection: add sectionKey prop + data-narrative-key attribute
2. Claim card wrappers: add data-claim-id attribute
3. ClickableBadge: add axisKey prop + data-axis-key attribute
4. InteractiveBadgeRow: pass axisKey to each ClickableBadge
5. Tension narrative: deferred to visualization slice

All four additions (1-4) are zero-cost data attributes that add no
visual change and no behavioral change but make the entire output
programmatically addressable by future visualization code.
