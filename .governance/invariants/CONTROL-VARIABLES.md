# POE CONTROL VARIABLES — Governance Surface
## The 12 Variables That Keep POE Stable
## Location: .governance/invariants/CONTROL-VARIABLES.md
## Status: PERMANENT — Check before any change to prompts, schema, or UI

---

## How to Use This

Before any change to prompts, schema, UI text, visualization, or
diagnostics — check which variable(s) the change touches. Verify
the change stays within the "current setting" boundary.

---

## THE MATRIX

| # | Variable | Current Setting | Risk | Check When |
|---|----------|----------------|------|------------|
| 1 | Orientation vs adjudication | Orientation-only | VERY HIGH | Every prompt/UI edit |
| 2 | Observer/situation emphasis | Hybrid: situation center, observer edge | HIGH | Layout changes |
| 3 | Claim granularity | 5-15 per brain dump | MEDIUM | Prompt changes |
| 4 | Tensor strictness | 4 states: populated/inferred/unknown/req-clarification | MEDIUM | Schema changes |
| 5 | Socratic threshold | Mode A: never. Mode B: up to 3, gap-triggered | MEDIUM | Prompt/logic |
| 6 | Diagnostic intensity | Graduated: gentle/moderate/strong/positive | HIGH | Message wording |
| 7 | Dimensionality formula | Weighted: quad 0.25, domain 0.20, constraint 0.15, reasoning 0.20, rel 0.20 | HIGH | Scoring changes |
| 8 | Visualization density | Orientation: layers 1-4. Observatory: all 7 | MEDIUM | New visual elements |
| 9 | Language-signature influence | Overlays only. Does NOT affect structural placement | MEDIUM | Extraction logic |
| 10 | Misclassification sensitivity | Thresholds TBD via testing | HIGH | Threshold tuning |
| 11 | Longitudinal identity | Self-referential only. Orientation, never truth | HIGH | Phase 2 design |
| 12 | Vocabulary governance | Canonical table in POE-DOCTRINE.md | VERY HIGH | All user-facing text |


## QUICK LOOKUP

### When editing a system prompt:
Check Variables 1, 3, 4, 5, 6, 7, 12

### When changing the database schema:
Check Variables 1, 4, 9, 11

### When modifying the D3 visualization:
Check Variables 2, 8, 9

### When writing UI copy or labels:
Check Variables 1, 2, 6, 12

### When adjusting scoring or thresholds:
Check Variables 7, 10

### When designing Phase 2+ features:
Check Variables 11, and re-check all constitution-level (1, 2, 12)

---

## PROMPT CHANGE CLASSIFICATION RULE

System prompts are the most sensitive files in the project.

- Any change to a system prompt = MINIMUM 🟡 (Slice Amendment)
- Any change that modifies what the AI ASKS the user = 🔵 (New Slice)
- Any change that modifies axiom sections of a prompt = 🔴 (Governance)
- No prompt tweaks are ever 🟢 Features. Ever.

---

*Source: ChatGPT Architectural Review + Claude implementation notes*
*This document is PERMANENT constitutional law.*
