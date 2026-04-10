# POE BUILD STATE BRIEFING — For ChatGPT
# Date: 2026-03-26
# From: Blue Ocean (Claude Opus) via Russell
# Purpose: Give ChatGPT full context so the Meta layer summary
#          can reference specific architecture and suggest placement

---

# PASTE EVERYTHING BELOW INTO CHATGPT

---

Here is the current state of the POE software build. I need you to
write a Meta layer architectural summary that references this state
precisely. Blue Ocean (Claude Opus, my Foreman/Architect) will read
your summary and integrate it into .governance/architecture/.

## WHAT IS LIVE RIGHT NOW

App: https://perspective.super-intelligent.ai
Stack: Next.js 16, Vercel, Supabase (PostgreSQL + RLS), Claude Sonnet API
Git: 12 commits on main, latest hash f53a4af

## CURRENT EXTRACTION PIPELINE

User submits a brain dump (freeform text). Claude Sonnet extracts
5-15 claims and maps each across four axes:

1. AQAL Quadrant (Wilber): UL/UR/LL/LR
2. Cynefin Domain (Snowden): Clear/Complicated/Complex/Chaotic/Confused
3. Reasoning Mode: Deductive/Inductive/Abductive/Unknown
4. Observer Relevance (Vervaeke): High/Medium/Low

## WHAT EACH CLAIM PRODUCES (current schema)

Per claim:
- id, text (near-exact from brain dump)
- quadrant, domain, reasoning, relevance (the four axes)
- archetype: 2-4 word functional compression of the tensor
  (e.g., "Authority Self-Doubt Signal", "Pattern Anomaly Detection")
- narrative: structured object with 5 sections:
  - quadrant: why THIS claim lives in this quadrant (contrast framing)
  - domain: why THIS domain (specificity of instantiation)
  - reasoning: what is specifically deductive/inductive/abductive about THIS claim
  - relevance: why high/medium/low
  - gravity: how this claim relates to the gravitational center
- quadrant_tension: array of 0-2 secondary quadrant pulls
- domain_tension: array of 0-1 secondary domain pulls
- gravity_role: structural_support / narrative_pressure /
  internal_anchoring / direct_observation / null (for center)
- inferred: boolean

## TOP-LEVEL OUTPUT (per orientation)

- central_claim_id: string | string[] | null
- field_coherence: strong / competing / distributed / low
- gravity_structure: {
    center_archetype, why_central,
    structural_support[], narrative_pressure[],
    internal_anchoring[], direct_observation[],
    recursive_loop
  }
- socratic_needed: boolean

## PERSISTENCE

- Orientations auto-saved to Supabase on every Orient click
- Stored as: brain_dump (text) + result_json (JSONB) + field_coherence
  + central_archetype + created_at
- Retrievable by UUID: /orient/[id] is a permanent shareable URL
- RPC functions: save_orientation() and get_orientation()
- Currently anonymous (no user_id, no tenant_id) — auth is parked

## UI FEATURES

- Clickable badge pills per claim (click reveals axis-specific explanation)
- Relevance gradient legend (Low/Medium/High, active in green)
- Central claim: all 5 narrative sections always visible
- Non-central claims: expandable "Why this placement" green link
- Data attributes on DOM for future D3 datacube binding:
  data-claim-id, data-axis-key, data-narrative-key

## DOCTRINE (Constitutional — Never Violated)

- TRUE-BY-ASSUMPTION: claims are never evaluated for truth
- The system orients, never evaluates, diagnoses, or prescribes
- Vocabulary: "orientation" not "analysis", "affordance" not
  "recommendation", "situation" not "problem"
- Forbidden questions: "How do you know?", "Are you sure?", etc.
- 10 Axioms, 3 Ethical NOTs, 12 Control Variables govern all changes

## WHAT HAS BEEN CO-DESIGNED WITH YOU (ChatGPT)

You co-designed three enhancement layers that are now live:
1. Semantic Compression Labels (archetypes) — functional compression
   of the tensor, 4 structural types (destabilization, constraint,
   transition, stabilization)
2. Tensor Tension Signaling — primary placement + secondary pulls,
   computed AFTER primary placement
3. Gravitational Center Explanation — 4 gravity types, recursive loops,
   field coherence detection

You also provided:
- Archetype pattern language per quadrant (UL=state transitions,
  UR=signal detection, LL=meaning shifts, LR=system behavior)
- The contemplative voice rules (4 steps + specificity of instantiation)
- Gold standard narrative example (startup co-founder scenario)
- Calibration examples across 4 domains
- 15-question deep dive answers on reasoning modes, Confused vs Complex,
  Austin speech acts (confirmed as future 5th axis), gravity types,
  edge cases, and hidden risks

## SUPABASE SCHEMA (Current)

Tables:
- public.orientations (id, brain_dump, result_json, field_coherence,
  central_archetype, created_at)
- public.user_sessions (from auth slice, not actively used)

RPC Functions:
- save_orientation(brain_dump, result_json, field_coherence, central_archetype) → uuid
- get_orientation(id) → json

No user_id or tenant_id columns yet. Auth is parked.
Multi-tenant architecture planned (EVH crosswalk on file).

## BUILD QUEUE (What's Next)

Completed: INFRA, FIRST-SCREEN, AUTH (parked), EXTRACTION,
ENHANCED-EXTRACTION, PERSISTENCE, CONTEMPLATIVE-VOICE, ATOMIZED-NARRATIVE

Next: Output refinement → Socratic layer → Diagnostics → Zod schemas
→ D3 radial visualization → Observatory mode → Lenses → Saturation
→ Gating → Polish

Future confirmed but not built:
- Austin speech acts as 5th axis (overlay, not structural)
- Longitudinal tracking (orientation drift across sessions)
- D3 datacube / radial orientation field (DOM data attributes ready)
- Multi-tenant (EVH pattern reference on file)
- Connector socket between EVH and POE (far future)

---

## YOUR TASK

Write a single architectural summary document for the Meta layer
you and I developed. This goes into .governance/architecture/ as a
permanent reference. Blue Ocean will read it and assess implications.

The document must cover:

1. WHAT the Meta layer IS — in precise terms
2. WHAT IT CHANGES about the existing architecture described above
3. WHAT IT DOES NOT CHANGE (especially doctrine)
4. SPECIFIC IMPLICATIONS for:
   - The extraction prompt (what instructions change or are added)
   - The narrative structure (does the 5-field object need new fields?)
   - The claim schema (new fields on the claim object?)
   - The gravity structure (does centrality calculation change?)
   - The Supabase schema (new tables or columns?)
   - Future D3 visualization (how does Meta layer render visually?)
5. WHERE in the database the Meta layer data should live — given
   the current schema described above
6. IMPLEMENTATION ORDER — what should be built first, what can wait

Keep it under 300 lines. Be specific enough that Blue Ocean can
write a handoff from your summary without needing the raw chat
transcripts.

Reference the existing schema, field names, and architecture by name.
Don't generalize — point to exactly where things connect.
