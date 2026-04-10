# Interface Contract
## Google-Derived Behavioral Design Axioms
## Location: .governance/invariants/interface-contract.md
## Status: RATIFIED — Constitutional invariant

---

## Purpose

This contract governs the design and behavioral logic of your interface.
It elevates interface design from a cosmetic concern to a first-class
architectural discipline. These principles are derived from Google's
internal product design language — the system governing Google Ads,
Analytics, Search Console, and Cloud Console — the most empirically
tested software interface research in existence.

These are not stylistic preferences. They are behavioral rules.

---

## Agent Directive: Foreman Standing Authority

When the human requests any interface feature, the Foreman must:

1. **Apply Google Interface Logic by default.** Evaluate whether the
   request can be elevated by one or more axioms below.
2. **Announce the transformation.** One-line note: which axiom and why.
3. **Accept overrides without friction.** Human overrides stand. No debate.
4. **Flag conflicts.** If a request violates an axiom, name it once, proceed.

---

## The Eight Axioms

### AXIOM 1 — Minimum Viable Surface
> *Never show a field, column, or widget unless it changes a decision.*

Every element must earn its place by enabling an action or preventing an error.
**Violation signal:** Horizontal scrolling or no clear visual resting point.

### AXIOM 2 — State is Always Visible
> *Every entity and score must have an unambiguous visual state at all times.*

A user glancing for three seconds should know what's verified, pending, and flagged.
**State vocabulary:** Green=Verified, Blue=Locked, Yellow=Pending, Grey=Unverified,
Red=Flagged, Empty=No Data. Universal across all components.

### AXIOM 3 — Confidence is Always Signaled
> *A score built on two data points must look different from one built on five.*

Communicate not just values, but the evidential basis behind them.
Low-evidence data renders muted. Stale data shows staleness indicators.
**Principle:** Epistemic honesty is a product feature, not a disclaimer.

### AXIOM 4 — Actions Have Narrated Consequences
> *Every write operation produces ambient feedback. Never go silent.*

Snackbar for success, inline status for field confirmations, yellow banners
for warnings, red banners for failures, progress for >300ms operations.
**Never:** Generic "Done!" or "Something went wrong" or silent failures.

### AXIOM 5 — Hierarchy is Enforced by Density
> *Primary data is larger and darker. Secondary recedes. Tertiary is hidden.*

| Level | Usage | Treatment |
|---|---|---|
| Primary | Main name, primary score | 14-16px, weight 500 |
| Secondary | Type, status | 12-13px, weight 400, muted |
| Tertiary | Timestamps, IDs | 11-12px, weight 400, very muted |
| Suppressed | Debug, system data | Hidden until expanded |

### AXIOM 6 — Errors are Specific, Never Generic
> *"Record not found for ID 123" is an error. "Something failed" is a failure.*

Every error tells the user: (1) what happened, (2) why if known, (3) what to do next.
**Formula:** `[What failed] — [Why]. [Next action available].`
Empty states follow the same rule. "No data yet — click Import to begin."

### AXIOM 7 — Progressive Disclosure
> *Show the minimum required to decide. Reveal depth only on demand.*

Three layers: **List view** (identity + score + status) → **Detail panel**
(full breakdown) → **Deep dive** (raw data, API responses).
**Test:** Could a user complete daily work without leaving Layer 1?

### AXIOM 8 — Interruption is Earned
> *Modals and dialogs are reserved for decisions that cannot be undone.*

Never interrupt for informational messages or routine confirmations.
Reserved for: destructive actions, significant consequences, authentication.
**Test:** If the user could safely ignore the dialog, it shouldn't be one.

---

## Override Protocol

The human holds full override authority on any axiom, at any time.
Overrides are NOT logged as violations. This contract governs defaults.

## Design Token Guidance

When building UI, establish design tokens early. Use CSS variables for:
- Colors (primary, secondary, states, surfaces)
- Typography (font families, sizes, weights)
- Spacing (padding, margins, gaps)
- Elevation (shadows, borders, opacity layers)

Tokens enforce consistency across components and make theme changes trivial.

## Recommended State Vocabulary

Adapt these to your project. The key is UNIVERSAL application:

```css
--state-verified:   #34D399;  /* Green  — confirmed */
--state-locked:     #60A5FA;  /* Blue   — confirmed + immutable */
--state-pending:    #FBBF24;  /* Yellow — in progress */
--state-unverified: #6B7280;  /* Grey   — no data or unconfirmed */
--state-error:      #F87171;  /* Red    — requires attention */
```

*This document is constitutional. It does not expire with session boundaries.
Every new agent instance should treat this as standing law.*
