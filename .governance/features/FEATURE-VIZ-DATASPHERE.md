# FEATURE — TENSOR DATASPHERE VISUALIZATION
## Visual Rendering of the Orientation Field
## Date: 2026-03-31
## Source: Blue Ocean architectural brainstorm — Session 10
## Status: SPEC COMPLETE — Awaiting slice sequencing
## Classification: 🔴 RED — touches visualization, schema (future), and product architecture

---

## THE CORE INSIGHT

Claims are not flat objects. Every claim in a POE extraction already carries
a rich multi-dimensional tensor position:

- **AQAL quadrant** (X/Y spatial coordinates: Individual↔Collective, Interior↔Exterior)
- **Cynefin domain** (Z-depth / complexity gradient)
- **Reasoning mode** (angular distribution within domain: deductive/inductive/abductive)
- **Relevance weight** (node size)
- **Gravity type** (orbital distance from central claim)
- **Tension vectors** (directional pulls toward other claims)

The current card view flattens this sphere into a linear list.
The Datasphere re-inflates it. The result is not a prettier display —
it is a fundamentally different cognitive instrument.

**The philosophical payoff (Vervaeke alignment):**
Relevance realization is a *spatial* cognitive act. The brain does not
categorize — it *orients*. A 3D tensor field that the user can rotate,
project, and inhabit maps directly to how orientation actually works in
the mind. Users won't just *read* their orientation — they will *inhabit* it.

---

## DOCTRINE COMPLIANCE — GYROSCOPE TEST

| Element | Compliance |
|---|---|
| Datasphere shows projections, not judgments | ✅ |
| Gravity map shows orbital structure, not importance hierarchy | ✅ |
| Cynefin terrain shows complexity landscape, not prescription | ✅ |
| Trajectory (future) shows movement, not progress | ✅ |
| TRUE-BY-ASSUMPTION preserved — positions from AI placement, not evaluation | ✅ |
| Control Variable 2: situation at center, observer at edge | ✅ |
| Control Variable 8: Orientation = layers 1-4 / Observatory = all 7 | ✅ |

---

## THREE RENDERING CONCEPTS

### Concept A — DATASPHERE (3D Rotatable Field)

Claims float in 3D space positioned by their full tensor.

- **X-axis** = Individual ↔ Collective (AQAL horizontal)
- **Y-axis** = Interior ↔ Exterior (AQAL vertical)
- **Z-axis** = Cynefin complexity depth (Clear at front, Chaotic at back)
- **Node size** = relevance weight (High/Medium/Low)
- **Node color** = AQAL quadrant (UL purple · UR blue · LL green · LR coral)
- **Central claim** = luminous amber attractor with orbital glow rings
- **Tension lines** = dashed threads connecting claims with overlapping tensor fields
- **Interaction** = drag to rotate; click to inspect tensor; spin reveals structure

This is the **Observatory mode** (Control Variable 8: all 7 layers visible).
The current card view remains the Orientation default (layers 1-4).

---

### Concept B — PROJECTION LENSES (Mode Switching)

Same underlying tensor data, collapsed into different 2D projections
with smooth animated transitions between them. The user switches lenses
to ask different structural questions of the same orientation.

**Four lens modes:**

| Lens | Question it answers | Layout |
|---|---|---|
| Quadrant lens | Where do my claims live on the AQAL grid? | 4-quadrant spatial grid |
| Cynefin terrain | What is the complexity landscape of this orientation? | 4-domain zone map |
| Gravity map | What is orbiting what, and how tightly? | Hub + orbital ring layout |
| Tension web | Where are the fields of pull between claims? | Force-directed tension graph |

**The power:** Same data — radically different insight surface. Each lens
illuminates a different structural dimension of the same tensor field.
The animated transition between lenses communicates that these are
*projections* of one underlying reality, not separate analyses.

This is the **Orientation view default** (layers 1-4 of Control Variable 8).

---

### Concept C — LONGITUDINAL TRAJECTORY (Future — Phase 3+)

As a user accumulates orientations within a Project, the gravitational
center moves across sessions. Visualizing this movement as a trail
through the tensor field reveals not a snapshot but a *path of reorientation* —
the most cognitively significant output POE can eventually produce.

Example trajectory across three orientations:
```
Orientation 1 center: "Systemic Fracture Realization"  → LR / Complex
Orientation 2 center: "Authority Legitimacy Crisis"    → LL / Chaotic
Orientation 3 center: "Role Identity Displacement"     → UL / Complex
```

The trail shows: systemic concern → authority questioning → identity reorientation.

This is NOT interpretation. It is **trajectory visibility**.
The system shows the path. It does not evaluate the path.

**Sequencing dependency:** Requires SLICE-LONGITUDINAL (Projects table + project_id
on orientations) and multiple orientation records per user. This is Phase 3+
in the implementation sequence. Architecture is preserved here so the
Datasphere rendering can be designed with trajectory in mind from the start.

---

## TECHNOLOGY RECOMMENDATION

| Layer | Technology | Rationale |
|---|---|---|
| Datasphere 3D | **Canvas 2D** (now) / **Three.js** (future) | Canvas 2D with manual perspective projection is sufficient for the first Observatory mode and has zero additional dependencies. When the Observatory becomes a priority, Three.js migration delivers true WebGL depth, particle effects, and full quaternion rotation. |
| Projection lenses (2D) | **D3.js** force/radial layout | D3 handles animated transitions between node positions (forceSimulation with alpha cooling) better than anything else. Smooth morphing between lens modes is the key UX moment. |
| Longitudinal trail | **D3.js** path + temporal encoding | Natural fit for time-series spatial data. Trail thickness or opacity can encode recency. |

**Immediate build recommendation:**
Canvas 2D with manual perspective projection for the first real slice.
The S-008 data attributes (`data-claim-id`, `data-axis-key`, `data-narrative-key`)
were pre-wired precisely for this binding. No schema changes required for Phase 1.

**Three.js upgrade path:**
Three.js is the correct eventual target for the Datasphere, not the starting point.
The Canvas 2D version proves the concept and ships faster. When Observatory mode
becomes a priority product feature, migrate to Three.js for full WebGL depth.

---

## DATA ATTRIBUTES ALREADY WIRED (S-008)

The following attributes were pre-placed on claim DOM elements in S-008
specifically to support this viz layer:

```html
data-claim-id="[uuid]"
data-axis-key="[quadrant].[domain].[reasoning]"
data-narrative-key="[narrative-section]"
```

The D3 / Canvas binding reads these attributes directly from the existing
rendered DOM without requiring API changes or schema changes.
This is Phase 1's key architectural advantage.

---

## CONTROL VARIABLES TOUCHED

Checked against CONTROL-VARIABLES.md before any build begins:

| Variable | Impact |
|---|---|
| #2 — Observer/situation emphasis | Gravity map must keep situation (central claim) at center, observer at edge |
| #8 — Visualization density | Orientation mode = layers 1-4 (Projection Lenses). Observatory = all 7 (Datasphere) |
| #9 — Language-signature influence | Overlay only. Does NOT affect structural placement |
| #12 — Vocabulary governance | New UI labels must use canonical vocabulary (see POE-DOCTRINE.md) |

---

## IMPLEMENTATION SEQUENCE

```
Phase 1 (SLICE-VIZ-DATASPHERE):
  - Canvas 2D perspective projection (Datasphere view)
  - Four projection lens modes with animated transitions
  - Click-to-inspect tensor panel
  - Toggle between current card view and Datasphere (Observatory toggle)
  - Data binding via existing S-008 data-attributes
  - No schema changes required

Phase 2 (SLICE-VIZ-DATASPHERE-V2):
  - Three.js migration for true 3D depth
  - Particle haze for the Complex/Chaotic transition boundary
  - Tension line glow effects

Phase 3 (SLICE-LONGITUDINAL — separate spec required):
  - Projects table + project_id on orientations (schema change)
  - Gravitational center trail across sessions
  - Temporal encoding (opacity or line weight = recency)
```

---

## NAMING CANON

From the Session 10 brainstorm, three concepts were named.
These names are architectural and should be used consistently:

| Name | What it means |
|---|---|
| **Datasphere** | The full 3D rotatable tensor field rendering |
| **Projection Lenses** | The four 2D collapse modes (quadrant, cynefin, gravity, tension) |
| **Longitudinal Trajectory** | The central claim trail across multiple orientations |

---

## WORKING PROTOTYPE

A fully functional interactive prototype was built in the Session 10
brainstorm using mock data from the AP teacher scenario (first live POE run,
14 claims). The prototype demonstrates:

- Canvas 2D perspective projection with mouse drag rotation
- All four projection lens modes with smooth animated transitions
- Click-to-inspect tensor panel (quadrant, domain, reasoning, relevance, gravity type, tension targets)
- Relevance-weighted node sizing
- Tension line rendering (dashed, depth-aware opacity in sphere mode)
- Amber gravitational center with orbital glow rings
- Auto-rotation with pause-on-drag
- Dark mode compliant

The prototype logic is the direct specification for SLICE-VIZ-DATASPHERE.
Claude Code should be given the prototype code as a reference implementation.

---

## SLICE CLASSIFICATION

| Attribute | Value |
|---|---|
| Name | SLICE-VIZ-DATASPHERE |
| Risk | 🔴 RED |
| Prerequisites | S-008/S-009 output testing complete, VIZ data-attributes confirmed live |
| Schema changes | None (Phase 1) |
| New routes | None (Phase 1 — embedded in existing orientation result page) |
| New dependencies | D3.js (already in build queue) |
| Control variables touched | 2, 8, 9, 12 |

---

*Filed by Blue Ocean — Session 10 — 2026-03-31*
*Source: Russell Wright direction + architectural brainstorm*
*This document is PERMANENT. It survives all session boundaries.*
