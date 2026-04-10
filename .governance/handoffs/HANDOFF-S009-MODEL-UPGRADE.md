# HANDOFF — S-009 Model Upgrade
# Classification: 🟢 FEATURE (single line change, no schema, no state change)
# Date: 2026-03-26
# From: Blue Ocean (Foreman)
# To: Claude Code (Builder)
# Commit message: S-009: Upgrade extraction model to Sonnet 4.6

---

## WHAT THIS DOES

Upgrades the extraction model from Sonnet 4 to Sonnet 4.6.
Free quality improvement. No cost increase. No architectural change.
S-008 has been tested and confirmed passing. This is the next step.

---

## THE CHANGE

One line in src/app/api/orient/route.ts.

Find:
  model: 'claude-sonnet-4-20250514',

Replace with:
  model: 'claude-sonnet-4-6',

That is the entire change.

---

## VERIFICATION

1. Run npx next build — must compile with zero errors
2. Submit one test brain dump at the live site
3. Confirm orientation map generates and results render normally
4. No other changes needed

---

## COMMIT

S-009: Upgrade extraction model to Sonnet 4.6

Push to main.

---

## DO NOT TOUCH

- System prompt — unchanged
- max_tokens — unchanged
- Any other file — unchanged
- Governance files — never

---
*Handoff written by Blue Ocean — Session 9 — 2026-03-26*
