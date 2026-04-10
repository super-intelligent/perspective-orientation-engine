# FEATURE SPEC: Tensor Tension Signaling
## POE Enhancement Layer 2
## Classification: 🔴 RED (prompt + schema + visualization)
## Origin: ChatGPT First Run Analysis, 2026-03-21
## Russell's directive: "This should begin now, not later"

---

## WHAT THIS IS

Shows primary tensor placement PLUS visible tension toward other axes.
Not multi-classification. Not false precision. TENSION VISIBILITY.

This is the transition from discrete classification to continuous
orientation tension.

## WHY THIS MATTERS NOW (Russell's reasoning)

"If you train users on clean bins, they will think reality is clean.
POE is explicitly anti-naive classification. So the system must show:
orientation is tension, not containment — from the beginning."

Russell directed this not be deferred to post-MVP. The foundation for
a tool that deals with relevance realization on various degrees of
complexity should be done with rigor from the start.

## THE DESIGN DECISION (Three options evaluated)

### Option A — Multi-assignment (REJECTED)
Claim belongs to multiple quadrants equally.
Problem: breaks visual clarity, creates ambiguity explosion.

### Option B — Primary + secondary weights (REJECTED)
Claim has 70% LL, 20% LR, 10% UL.
Problem: introduces false precision, feels like measurement not orientation.

### Option C — Tension signaling (SELECTED)
Claim has primary placement + visible tension toward other axes.
Example: Primary LL, Tension toward LR and UL.

This preserves:
- Clarity (one primary home)
- Honesty (tension is visible)
- Non-false precision (no percentages)

## WHAT THE AI MUST PRODUCE (per claim)

Current output:
  {
    "quadrant": "LL",
    "domain": "Complex"
  }

New output (addition — existing fields unchanged):
  {
    "quadrant": "LL",
    "domain": "Complex",
    "quadrant_tension": ["LR", "UL"],
    "domain_tension": ["Complicated"]
  }

Rules for tension fields:
- Array of 0-2 secondary directions (empty array = no tension)
- Only include if the pull is genuine, not for completeness
- Tension means "this claim has a real directional pull toward this axis"
- NOT "this claim could theoretically be placed here"

## REFERENCE: All Tension Mappings from First Run

These are the secondary tendencies identified by the ChatGPT analysis.
They serve as the calibration standard.

### C1 — Identity Destabilization
Primary: UL · Complex · Abductive
Quadrant tension: LR (system cause), LL (shared role expectations)

### C2 — Pattern Anomaly Detection
Primary: UR · Complicated · Inductive
Quadrant tension: LR (system-level pattern implications)
Domain tension: Complex (cause of pattern not fully knowable)

### C3 — Interpretive Conflict Injection
Primary: LL · Complex · Abductive
Quadrant tension: UL (interior fear/hesitation), LR (institutional risk)

### C4 — Norm Drift Assertion (strongest multi-tension claim)
Primary: LL · Complex · Deductive
Quadrant tension: LR (emergent system behavior), UL (internalized belief)
Domain tension: Complicated (humanizer techniques add technical layers)
Note: This is a bridge between culture, system, and belief.

### C5 — Coordinated System Gaming
Primary: UR · Complicated · Deductive
Quadrant tension: LR (system exploitation), LL (shared coordination norms)

### C6 — Outcome Inequity Signal
Primary: LR · Clear · Deductive
Quadrant tension: UL (internal dissonance), LL (shared fairness norms)
Domain tension: Complex (long-term fairness dynamics nonlinear)

### C7 — Value Ambiguity Recognition
Primary: UL · Complex · Inductive
Quadrant tension: LL (values are socially negotiated), LR (system implications)
Note: This is a hinge between belief, culture, and system design.

### C8 — Institutional Vacuum
Primary: LR · Chaotic · Inductive
Quadrant tension: LL (interpretive ambiguity across group), UL (interior impact)

### C9 — Authority Ambiguity Signal
Primary: LL · Chaotic · Abductive
Quadrant tension: LR (institutional failure), UL (internal uncertainty)

### C10 — Constraint Lock
Primary: LR · Complicated · Deductive
Quadrant tension: UL (interior conflict — want vs allowed)
Domain tension: Complex (real-world rule application + human variability)

### C11 — Direct Rule Violation Observation
Primary: UR · Clear · Deductive
Quadrant tension: UL (internal reaction), LR (system failure)

### C12 — Avoidance Threshold Breach
Primary: UL · Complex · Abductive
Quadrant tension: UR (behavioral manifestation), LR (system pressure)

### C13 — Responsibility Displacement
Primary: LR · Chaotic · Abductive
Quadrant tension: LL (cultural expectation signal), UL (interior pressure)

### C14 — Systemic Fracture Realization (CENTRAL)
Primary: UL · Complex · Abductive
Quadrant tension: LR (about a system), LL (collective denial implied)
Domain tension: Complicated (parts could be analyzed technically)
Note: Interior realization of an exterior system failure. Multi-layer
attractor — spans all quadrants implicitly. This is WHY it becomes central.

## KEY INSIGHT FROM FIRST RUN

"Almost every claim spans at least two quadrants and often two domains.
The field is not composed of points. It is composed of tension vectors."

## WHAT CHANGES IN THE SYSTEM

### Extraction Prompt
Add instruction requiring Claude to identify secondary quadrant and domain
tensions per claim. Must emphasize:
- Only genuine directional pulls, not theoretical possibilities
- Maximum 2 secondary quadrants, maximum 1 secondary domain
- Empty array if no real tension exists

### Output Schema (Zod)
Add: quadrant_tension: z.array(z.enum(["UL","UR","LL","LR"])).max(2)
Add: domain_tension: z.array(z.enum(["Clear","Complicated","Complex",
     "Chaotic","Confused"])).max(1)

### UI (OrientResults.tsx)
Display tension as subtle secondary indicators on each claim card.
Possible approaches:
- Small muted badges below the primary badges
- Faint directional arrows or lines
- "Tension: LR, UL" text in muted color
- Advanced mode toggle: click to reveal tension detail

### Advanced Mode (future consideration)
Russell mentioned: "probably will be more for an advanced mode where the
user can click and it will still reveal the primaries but also the
secondary tensors."

This suggests a progressive disclosure pattern:
- Default view: primary placement + archetype label
- Click/expand: reveals tension directions + brief explanation

## INTERACTION WITH OTHER FEATURES

- Semantic Compression: tension helps explain why some archetype labels
  feel "bridging" (e.g., Norm Drift Assertion bridges culture/system/belief)
- Gravitational Structure: claims with MORE tension toward the central
  claim's quadrant contribute more gravitational weight

## PROMPT CLASSIFICATION

This is 🔴 RED because it modifies:
- The extraction system prompt (constitutional)
- The output schema (structural)
- The visualization layer (interface contract)
Per CONTROL-VARIABLES.md: minimum 🟡, but multi-layer = 🔴.


---

# CHATGPT RESPONSE INTEGRATION (2026-03-21)

## Q3 ANSWER: TENSION CONFIDENCE LEVELS

There IS a real distinction between strong and weak tension.

### Strong Tension (Load-Bearing)
Claims that:
- Meaningfully bridge quadrants
- Actively contribute to gravity
- Change interpretation if removed

Examples from first run:
- C4 (Norm Drift) → LL ↔ LR ↔ UL — "field connector"
- C14 (Central claim) → UL ↔ LR ↔ LL — "field connector"

### Weak Tension (Incidental)
Claims that:
- Technically cross-quadrant
- But not structurally important

Example: C11 (alt-tab) → touches UL/LR, but lightly
→ "context bleed, not structural force"

### ChatGPT's Recommendation:
- Do NOT add strength indicator in base UI
- DO add it internally or in advanced mode

Optional schema addition for advanced mode:
  tension_strength: "structural" | "contextual"

## Q11 ANSWER: TENSION COMPUTATION ORDER

ANSWER: AFTER primary placement. Always.

Reason:
- Primary = clarity
- Tension = honesty
- If done simultaneously: model blurs, confidence drops

This means the extraction prompt should instruct the AI to:
1. FIRST: determine primary quadrant and domain for each claim
2. THEN: assess secondary tensions based on the primary placement
3. Not: try to determine both at the same time
