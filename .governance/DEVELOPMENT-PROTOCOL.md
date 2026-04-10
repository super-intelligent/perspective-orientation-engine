# DEVELOPMENT PROTOCOL
## How We Build — The Companion to SESSION-MANAGEMENT-V2
## Location: .governance/DEVELOPMENT-PROTOCOL.md
## Status: CONSTITUTIONAL — read before any build work begins

---

## WHY THIS EXISTS

> How do we prevent compounded cognitive distortion when AI and human
> cognition recursively scaffold each other over time?

This is the Second-Order Problem. When a human relies on an AI's
confidence to validate their understanding, and the AI relies on the
human's approval to validate its work, both parties drift together
without external falsification. Every protocol, role separation, and
gate in this system breaks that recursive loop.

SESSION-MANAGEMENT-V2.md answers: **How do we remember?**
This document answers: **How do we build?**

---

## THE THREE TRUTHS (In Order — Never Skip)

**Truth 1: Behavioral Truth (Scenarios)**
What does the user actually do? Falsifiable user journeys in `scenarios/`.
If the system can't execute the scenario as written, the build has failed.

**Truth 2: Structural Truth (Invariants)**
What rules must NEVER be violated? Permanent constraints in `invariants/`.

**Truth 3: Implementation Truth (Code)**
Code is the LAST thing created. Only after scenarios and invariants exist.

**The Governing Law:** Behavior First. Structure Second. Code Third. Always.

---

## THE SIX ROLES (Never Collapsed)

No single agent ever holds more than two roles simultaneously.

| Role | Who | Output |
|------|-----|--------|
| **1. Scenario Interrogator** | Foreman + Human | Scenario docs in `scenarios/` |
| **2. Invariant Extractor** | Foreman | Invariant docs in `invariants/` |
| **3. Builder** | Claude Code (SEPARATE agent) | Working code, committed to git |
| **4. Judge** | Separate AI session (NEVER the Builder) | Pass/fail verdict with evidence |
| **5. Domain Expert** | Optional specialist | Advisory opinions — human decides |
| **6. Output Cartographer** | Tracked via slices + SESSION-STATE | Coverage tracking |

**The Split-Brain Rule:** The spec system has two isolated halves:
- **Build-facing spec:** What the Builder implements (visible)
- **Judge-facing spec:** What must be true (HIDDEN in `_holdout/`)
If the Builder can see evaluation criteria, it optimizes for passing them.
Same principle as ML holdout sets preventing overfitting.

---

## THE SLICE LIFECYCLE

A **slice** is one complete vertical user journey.
Build vertically (one journey end-to-end) not horizontally (one layer
across everything).

```
1. CLASSIFY — Run Change Classification (🟢🟡🔵🔴) + 5-Question Gate
2. INTERROGATE — Human describes intent, Foreman asks probing questions
3. WRITE SCENARIO — Step-by-step user journey with testable checkpoints
4. DOMAIN REVIEW — (if domain logic involved) Advisory specialist review
5. WRITE SLICE SPEC — Slice card with checkpoints in slices/active/
6. HUMAN SIGN-OFF — Human approves spec before Builder sees it
7. WRITE HANDOFF — Copy-paste message for Claude Code
8. BUILD — Claude Code reads spec, builds, commits. Does NOT self-evaluate.
9. JUDGE — Separate session tests against scenarios + holdouts
10. CLOSE — Move slice to done/, update SESSION-STATE.md
```

## THE FOUR LEVELS OF DONE

1. **Code Done** — Compiles, runs, doesn't crash.
2. **Scenario Done** — All declared scenarios pass, no invariant violations.
3. **Governance Done** — Docs updated, no hidden coupling.
4. **Systemic Done** — Integrates cleanly, dependency graph stable.

**The definitive test:** A slice is truly done when it can be conceptually
deleted without breaking unrelated slices.

---

## ANTI-PATTERNS — What Mistakes to Watch For

| # | Anti-Pattern | Prevention |
|---|---|---|
| AP-1 | **Performance Theater** — Agent checks its own gates | Judge is ALWAYS separate |
| AP-2 | **Over-Contextualization** — 1000+ lines per prompt | Progressive disclosure |
| AP-3 | **Premature Prescription** — Implementation in specs | Scenarios = what user sees |
| AP-4 | **Beautiful Spec Theater** — No falsifiable test | Every scenario must be executable |
| AP-5 | **Dual Source of Truth** — Fact in two places | One canonical location per fact |
| AP-6 | **Teaching to the Test** — Builder reads holdouts | `_holdout/` blocked from Builder |
| AP-7 | **Narrative Hypnosis** — Prose but no passing tests | Working demo or failing test only |
| AP-8 | **Bolting AI Onto Workflow** — Accelerating broken process | Redesign for AI capabilities |
| AP-9 | **Circular Abstraction** — Abstractions never touch reality | Resolve within 2 hops |
| AP-10 | **Domain Authority Projection** — AI opinions as fact | Expert advises, human decides |

---

## KEY GOVERNING RULES (From the 26-Rule Spec)

- **R1:** The spec must accuse the code. If it can't detect drift, it's theater.
- **R2:** Validation beats memory. Externalized falsification over "remember everything."
- **R3:** Single canonical root or die. One source of truth per fact.
- **R6:** Context ≠ Structure. More context ≠ better outcomes (J-curve).
- **R9:** Split-brain architecture. Build-facing and judge-facing specs are isolated.
- **R15:** Three Truths — Behavior, Structure, Implementation. Lock 2 before scaling 3.
- **R24:** Anti-Magic Rule. Nothing becomes true because AI said so.

---

## CLAUDE CODE HANDOFF FORMAT

```
## HANDOFF TO CLAUDE CODE — [Slice Name]
**Date:** [date]
**Classification:** [🟢🟡🔵🔴]
**Slice spec:** .governance/slices/active/SLICE-XXX.md
**Scenario:** .governance/scenarios/xyz.md

### WHAT TO BUILD
[Specific, actionable instructions]

### WHAT NOT TO TOUCH
[Explicit boundaries — files, systems, patterns to avoid]

### VERIFICATION
[How to verify success — checkpoints from scenario]
```

*"Behavior First. Structure Second. Code Third. Always."*
