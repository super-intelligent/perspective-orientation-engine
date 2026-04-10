# FEATURE SPEC: Gravitational Center Explanation
## POE Enhancement Layer 3
## Classification: 🔴 RED (prompt + new output structure + visualization)
## Origin: ChatGPT First Run Analysis, 2026-03-21
## Russell: "the most exciting part to me is the orientation around
##           the gravitational potentially recursive center"

---

## WHAT THIS IS

Reveals WHY a claim became the gravitational center of the orientation field.
Shows which claims feed into it, by what type of gravity, and the recursive
feedback loops that make it structurally organizing.

Currently the system identifies the central claim. But it does not show
WHY it is the center. This feature makes the gravitational structure visible.

## WHY THIS MATTERS

Russell's key observation: "Your description of the results in some ways
was more impactful to me than the results itself."

What made the ChatGPT explanation powerful was not new data. It was making
EXPLICIT how other claims orbit the center and how it recursively explains
the rest. The system currently shows the center. This feature shows the
structure of its gravity.

## WHAT MAKES A CLAIM BECOME CENTRAL

From the first run analysis, four conditions were identified:

### 1. Maximum Explanatory Compression
The central claim can absorb and make sense of the most other claims.
It explains the pattern of the whole, not just one part.

### 2. Cross-Domain Compatibility
The central claim is broad enough to organize claims from multiple
Cynefin domains simultaneously. In the first run, the situation spanned
Clear, Complicated, Complex, and Chaotic — and only C14 could hold
all domains under one orientation.

### 3. Links Structure and Interiority
Most claims are either system-level OR personal. The central claim
fuses both. It is an interior realization about an exterior system.
That bridging capacity is what makes it central.

### 4. Recursive Reinforcement
There is a feedback loop that closes at the central claim:
  system feels broken →
  student behavior becomes adaptive and unfair →
  institutional guidance fails →
  teacher loses confidence →
  sense of structural fracture increases →
  (loop closes at central claim)

## FOUR TYPES OF GRAVITATIONAL RELATIONSHIP

From the first run analysis, claims relate to the center through
four distinct gravity types:

### Type 1: Structural Support
Claims that provide concrete evidence or system-level reinforcement
that the central realization is structurally grounded.

First run examples:
- C2 (Pattern Anomaly Detection) — introduces structural unreliability
- C6 (Outcome Inequity Signal) — visible system output misalignment
- C8 (Institutional Vacuum) — removes stabilizing authority
- C10 (Constraint Lock) — blocks corrective action
- C13 (Responsibility Displacement) — redistributes instability downward

### Type 2: Narrative Pressure
Claims that reshape the interpretive environment, making the central
realization cognitively inevitable even without direct proof.

First run examples:
- C4 (Norm Drift Assertion) — dissolves boundary of assessment integrity
- C5 (Coordinated System Gaming) — reveals adaptation against the system
- C3 (Interpretive Conflict Injection) — destabilizes enforcement
- C9 (Authority Ambiguity Signal) — removes epistemic anchor

### Type 3: Internal Anchoring
Claims that show how the central realization is being LIVED by the observer.
They stabilize the orientation around the center through felt experience.

First run examples:
- C1 (Identity Destabilization) — breakdown is identity-level
- C12 (Avoidance Threshold Breach) — behavioral disengagement from system
- C7 (Value Ambiguity Recognition) — internal questioning of own framework

### Type 4: Direct External Anchor
Low-ambiguity, high-clarity observations that prevent the field from
floating into pure interpretation. They are concrete anchor points.

First run examples:
- C11 (Direct Rule Violation Observation) — concrete visible evidence

## VOCABULARY GOVERNANCE

The system does NOT say:
- "This is the root cause"
- "This is the most important claim"
- "This explains everything"

The system DOES say:
- "This claim currently organizes the most relationships in the field"
- "These claims contribute structural support / narrative pressure /
   internal anchoring / direct observation to the orientation center"

## WHAT THE AI MUST PRODUCE (new output section)

In addition to the existing claims array and central_claim_id, add:

  {
    "claims": [...],
    "central_claim_id": "c14",
    "gravity_structure": {
      "center_archetype": "Systemic Fracture Realization",
      "why_central": "This claim organizes the most relationships in the
        field. It absorbs structural evidence, narrative pressure, and
        internal anchoring into a single orientation center.",
      "structural_support": ["c2", "c6", "c8", "c10", "c13"],
      "narrative_pressure": ["c4", "c5", "c3", "c9"],
      "internal_anchoring": ["c1", "c12", "c7"],
      "direct_observation": ["c11"],
      "recursive_loop": "system feels broken → behavior adapts →
        assessment unreliable → system feels broken"
    }
  }

## WHAT THE USER SEES

### Per Claim (enhanced card)
1. Archetype label (from Feature 1)
2. Claim text
3. Tensor badges (quadrant, domain, reasoning, relevance)
4. Tension indicators (from Feature 2)
5. Gravity relationship to center (if applicable):
   "Structural support for [central archetype]"
   or "Narrative pressure toward [central archetype]"
   or "Internal anchor for [central archetype]"
   or "Direct observation anchoring the field"

### Central Claim (expanded section)
The central claim card is visually distinct and includes:
1. "Orientation Center" heading (not "Root Cause" or "Main Problem")
2. Archetype label
3. "This claim currently organizes the most relationships in the field"
4. Four gravity groups listed with their archetype labels:
   - Structural support: [list of archetype labels]
   - Narrative pressure: [list of archetype labels]
   - Internal anchoring: [list of archetype labels]
   - Direct observation: [list of archetype labels]
5. Recursive loop description (one sentence)

### Contemplative Expansion (Russell's request)
Russell specifically asked for expanded plain-language explanations:
- Why each claim was placed in its quadrant (what makes it UL vs LR etc)
- What the reasoning mode means for THIS specific claim
- Why this claim feeds the gravitational center

This is the "thinking out loud" layer. It makes the tensor mechanics
contemplatively accessible. Russell listened to the ChatGPT version
"three or four times" — that level of explanatory depth is the target.

This expansion may be:
- Available on click/expand per claim
- Or generated as a separate "Orientation Narrative" section
- Must maintain doctrine compliance throughout

## WHAT CHANGES IN THE SYSTEM

### Extraction Prompt
Add instruction requiring Claude to generate the gravity_structure object.
Must produce: gravity type per claim, recursive loop, why_central explanation.
This is the largest prompt change and must be tested carefully.

### Output Schema (Zod)
Add gravity_structure object with typed fields for each gravity type.

### UI
New section below claim cards showing gravitational relationships.
Design TBD — could be textual, could be visual connections.
The D3 radial visualization (future SLICE-VIZ-FIELD) is the natural
home for showing gravity visually.

## PROMPT CLASSIFICATION

This is 🔴 RED — maximum governance classification.
Touches extraction prompt (constitutional), output schema, and visualization.
Requires scenario testing before build.


---

# CHATGPT RESPONSE INTEGRATION (2026-03-21)

## Q4 ANSWER: GRAVITY TYPES — COMPLETENESS

The four gravity types are REAL AND STABLE, but not complete.
They are the "first layer of a larger grammar."

### Core Four (Lock These)
1. Structural Support → system evidence
2. Narrative Pressure → meaning reshaping
3. Internal Anchoring → self-model
4. Direct Observation → reality anchor

These map to: system, meaning, self, reality anchor.
ChatGPT calls this "already elegant."

### Additional Types (Emergent — Not Required Yet)
5. Contradictory Gravity — claims that RESIST the center
6. Latent Gravity — not currently feeding center, but COULD
7. Temporal Gravity — sequence-based pressure (before/after dynamics)

### Recommendation:
Lock the core 4. Allow future expansion. Do not implement 5-7 now
but preserve them as known future types.

## Q12 ANSWER: CENTRAL CLAIM ARCHETYPE LABEL

Yes — the central claim label IS different from other labels.
Not bigger. But MORE COMPRESSIVE.

Rule: Central label should describe a state that can ABSORB other claims.

Example comparison:
- "Constraint Lock" → local (describes one claim's function)
- "Systemic Fracture Realization" → global (can absorb other claims)

This means the prompt instruction for the central claim archetype
should be distinct: "For the central claim, generate an archetype
label that describes a state capable of absorbing the functions of
the surrounding claims."

## Q13 ANSWER: EDGE CASES — NO CLEAR CENTER

Three cases identified:

### Case 1: Weak Field (no center)
Return:
  central_claim_id: null
  field_coherence: "low"

### Case 2: Dual Centers (competing attractors)
Return BOTH central claims. The system should support an array:
  central_claim_id: ["c5", "c11"]
  field_coherence: "competing"

### Case 3: Distributed Field (networked, no single center)
Return:
  central_claim_id: null
  central_pattern: "distributed"
  field_coherence: "distributed"

This means the schema should accommodate:
- central_claim_id as string | string[] | null
- field_coherence as "strong" | "competing" | "distributed" | "low"
- central_pattern as optional descriptor

## Q14 ANSWER: RECURSIVE SYMMETRY

This is NOT just philosophical. It has design implications.

The system maps reasoning USING reasoning. This can be exposed by
showing: "This orientation was constructed abductively across a
complex field."

This creates metacognitive awareness — the user sees not just their
orientation but the system's own orientation process.

Implementation: Add a field_meta object to the output:
  field_meta: {
    construction_mode: "abductive",
    field_complexity: "complex",
    note: "This orientation was constructed abductively across a
           complex field"
  }

This is a future enhancement — not needed for current features
but architecturally significant and should be preserved.


---

# R3 SCHEMA REVIEW — ChatGPT Refinement Pass 2 (2026-03-21)

## A) gravity_role per claim: CONFIRMED
- Each non-central claim gets exactly one gravity_role
- The central claim does NOT get a gravity_role (it IS the center)

## B) Competing Centers: TWO SEPARATE STRUCTURES

Do NOT merge. Use distinct structures:

  {
    "field_coherence": "competing",
    "central_claim_ids": ["c5", "c11"],
    "gravity_structures": [
      { ...structure for c5... },
      { ...structure for c11... }
    ]
  }

Two distinct attractors, not blended.

## C) Distributed Case: DESCRIPTIVE, NOT NULL

Do NOT return null. That loses information.

  {
    "field_coherence": "distributed",
    "central_claim_id": null,
    "gravity_structure": {
      "pattern": "distributed",
      "description": "No single claim organizes the field. Multiple
        claims share partial influence without forming a dominant
        attractor."
    }
  }

## D) recursive_loop: KEEP AS SINGLE STRING

Keep as single string for now. Preserves compression, avoids
over-structuring early. Future advanced mode can use:
  "recursive_loops": []

## E) Future Gravity Types: DO NOT RESERVE SPACE

Do not add Contradictory, Latent, or Temporal to the schema now.
Premature schema complexity violates our own discipline.
Add later when they appear in real data.

## CHATGPT ADDITION: gravity_strength field

ChatGPT recommended adding:
  "gravity_strength": "strong" | "moderate" | "weak"

Not for UI display. For:
- Internal ranking
- Future visualization
- Center determination refinement

Rationale: "Gravity without magnitude is half-visible."

This should be added to the schema as an internal field.
Not displayed in base UI but available for advanced mode
and future D3 visualization.

---

## FINAL LOCKED SCHEMA (incorporating all R3 answers)

Standard case (strong single center):
  {
    "claims": [
      {
        "id": "c1",
        "text": "...",
        "quadrant": "UL",
        "domain": "Complex",
        "reasoning": "Abductive",
        "relevance": "High",
        "inferred": false,
        "archetype": "Identity Destabilization",
        "quadrant_tension": ["LR", "LL"],
        "domain_tension": [],
        "gravity_role": "internal_anchoring",
        "gravity_strength": "strong"
      }
    ],
    "central_claim_id": "c14",
    "field_coherence": "strong",

    "gravity_structure": {
      "center_archetype": "Systemic Fracture Realization",
      "why_central": "This claim currently organizes the most
        relationships in the field.",
      "structural_support": ["c2", "c6", "c8", "c10", "c13"],
      "narrative_pressure": ["c4", "c5", "c3", "c9"],
      "internal_anchoring": ["c1", "c12", "c7"],
      "direct_observation": ["c11"],
      "recursive_loop": "system feels broken → behavior adapts →
        assessment unreliable → system feels broken"
    }
  }

Competing centers case:
  {
    "field_coherence": "competing",
    "central_claim_ids": ["c5", "c11"],
    "gravity_structures": [
      { ...structure for c5... },
      { ...structure for c11... }
    ]
  }

Distributed case:
  {
    "field_coherence": "distributed",
    "central_claim_id": null,
    "gravity_structure": {
      "pattern": "distributed",
      "description": "No single claim organizes the field."
    }
  }

Weak field case:
  {
    "field_coherence": "low",
    "central_claim_id": null,
    "gravity_structure": null
  }

## SCHEMA IS NOW LOCKED
## Ready for extraction prompt modification and Zod implementation
