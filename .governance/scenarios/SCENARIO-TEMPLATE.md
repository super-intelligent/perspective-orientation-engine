# SCENARIO TEMPLATE
## Copy this file for each new feature scenario
## Location: .governance/scenarios/[feature-name].md

---

## Scenario: [Feature Name — e.g., "User Imports CSV File"]

**Slice:** SLICE-[NAME]
**Classification:** [🟢🟡🔵🔴]
**Author:** [Foreman agent name]
**Date:** [date]

---

## Preconditions
- [What must be true before this scenario starts]
- [Example: User is logged in, project exists, data table is empty]

## Walkthrough

**Step 1:** [What the user does]
- [What they see]
- [What the system does in response]

**Step 2:** [Next action]
- [Expected result]
- [Any validation or feedback shown]

**Step 3:** [Continue the journey...]
- [Keep going until the scenario is complete]

## Checkpoints (Testable — each must PASS or FAIL)

- [ ] CP-1: [Specific, falsifiable condition]
  Example: "After upload, the system displays row count matching the CSV"
- [ ] CP-2: [Another testable condition]
- [ ] CP-3: [Another testable condition]

## Error Scenarios

**What if [something goes wrong]?**
- [What the user sees]
- [What the system does]

**What if [another failure mode]?**
- [Expected behavior]

## Perlocutionary Checkpoints (POE-Specific)

- [ ] PC-1: Reading the output, does the user feel ORIENTED
  or EVALUATED? (Must feel oriented.)
- [ ] PC-2: Does any system-generated text use forbidden
  vocabulary from POE-DOCTRINE.md? (Must not.)
- [ ] PC-3: Could a reasonable user interpret any output as
  a truth claim? (Must not be interpretable as one.)

## Invariants Referenced
- [Link to any invariant files that apply]
- Example: `invariants/interface-contract.md` — Axiom 6 (specific errors)
- Example: `invariants/POE-DOCTRINE.md` — Vocabulary governance
- Example: `invariants/CONTROL-VARIABLES.md` — Variable 6 (diagnostic intensity)

## Notes
- [Any architectural notes, gotchas, or context for the Builder]

---
*Scenario written by [agent name] — Session [N]*
*This scenario is BUILD-FACING (visible to Claude Code)*
*For judge-only scenarios, place in scenarios/_holdout/*
