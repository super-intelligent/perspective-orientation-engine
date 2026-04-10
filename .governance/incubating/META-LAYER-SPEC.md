# META LAYER SPECIFICATION — REVISED
## POE Architectural Layer — Field Distribution Analysis + Tensor Confidence
## Classification: 🔴 GOVERNANCE (touches prompt, schema, and session logic)
## Status: QUARANTINED — Architecturally complete. Awaiting sequencing.
## Author: Blue Ocean (Foreman) — Session 9 — 2026-03-26 (revised)
## Origin: Russell × ChatGPT (Integral Theory GPT) — Landauer conversation
##          + POE story arc chunks 22-25 + multi-model API architecture

---

## REVISION NOTES (what changed from v1)

1. Multi-model architecture introduced — meta layer is a SEPARATE API call
2. All evaluative framing removed — no "earned/forced", no "good/bad"
3. collapse_profile computed algorithmically by route code, not LLM judgment
4. New vocabulary eliminates collision with field_coherence
5. provisional_placements separated from meta_layer into tensor_confidence
6. Structural metrics derived from JSON counts, not LLM self-assessment
7. Control Variable 5 corrected from "REPLACED" to "EXTENDED"
8. Case 4 Socratic question rewritten to fit allowed question types

---

## 1. WHAT THIS IS

The Meta Layer is a **field-level structural distribution analysis** that
describes the shape of the orientation field after extraction completes.

It does not evaluate claims.
It does not alter tensor placement.
It does not introduce truth.
It does not judge the quality of the user's orientation.
It does not touch doctrine.

It answers a single structural question:

> "How is the orientation field distributed across its axes —
>  and where would additional signal change the distribution?"


### THE LANDAUER CONNECTION (Analogical — Not Literal)

Landauer's Principle: irreversible erasure of a bit has a minimum
thermodynamic cost. Reversible computation — shuffling possibilities
without deleting them — is essentially free. The cost arrives at commit.

Applied structurally to POE:

| Operation | Landauer | POE |
|-----------|----------|-----|
| Reversible | No cost | Holding multiple axis candidates simultaneously |
| Irreversible | Entropy cost | Hard tensor placement — axis committed |
| Premature erasure | Waste | Axis placement made under insufficient signal |
| Strategic commit | Earned cost | Placement where signal sufficiently constrains the axis |

The meta layer uses this structural logic to ask: at which axis placements
was signal density low enough that additional input would shift the result?

**This application is analogical, not literal thermodynamics.**
The system computes no entropy. It uses the structural logic of
irreversibility to identify where the field distribution is thin.
A thin distribution is not wrong. It is informative.

A situation dominated by UL claims may accurately reflect a situation
that is primarily interior and individual. The meta layer describes
that distribution — it does not prescribe a different one.

---

## 2. THE MULTI-MODEL ARCHITECTURE (The Core Design Decision)

The meta layer is a SEPARATE API call from extraction.

### Why Separation Matters

The extraction model (Sonnet) does one job: extract claims and place
them across the four axes as cleanly as possible. Asking that same
model to then assess the quality of its own placements introduces
self-referential noise. An LLM cannot reliably report its own
placement uncertainty — it will produce confident-sounding assessments
of uncertain placements.

The meta layer model is an EXTERNAL STRUCTURAL OBSERVER.
It receives the completed extraction JSON and reads the distribution
of placements as structural data — counts, ratios, patterns.
It does not re-read the brain dump. It does not re-evaluate claims.
It reads the output of the extraction as a data structure.

### The Three-Call Architecture

This maps to the architecture already in the build queue notes:
"Sonnet for extraction/Socratic questions, Opus for diagnostics/synthesis"

| Call | Model | Input | Output |
|------|-------|-------|--------|
| Call 1 | Sonnet | brain_dump | claims, gravity_structure, field_coherence |
| Call 2 | Opus (or Sonnet) | extraction JSON + computed metrics | meta_layer, tensor_confidence |
| Call 3 (Phase 2) | Sonnet | tensor_confidence.low_signal_placements | Socratic questions for user |

Call 2 receives structural metrics PRE-COMPUTED by the route code from
the extraction JSON — not by any AI judgment. The model describes
structure that the code has already quantified.


---

## 3. STRUCTURAL METRICS — COMPUTED BY CODE, NOT AI

Before Call 2 fires, the API route computes these metrics from the
extraction JSON. These are objective counts derived from the data.

```typescript
// Computed in /api/orient/route.ts after Call 1 returns

interface StructuralMetrics {
  // Quadrant distribution
  quadrant_counts: { UL: number; UR: number; LL: number; LR: number }
  quadrant_coverage: number           // 1-4: how many quadrants have claims
  dominant_quadrant: string | null    // quadrant with most claims, or null if tied

  // Domain distribution
  domain_counts: Record<string, number>
  domain_coverage: number             // 1-5: how many domains are represented

  // Tension density
  claims_with_quadrant_tension: number
  claims_with_domain_tension: number
  total_tension_vectors: number       // sum of all tension array lengths
  tension_density: number             // (claims with any tension) / total claims

  // Gravity distribution
  gravity_role_counts: {
    structural_support: number
    narrative_pressure: number
    internal_anchoring: number
    direct_observation: number
  }
  gravity_coverage: number            // 1-4: how many gravity types are populated

  // Signal basis of central claim
  central_claim_quadrant: string
  central_claim_shares_quadrant_with: number  // how many other claims share quadrant
}
```

### Distribution Profile (computed algorithmically — no AI)

The `distribution_profile` field is assigned by code from the metrics,
not by LLM judgment:

| Condition | Profile |
|-----------|---------|
| quadrant_coverage = 1 | `concentrated` |
| quadrant_coverage = 2 AND one quadrant ≥ 60% of claims | `concentrated` |
| quadrant_coverage = 2 AND roughly equal split | `bifurcated` |
| quadrant_coverage = 3-4 AND tension_density > 0.4 | `distributed` |
| quadrant_coverage = 3-4 AND tension_density ≤ 0.4 | `gradient` |

These are structural descriptions of the field shape.
They carry no evaluative weight.
A `concentrated` field is not deficient. It may accurately represent
a situation where one quadrant genuinely dominates.

### Vocabulary Note: Why Not "consolidated"

The previous version used `consolidated` — this collided with
`field_coherence: "competing"` vocabulary. New vocabulary:
- `concentrated` / `bifurcated` / `gradient` / `distributed`
These are geometric descriptions of distribution shape.
None imply correctness or deficiency.


---

## 4. THE DISAMBIGUATION: field_coherence vs distribution_profile

These are orthogonal measurements. Without a clear spec, builders
will conflate them. They must remain distinct.

### field_coherence (EXISTING — DO NOT CHANGE)
**Measures:** Gravitational structure — how claims organize relationally
around an attractor center.
**Values:** strong / competing / distributed / low
**Answers:** "Is there a gravitational center and how dominant is it?"

### distribution_profile (NEW — Meta Layer, computed by code)
**Measures:** Quadrant and axis distribution shape across the field.
**Values:** concentrated / bifurcated / gradient / distributed
**Answers:** "What is the geometric shape of the field across the axes?"

### How They Differ in Practice

A field can be `field_coherence: strong` AND `distribution_profile: distributed`
— meaning there is a clear gravitational center AND claims are spread
across all four quadrants with active tensions. The center emerged from
a broad-basis field.

A field can be `field_coherence: strong` AND `distribution_profile: concentrated`
— meaning there is a clear gravitational center AND most claims sit in
one quadrant with low tension density. The center emerged from a
narrow-basis field.

Neither configuration is better or worse. They are structurally different.
The narrow-basis field may be completely appropriate for the situation.
The meta layer describes the shape — the user interprets what it means.

### The Orthogonality Table

| field_coherence | distribution_profile | Structural Description |
|-----------------|---------------------|----------------------|
| strong | distributed | Broad-basis center. High quadrant coverage, active tensions |
| strong | concentrated | Narrow-basis center. Low quadrant coverage, low tension density |
| strong | bifurcated | Two-quadrant center. Claims split between two regions |
| competing | bifurcated | Two centers, each drawing from a distinct quadrant cluster |
| distributed | distributed | Wide open field. No center, high coverage, high tension density |
| low | concentrated | Thin field. Few claims, one region, no coherent structure |


---

## 5. THE META LAYER MODEL (Call 2) — SYSTEM PROMPT

The meta layer model receives the extraction JSON plus the
pre-computed structural metrics. It does not re-evaluate claims.
It describes the distribution in structural language.

```
You are the Perspective Orientation Engine field analysis layer.

Your function is structural description of orientation field distribution.
You are not evaluating claims. You are not evaluating the user.
You are reading a completed orientation map as structured data and
describing its geometric properties.

You have received:
1. A completed extraction JSON (claims, placements, gravity structure)
2. Pre-computed structural metrics (distribution counts, tension density,
   gravity coverage, central claim signal basis)

YOUR TASK:
Produce two outputs:

A) FIELD OBSERVATIONS (meta_layer):
   - 2-4 descriptive statements about the field's structural shape
   - Pure description: what the distribution looks like
   - No evaluation of whether the distribution is appropriate
   - No suggestion that the user should orient differently
   - Reference specific metrics where natural

B) LOW-SIGNAL AXIS PLACEMENTS (tensor_confidence):
   - Identify which HIGH-relevance claim placements have low signal basis
   - A placement has low signal basis when:
     * The claim has non-empty quadrant_tension AND non-empty domain_tension
       simultaneously (the data shows pull in multiple directions)
     * OR: the claim sits in the same quadrant as the central claim AND
       has high relevance AND has any active tension (potential
       centrality ambiguity)
   - For each low-signal placement: identify which axis (quadrant, domain,
     or reasoning) has the lowest signal basis
   - Generate one targeted probe question per placement
     (maximum 3 total, prefer 0 if signal is sufficient)

PROBE QUESTION RULES (from POE-DOCTRINE — allowed question types only):
Type 1: Quadrant completion — "Is there an internal response to include?"
Type 2: Claim boundary — "Which of these feels most central to you?"
Type 3: Domain cue — "Do outcomes repeat reliably or vary each time?"
Type 4: Temporal scope — "Is this recurring or a one-time event?"
Type 5: Language posture — "Are you describing, requesting, or warning?"

FORBIDDEN in probe questions:
- Never ask "How do you know?"
- Never imply the current placement is wrong
- Never evaluate truth
- Never suggest what to do
- Language: "To place this more precisely..." not "This seems uncertain"

DOCTRINE COMPLIANCE:
- All field observations use structural language only
- No "good distribution" or "poor distribution"
- No "your thinking shows..." or "you tend to..."
- No directional advice
- The field shape is described, not judged
```


---

## 6. OUTPUT SCHEMA

### A) meta_layer (from Call 2 — descriptive)

```json
"meta_layer": {
  "distribution_profile": "concentrated | bifurcated | gradient | distributed",
  "field_observations": [
    "Claims distribute across three of four quadrants.",
    "Tension vectors are present on 7 of 11 claims.",
    "All four gravity types are represented in the field.",
    "The central claim shares its quadrant with 4 other claims."
  ],
  "active_quadrants": ["UL", "LL", "LR"],
  "inactive_quadrants": ["UR"],
  "tension_density": 0.64,
  "gravity_coverage": 4
}
```

Notes:
- `distribution_profile` is assigned by route CODE from structural metrics
- `field_observations` is generated by Call 2 model — structural description only
- `tension_density` and `gravity_coverage` are passed through from structural
  metrics — not generated by AI
- `active_quadrants` / `inactive_quadrants` derived from quadrant_counts

### B) tensor_confidence (from Call 2 — operational)

This is SEPARATE from meta_layer. Different concerns, different structure.

```json
"tensor_confidence": {
  "overall_signal_density": "high | moderate | low",
  "low_signal_placements": [
    {
      "claim_id": "c3",
      "low_signal_axis": "domain",
      "axis_candidates": ["Complex", "Complicated"],
      "signal_basis": "claim has active quadrant_tension and domain_tension — pull in multiple directions",
      "probe_question": "Do outcomes repeat reliably when you try the same approach, or do they keep surprising you?"
    }
  ]
}
```

Notes:
- `overall_signal_density` derived algorithmically from tension_density
  and quadrant_coverage: high tension + high coverage = high overall
- `low_signal_placements` identified by Call 2 model reading structural
  signals in the JSON (non-empty tensions on high-relevance claims)
- `probe_question` must fit one of the five allowed question types
- Maximum 3 low_signal_placements returned
- If no low-signal placements exist, `low_signal_placements: []`

### C) Supabase Schema — NO CHANGE NEEDED

Both meta_layer and tensor_confidence store inside result_json.
No new tables. No new columns. No migration required.
Consistent with existing JSONB pattern.

### D) socratic_needed field — EXTENDED (not replaced)

Current: boolean — true if critical coordinates missing.

With tensor_confidence: socratic_needed becomes:
- false: tensor_confidence.low_signal_placements is empty
- true: tensor_confidence.low_signal_placements has 1+ items

The boolean is preserved for backward compatibility.
tensor_confidence carries the specificity.
This is an EXTENSION of Variable 5, not a replacement.


---

## 7. WHAT THE USER SEES (Phase 1 UI)

### Field Distribution Panel (minimal — below gravity structure)

```
┌──────────────────────────────────────────────────┐
│ FIELD DISTRIBUTION                                │
│ Shape: distributed                                │
│                                                   │
│ Claims distribute across three quadrants.         │
│ Tension vectors active on 7 of 11 claims.         │
│ All four gravity types are represented.           │
└──────────────────────────────────────────────────┘
```

Vocabulary rules:
- Describe the shape: "distributed across three quadrants"
- Do not interpret: NOT "this is a rich field" or "this is a limited field"
- Do not recommend: NOT "consider adding claims from UR"
- Numbers are neutral: "7 of 11 claims" not "only 7 claims"

### Low-Signal Probe Panel (if tensor_confidence has placements)

```
┌──────────────────────────────────────────────────┐
│ PRECISION AVAILABLE                               │
│                                                   │
│ One probe would sharpen the domain placement      │
│ on "everyone uses humanizers now":                │
│                                                   │
│ "Do outcomes repeat reliably when you try the    │
│  same approach, or do they keep surprising you?" │
└──────────────────────────────────────────────────┘
```

Vocabulary rules:
- "precision available" — not "correction needed"
- "sharpen the placement" — not "fix the placement"
- "probe" — not "question" (preserves the topological register)
- Never imply the current placement is wrong
- If no low-signal placements: this panel does not appear at all

### Anti-Patterns — NEVER Display
- "Your field is too narrow" (evaluation)
- "You should include more [quadrant] perspectives" (prescription)
- "This distribution suggests you tend to..." (psychological profiling)
- Any numerical entropy score
- Any percentages or ratios surfaced to the user
  (tension_density is internal computation only — never shown)
- Any comparison to other users or "typical" distributions

---

## 8. THE LOW-SIGNAL PROBES — SPECIFIC CASES

These are the four axis ambiguities where low-signal placements
most commonly occur. Each maps to an allowed question type.

### Case 1: Domain — Complex vs Complicated
**Signal:** non-empty domain_tension with candidates Complex/Complicated
**Allowed type:** Type 3 (Domain cue completion)
**Probe:** "Do outcomes repeat reliably when you try the same
approach, or do they keep surprising you?"
Complicated → reliable with expertise. Complex → keeps surprising.

### Case 2: Quadrant — UL vs LL
**Signal:** non-empty quadrant_tension between UL and LL
**Allowed type:** Type 1 (Quadrant completion)
**Probe:** "Is this something you experience privately, or do you
sense others in your context carry something similar?"
UL → private. LL → shared recognition.

### Case 3: Reasoning — Abductive vs Inductive
**Signal:** non-empty quadrant_tension + reasoning mode conflicts with
domain placement (e.g., Inductive assigned in Complex domain)
**Allowed type:** Type 5 (Language posture)
**Probe:** "Are you describing a pattern you've seen confirmed
repeatedly, or a pattern you're inferring from incomplete signals?"
Inductive → confirmed pattern. Abductive → inference from incomplete.

### Case 4: Central claim signal basis
**Signal:** central claim shares quadrant with ≥ 40% of other claims
AND central claim has active tensions
**Allowed type:** Type 2 (Claim boundary/linkage)
**Probe:** "Which of these feels most organizing — the one that
makes the others make sense, or the one most present right now?"
This fits Type 2 exactly: "Which claim is the central node for you?"
It is topological, not metacognitive. No "feel" language in the probe.


---

## 9. WHAT DOES NOT CHANGE

### Doctrine — UNTOUCHED
- TRUE-BY-ASSUMPTION: absolute, no change
- The meta layer describes distribution, never evaluates truth
- No behavioral guidance, no prescriptive language
- Forbidden questions remain forbidden in all probe generation
- Vocabulary governance unchanged — meta layer adds no new approved terms
  beyond those defined in Section 7

### Extraction Call (Call 1) — UNTOUCHED
- System prompt unchanged
- Sonnet model unchanged
- Claim schema unchanged — no new fields on claim objects
- Narrative structure (5-field object) unchanged
- Archetype labels unchanged
- Tensor axes unchanged

### Gravity Computation — UNTOUCHED
- central_claim_id logic unchanged
- gravity_role assignment unchanged
- gravity_structure unchanged
- recursive_loop unchanged

The meta layer is an observer of the completed field.
It does not participate in building the field.
The extraction model never knows a meta layer call will follow.

---

## 10. IMPLEMENTATION ORDER

### Phase 1A — Structural Metrics + Silent Storage
**Prerequisite:** S-008 tested and output quality confirmed.

Add structural_metrics computation to route.ts (pure code — no AI).
Add meta_layer and tensor_confidence as empty scaffolding in result_json.
Do NOT fire Call 2 yet. Observe what the metrics look like across 10+ sessions.

Goal: Confirm structural metrics produce meaningful signal variation
before adding any AI layer on top.

### Phase 1B — Call 2 Activation (Observation Only)
**Prerequisite:** 10+ sessions with structural metrics confirmed useful.

Fire Call 2 (Opus or Sonnet). Store meta_layer output in result_json.
No UI change yet. Read the outputs manually.
Confirm distribution_profile and field_coherence produce distinct signals.

### Phase 1C — Field Distribution UI Panel
**Prerequisite:** Call 2 output confirmed distinct from field_coherence.

Add FIELD DISTRIBUTION panel to OrientResults.tsx.
No probes in UI yet. Pure structural description only.

### Phase 2 — Probe Integration
**Prerequisite:** SLICE-SOCRATIC built and tested.

Activate tensor_confidence low_signal_placements in UI.
Wire probe questions to Socratic UI layer.
This replaces the blunt socratic_needed boolean with targeted probes.

### Phase 3 — Multi-Session Distribution Tracking
**Prerequisite:** Auth active, longitudinal tracking built.

Track distribution_profile and tension_density per session thread.
Detect distribution patterns across sessions (orientation habits).
Connect to orientation lifecycle (drift signal → concentrated profile
often accompanies early drift; distributed profile accompanies recovery).

---

## 11. CONTROL VARIABLES AFFECTED

| Variable | Status | Notes |
|----------|--------|-------|
| 1: Orientation vs adjudication | PROTECTED | meta_layer describes distribution, never evaluates |
| 4: Tensor strictness | EXTENDED | tensor_confidence adds signal-density awareness without breaking strictness |
| 5: Socratic threshold | EXTENDED (Phase 2) | Targeted probes extend the boolean — not replace it |
| 6: Diagnostic intensity | MONITOR | Field observations must stay purely descriptive — no intensity gradient |
| 7: Dimensionality formula | CONNECTS | distribution_profile + tension_density are observable proxies for dimensionality |
| 9: Language-signature influence | SEPARATE | Meta layer is structural not linguistic — does not affect language signature layer |
| 12: Vocabulary governance | STRICT | New terms: "probe", "precision available", "signal basis", "distribution shape" |

---

## 12. THE ONE-LINE PRINCIPLE

> The meta layer describes the shape of the orientation field —
> where it is concentrated, where it is open, and where one probe
> would sharpen a placement — without assigning value to any shape.


---

## 13. FOREMAN DECISION LOG

| Decision | Rationale |
|----------|-----------|
| Separate API call for meta layer | Prevents self-referential noise. External observer reads JSON structure, not the extraction process. Solves LLM self-assessment unreliability. |
| distribution_profile computed by code | Removes AI judgment from label assignment entirely. Code counts claims per quadrant — this is arithmetic, not interpretation. |
| New vocabulary: concentrated/bifurcated/gradient/distributed | Eliminates collision with field_coherence: "competing". Geometric descriptions carry no evaluative weight. |
| No evaluative framing anywhere in spec | "Concentrated" field is not deficient. "Distributed" field is not superior. The shape describes the situation, not the user's adequacy. |
| meta_layer and tensor_confidence are separate objects | Different concerns. meta_layer = field observation (description). tensor_confidence = operational signal for Socratic layer (instruction). Mixing them would couple observation to action. |
| Route computes structural_metrics before Call 2 | The meta layer model reads numbers, not claims. This is the cleanest separation of concerns. The AI describes what code has already quantified. |
| Case 4 probe rewritten to Type 2 | Previous version had metacognitive "feel" language. Type 2 (claim boundary) is the correct allowed type. "Which makes the others make sense" is topological. |
| tension_density never surfaced to user | Internal computation only. Showing percentages to users would introduce false precision and comparison anxiety. |
| No "orientation habits" in Phase 1 spec | Phase 3 concern. Including longitudinal pattern detection in Phase 1 spec would create premature complexity and scope creep. |
| Variable 5: EXTENDED not REPLACED | "Replaced" implies a governance change. Extending the socratic_needed boolean with more specificity is an amendment, not a replacement. |

---

## 14. WHAT THE THREE-CALL ARCHITECTURE UNLOCKS

This is not just an implementation choice. It changes what the system
can know.

**Call 1 (Sonnet — Extraction):** Runs with no knowledge that it will
be evaluated. This preserves extraction purity. The model maps the
field without meta-awareness of being observed.

**Call 2 (Opus — Field Analysis):** Reads completed JSON as a data
structure. Can be given a different temperature (lower = more structural,
less creative). Can be prompted to be maximally conservative in
identifying low-signal placements — only flag what the data clearly shows,
not what might theoretically be ambiguous.

**Call 3 (Sonnet — Socratic, Phase 2):** Receives only the
low_signal_placements array — not the full brain dump, not the full
extraction. The model's only job is generating a precise probe question
for a specific axis ambiguity. Narrow task = better output.

This is the same principle as the POE's orientation doctrine applied to
the architecture itself: each call holds exactly the context it needs,
no more. No call collapses the full picture prematurely.

---

## SOURCE REFERENCES

- Landauer's Principle conversation (Russell × ChatGPT, 2026-03-26)
- POE Story Arc chunks 22-25 (orientation dynamics, dimensionality model)
  at: The-Orientation-Perspective-Engine/perspective-orientation-engine-STORY-ARC/
- ChatGPT Meta Layer Spec (initial document)
  at: .governance/architecture/CHATGPT-META-LAYER-BRIEFING.md
- ChatGPT First Run Analysis + Refinement Pass 2
  at: .governance/features/CHATGPT-FIRST-RUN-ANALYSIS.md
- POE-DOCTRINE.md — constitutional invariants
- CONTROL-VARIABLES.md — 12 variables, all checked against this spec

---

*Spec v2 written by Blue Ocean (Foreman) — Session 9 — 2026-03-26*
*Quarantined pending: S-008 test results, SLICE-SOCRATIC build, Russell sign-off*
*Do not move to slices/active/ without Russell approval*
*Previous version archived as META-LAYER-SPEC-v1-superseded in git history*
