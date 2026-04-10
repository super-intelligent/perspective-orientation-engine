# OPERATIONAL LEDGER
## Constitutional Law — Development Governance Rules
## Location: .governance/OPERATIONAL-LEDGER.md
## Status: CONSTITUTIONAL CORE ONLY

> **For session state:** Read `SESSION-STATE.md`
> **For build process:** Read `DEVELOPMENT-PROTOCOL.md`
> **This document contains permanent governance law only.**

---

## SECTION 4: CHANGE CLASSIFICATION

Before implementing ANYTHING, classify it:

### 🟢 FEATURE (Inside Existing Slice)
ALL of these must be true: no new invariant, no new lifecycle state,
no RLS/permission change, no propagation change, no state transition change.
If removed tomorrow, nothing unrelated breaks.
**Process:** Update slice → build → verify

### 🟡 SLICE AMENDMENT (Modifying Existing Slice)
ANY of these: adds/modifies an invariant, modifies state transitions,
adjusts propagation, modifies access rules, adds cross-slice dependency.
**Process:** Update invariants → new scenarios → Judge approves → build → verify

### 🔵 NEW SLICE (New Vertical Behavior)
ANY of these: new lifecycle state, new commit boundary, new propagation
pathway, new role logic, new dependency boundary, new end-to-end journey.
**Process:** Full slice doc → invariants → min 2 scenarios → Judge gate → build → verify

### 🔴 GOVERNANCE CHANGE (Version Shift)
ANY of these: commit boundary changes, core architecture changes,
fundamental logic changes. Must be amended at constitutional level.
**Process:** Version bump → migration strategy → FULL Judge review

**⚠️ When in doubt, elevate classification. Never downgrade.**

---

## SECTION 5: THE FIVE-QUESTION GATE

Before ANY implementation:

| # | Question | If YES → |
|---|----------|----------|
| 1 | Does this require a **new invariant**? | Slice Amendment or New Slice |
| 2 | Does this require a **new state**? | New Slice |
| 3 | Does this **modify state transitions**? | Slice Amendment minimum |
| 4 | Does this **modify propagation**? | Slice Amendment minimum |
| 5 | Does this require **new access rules**? | Slice Amendment minimum |

**All NO** → 🟢 Feature. **Any YES** → 🟡 or higher.

---

## SECTION 8: ANTI-DRIFT PRINCIPLES

1. No code without classification. (Section 4 first)
2. No execution without scenarios. (Write 2 minimum)
3. No merging without Judge pass.
4. No propagation changes without slice documentation.
5. No access rule changes without explicit review.
6. No new work while old commitments hang. (Check SESSION-STATE.md)
7. When in doubt, elevate classification.
