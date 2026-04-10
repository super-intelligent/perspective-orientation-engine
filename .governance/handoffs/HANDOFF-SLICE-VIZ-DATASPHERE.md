# HANDOFF — SLICE-VIZ-DATASPHERE
## Phase 1: Canvas 2D Tensor Visualization
## Session: 11 → Claude Code build
## Date: 2026-04-01
## Risk: 🔴 RED
## Written by: Blue Ocean (Foreman)

---

## WHAT THIS SLICE BUILDS

A Canvas 2D tensor visualization component wired to real orientation data.
It adds an "Observatory" toggle to the results view, switching between:
- The existing card list (Orientation mode, unchanged)
- The Datasphere visualization (Observatory mode, new)

No schema changes. No new API calls. Data source is result.claims — already
in memory from the orientation extraction result.

---

## PREREQUISITES — VERIFY BEFORE TOUCHING CODE

1. Run the live site and submit a brain dump. Confirm results render.
2. Confirm /orient/[uuid] URL still works for a saved orientation.
3. Confirm you are on branch: main, git hash: 6da9ccf

Do NOT proceed if any of the above fail.

---

## DATA SOURCE

The `OrientResults` component already receives a `result` prop containing:
- `result.claims` — array of claim objects (5–15 claims)
- `result.central_claim_id` — string or string[] identifying the central claim
- Both are fully populated from the existing extraction pipeline.

The Datasphere reads ONLY from these two fields.
No new RPC calls. No new API routes. No schema changes.


---

## FILES TO CREATE / MODIFY

### CREATE (new file):
`staging-app/src/components/TensorDatasphere.tsx`

### MODIFY (one addition block):
`staging-app/src/components/OrientResults.tsx`

No other files touched.

---

## PART 1 — TensorDatasphere.tsx (CREATE)

### Props Interface

```typescript
interface TensorDatasphereProps {
  claims: Claim[]               // from OrientResults — reuse same Claim type
  centralClaimId: string | string[] | undefined
}
```

Import and reuse the `Claim` interface and `ClaimNarrative` interface
already defined at the top of OrientResults.tsx.
Do NOT redefine them — import them or move them to a shared types file.

### Mode States

```typescript
type VizMode = 'sphere' | 'quadrant' | 'cynefin' | 'gravity' | 'tension'
```

### Component State

```typescript
const [mode, setMode] = useState<VizMode>('sphere')
const [rotX, setRotX] = useState(0.3)       // initial slight tilt
const [rotY, setRotY] = useState(0.4)       // initial slight rotation
const [isDragging, setIsDragging] = useState(false)
const [dragStart, setDragStart] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 })
const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
const [autoRotate, setAutoRotate] = useState(true)
const canvasRef = useRef<HTMLCanvasElement>(null)
const animFrameRef = useRef<number>(0)
```


### Constants

```typescript
const QUADRANT_COLORS: Record<string, string> = {
  UL: '#a78bfa',   // purple
  UR: '#60a5fa',   // blue
  LL: '#4ade80',   // green
  LR: '#fb923c',   // coral
}

const RELEVANCE_RADIUS: Record<string, number> = {
  High: 11, Medium: 8, Low: 5,
}

const DOMAIN_DEPTH: Record<string, number> = {
  Clear: 0.8, Complicated: 0.3, Complex: -0.3, Chaotic: -0.8, Confused: 0,
}

const CENTRAL_COLOR = '#f59e0b'
const CANVAS_BG = '#0d0d0d'         // matches var(--poe-bg) approximately
const LINE_COLOR = 'rgba(245,245,245,0.08)'
const TENSION_COLOR = 'rgba(245,159,11,0.35)'
const AXIS_LABEL_COLOR = 'rgba(245,245,245,0.30)'
```

### 3D Position Derivation

For each claim, derive a deterministic 3D position from its tensor:

```typescript
function get3DPos(claim: Claim): [number, number, number] {
  // X: Individual (negative) ↔ Collective (positive)
  const x = (claim.quadrant === 'LL' || claim.quadrant === 'LR') ? 0.55 : -0.55
  // Y: Interior (positive) ↔ Exterior (negative)
  const y = (claim.quadrant === 'UL' || claim.quadrant === 'LL') ? 0.55 : -0.55
  // Z: Cynefin complexity depth
  const z = DOMAIN_DEPTH[claim.domain] ?? 0
  // Deterministic jitter — claim.id is "c1"…"c15", so multiply up to get spread
  // Use distinct primes per axis to avoid correlated offsets
  const seq = parseInt(claim.id.replace(/\D/g, '') || '1')
  const s = seq * 100 + 37          // base seed: 137, 237, 337 … good spread
  const jx = ((s * 17) % 97) / 97 * 0.28 - 0.14
  const jy = ((s * 31) % 89) / 89 * 0.28 - 0.14
  const jz = ((s * 53) % 79) / 79 * 0.22 - 0.11
  return [x + jx, y + jy, z + jz]
}
```


### Perspective Projection

```typescript
interface Projected {
  screenX: number
  screenY: number
  depth: number     // z2 value — used for draw order and opacity scaling
  scale: number     // perspective scale factor
}

function project(
  pos: [number, number, number],
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  sphereRadius: number
): Projected {
  let [x, y, z] = pos
  // Rotate around Y axis
  const x1 = x * Math.cos(rotY) - z * Math.sin(rotY)
  const z1 = x * Math.sin(rotY) + z * Math.cos(rotY)
  // Rotate around X axis
  const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX)
  const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX)
  // Perspective (fov = 2.5)
  const fov = 2.5
  const pScale = fov / (fov + z2)
  return {
    screenX: cx + x1 * sphereRadius * pScale,
    screenY: cy - y2 * sphereRadius * pScale,  // canvas Y inverted
    depth: z2,
    scale: pScale,
  }
}
```

sphereRadius = Math.min(canvas.width, canvas.height) * 0.36

### Draw Order

Sort projected claims by depth ascending (back-to-front) before drawing.
This ensures near claims appear over distant claims.

```typescript
const sorted = [...projected].sort((a, b) => a.proj.depth - b.proj.depth)
```


### SPHERE MODE — Rendering Spec

Canvas bg: fill with CANVAS_BG.

**Axis guide lines** (draw first, faintest):
Draw 3 axis lines through center as thin dashed lines in AXIS_LABEL_COLOR.
X-axis: project [(-1,0,0), (+1,0,0)] and draw a line.
Y-axis: project [(0,-1,0), (0,+1,0)].
Z-axis: project [(0,0,-1), (0,0,+1)].
These give the spatial frame of reference. Opacity 0.15.

**Quadrant boundary planes** (optional — 4 faint rectangles):
Not required for Phase 1 build. Skip if adds complexity.

**Tension lines** (draw before nodes):
For each claim with quadrant_tension.length > 0 or domain_tension.length > 0:
- Find other claims whose quadrant is in this claim's quadrant_tension array
- Find other claims whose domain is in this claim's domain_tension array
- Draw a dashed line between source and each matching target
- Line color: TENSION_COLOR, lineWidth: 1, setLineDash([4, 6])
- Opacity scaled by average depth of the two endpoints: deeper = more transparent

**Glow rings for central claim** (draw after tension lines, before nodes):
Draw 3 concentric circles around the central claim's screen position:
- Radii: nodeRadius + 8, nodeRadius + 16, nodeRadius + 26
- Stroke color: 'rgba(245,159,11,0.15)', 'rgba(245,159,11,0.09)', 'rgba(245,159,11,0.05)'
- lineWidth: 1.5

**Nodes** (draw in back-to-front sorted order):
For each claim:
- radius = RELEVANCE_RADIUS[claim.relevance] * proj.scale * 0.85
  (scale by perspective — distant nodes appear smaller)
- fillColor = isCentral ? CENTRAL_COLOR : QUADRANT_COLORS[claim.quadrant]
- Alpha based on depth: range [0.5, 1.0] — distant nodes slightly faded
- Circle fill: ctx.fillStyle = colorWithAlpha, ctx.arc, ctx.fill
- Circle stroke: thin white ring at opacity 0.2 for depth separation
- If selectedClaim === claim: add a bright white ring (strokeStyle='#fff', lineWidth 1.5)

**Archetype label** (draw after all nodes):
On hover or for central claim always: display claim.archetype text near node.
For central claim: always draw archetype label below the node, white, 10px.
For hover: draw near cursor. Keep labels minimal to avoid clutter.


### QUADRANT LENS MODE — Rendering Spec

Divide canvas into 4 equal quadrants with labels at corners.
Use a 2px dividing cross in LINE_COLOR.

Quadrant zones:
- UL: top-left of canvas
- UR: top-right of canvas
- LL: bottom-left of canvas
- LR: bottom-right of canvas

For each claim, compute a 2D position within its quadrant zone:
- Base center of each quadrant: (W*0.25, H*0.25), (W*0.75, H*0.25), etc.
- Add deterministic jitter within quadrant bounds (same seed formula as 3D jitter)
- Keep nodes at least 20px from quadrant borders and 16px from each other

Node size: RELEVANCE_RADIUS (no perspective scaling in 2D modes).
Node color: QUADRANT_COLORS.
Central claim: CENTRAL_COLOR + glow ring.

Labels on canvas (small, AXIS_LABEL_COLOR):
- UL top-left:     "Interior / Individual"
- UR top-right:    "Exterior / Individual"
- LL bottom-left:  "Interior / Collective"
- LR bottom-right: "Exterior / Collective"

### CYNEFIN TERRAIN MODE — Rendering Spec

Divide canvas into 4 zones with background color washes:
- Clear (bottom-right): rgba(74,222,128,0.05)
- Complicated (top-right): rgba(96,165,250,0.05)
- Complex (top-left): rgba(167,139,250,0.06)
- Chaotic (top-center-ish, small zone): rgba(251,146,60,0.08)
- Confused: center circle, rgba(200,200,200,0.04)

Simplified for Phase 1: use 4 equal quadrants with a center circle for Confused.
Map domains to zones:
- Clear → bottom-right
- Complicated → top-right
- Complex → top-left
- Chaotic → bottom-left
- Confused → center (small circle region)

Node placement: same approach as Quadrant lens.
Terrain labels in each zone: "Clear", "Complicated", "Complex", "Chaotic".
Center label: "Confused" (if any claims have domain=Confused).


### GRAVITY MAP MODE — Rendering Spec

Central claim at canvas center.
Non-central claims arranged in concentric orbital rings by gravity_role.

Ring radii (as fraction of canvas smaller dimension):
- direct_observation: 0.18
- structural_support: 0.30
- narrative_pressure: 0.42
- internal_anchoring: 0.54
- (unknown / null gravity_role): 0.62

For each ring, distribute claims evenly around the circumference:
```
angle = (2 * Math.PI / claimsInRing) * claimIndex
x = cx + radius * Math.cos(angle - Math.PI/2)
y = cy + radius * Math.sin(angle - Math.PI/2)
```

Draw orbital guide circles in LINE_COLOR (opacity 0.12) for each ring with claims.
Draw radial connecting lines from center to each node (opacity 0.08).
Central claim: large glow rings, amber, CENTRAL_COLOR.
Labels: small gravity_role labels near ring circumference at top.

If gravity_role is null (not the central claim) — place in outermost ring.

### TENSION WEB MODE — Rendering Spec

Place claims in a circle layout first:
```
angle = (2 * Math.PI / claims.length) * claimIndex
x = cx + layoutRadius * Math.cos(angle - Math.PI/2)
y = cy + layoutRadius * Math.sin(angle - Math.PI/2)
```
layoutRadius = Math.min(W, H) * 0.32

Then draw all tension connections before drawing nodes:
- For each claim pair (A, B):
  - Connect if A.quadrant is in B.quadrant_tension
  - Connect if A.domain is in B.domain_tension
  - Or vice versa
  - Line: TENSION_COLOR, dashed, lineWidth 1–1.5
  - Multiple connections between same pair: draw one thicker line

Draw nodes on top of lines.
Central claim: CENTRAL_COLOR, larger radius.
Archetype label displayed below each node (10px, truncated to 16 chars).


### ANIMATION — Mode Transitions

When the user switches modes, animate node positions:
- Store each node's current screenX/screenY
- Compute target screenX/screenY for new mode
- Interpolate over 400ms using linear easing (or ease-out cubic)
- Use requestAnimationFrame

```typescript
// Lerp helper
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
// In the animation frame:
const elapsed = Date.now() - transitionStart
const t = Math.min(elapsed / 400, 1)
const eased = 1 - Math.pow(1 - t, 3)   // ease-out cubic
currentPositions[id].x = lerp(fromPos.x, toPos.x, eased)
currentPositions[id].y = lerp(fromPos.y, toPos.y, eased)
```

Auto-rotation (sphere mode only):
- When autoRotate=true and mode='sphere': increment rotY by 0.004 per frame
- Pause on mouse enter, resume 2s after mouse leave
- Pause permanently when user drags

### INTERACTION SPEC

**Mouse drag (sphere mode only)**:
```
onMouseDown: setIsDragging(true), capture dragStart + current rot values
onMouseMove (if dragging): 
  deltaX = e.clientX - dragStart.x
  deltaY = e.clientY - dragStart.y
  setRotY(dragStart.rotY + deltaX * 0.008)
  setRotX(dragStart.rotX - deltaY * 0.008)
onMouseUp: setIsDragging(false)
onMouseLeave: setIsDragging(false)
```

Clamp rotX to [-Math.PI * 0.48, Math.PI * 0.48] to prevent full flip.

**Click on node (all modes)**:
- Hit-test: find claim whose screen position is within nodeRadius + 4px of click
- setSelectedClaim(claim === selectedClaim ? null : claim)
- Show inspect panel below canvas (not in canvas)
- If no claim hit: setSelectedClaim(null)

**Touch support**: Map touch events to mouse events with single touch only.


### INSPECT PANEL (below canvas)

When a claim is selected, display below the canvas (in JSX, not canvas):

```tsx
{selectedClaim && (
  <div className="mt-3 p-3 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded">
    <div className="flex items-start justify-between mb-2">
      <p className="text-xs text-[var(--poe-accent)] uppercase tracking-wider">
        {selectedClaim.archetype}
      </p>
      <button
        onClick={() => setSelectedClaim(null)}
        className="text-[var(--poe-text-muted)] hover:text-[var(--poe-text-primary)] text-xs"
      >✕</button>
    </div>
    <p className="text-sm text-[var(--poe-text-primary)] mb-2">
      "{selectedClaim.text}"
    </p>
    <div className="flex flex-wrap gap-2 text-[10px] text-[var(--poe-text-secondary)]">
      <span>{selectedClaim.quadrant}</span>
      <span>·</span>
      <span>{selectedClaim.domain}</span>
      <span>·</span>
      <span>{selectedClaim.reasoning}</span>
      <span>·</span>
      <span>{selectedClaim.relevance} relevance</span>
      {selectedClaim.gravity_role && (
        <><span>·</span><span>{selectedClaim.gravity_role.replace('_',' ')}</span></>
      )}
    </div>
    {(selectedClaim.quadrant_tension?.length > 0 || selectedClaim.domain_tension?.length > 0) && (
      <p className="text-[11px] text-[var(--poe-text-muted)] mt-1">
        Tension: {[...selectedClaim.quadrant_tension, ...selectedClaim.domain_tension].join(', ')}
      </p>
    )}
  </div>
)}
```

### MODE SELECTOR (above canvas)

5 small buttons in a horizontal row, centered:

```tsx
const MODES: { key: VizMode; label: string }[] = [
  { key: 'sphere',   label: 'Datasphere' },
  { key: 'quadrant', label: 'Quadrant'   },
  { key: 'cynefin',  label: 'Cynefin'    },
  { key: 'gravity',  label: 'Gravity'    },
  { key: 'tension',  label: 'Tension'    },
]
```

Active mode button: `border-[var(--poe-accent)] text-[var(--poe-accent)]`
Inactive: `border-[var(--poe-border)] text-[var(--poe-text-muted)] hover:text-[var(--poe-text-secondary)]`
Style: `text-[10px] uppercase tracking-wider px-3 py-1 rounded border transition-colors`


---

### CANVAS SIZING

Canvas element dimensions:
- Width:  100% of its container (set via style={{ width: '100%' }})
- Height: 420px fixed
- Use a ResizeObserver (or onResize) to keep canvas.width in sync with
  the container's offsetWidth. Update canvas.width = container.offsetWidth
  whenever the container resizes. canvas.height = 420 always.

```tsx
<canvas
  ref={canvasRef}
  style={{ width: '100%', height: '420px', cursor: isDragging ? 'grabbing' : 'grab' }}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseLeave}
  onClick={handleClick}
/>
```

Set canvas.width and canvas.height in the useEffect (not via CSS alone):
```typescript
canvas.width  = canvas.offsetWidth   // actual pixel width from layout
canvas.height = 420
```
Call this every time the component mounts or the window resizes.


---

### USE EFFECT — RENDER LOOP WIRING

The component drives rendering through a single useEffect that:
1. Sets up the canvas dimensions
2. Runs the draw function every animation frame
3. Handles auto-rotation increment
4. Cleans up on unmount

```typescript
useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  // Sync canvas pixel dimensions
  canvas.width  = canvas.offsetWidth
  canvas.height = 420

  let frameId: number
  let currentRotY = rotY   // local mutable for auto-rotate

  const tick = () => {
    if (autoRotate && mode === 'sphere' && !isDragging) {
      currentRotY += 0.004
    }
    draw(canvas, claims, centralIds, mode, rotX, currentRotY, selectedClaim)
    frameId = requestAnimationFrame(tick)
  }

  frameId = requestAnimationFrame(tick)

  return () => cancelAnimationFrame(frameId)
}, [claims, mode, rotX, rotY, isDragging, autoRotate, selectedClaim])
```

The `draw` function is a plain function (not a hook) that takes all values
as arguments and calls all the canvas drawing logic described above.
It should not read from state directly — accept everything as parameters.

Signature:
```typescript
function draw(
  canvas: HTMLCanvasElement,
  claims: Claim[],
  centralIds: string[],
  mode: VizMode,
  rotX: number,
  rotY: number,
  selectedClaim: Claim | null
): void
```

Inside draw:
1. Get ctx = canvas.getContext('2d'). If null, return.
2. Clear canvas: ctx.clearRect(0, 0, canvas.width, canvas.height)
3. Fill bg: ctx.fillStyle = CANVAS_BG; ctx.fillRect(...)
4. Compute cx = canvas.width / 2, cy = canvas.height / 2
5. sphereRadius = Math.min(canvas.width, canvas.height) * 0.36
6. Branch on mode — call the appropriate draw sub-function


---

## PART 2 — OrientResults.tsx (MODIFY)

### Step 1 — Move shared types to a shared file

Move the `Claim` and `ClaimNarrative` interfaces out of `OrientResults.tsx`
into a new file: `staging-app/src/types/orientation.ts`

```typescript
// staging-app/src/types/orientation.ts
export interface ClaimNarrative {
  quadrant: string
  domain: string
  reasoning: string
  relevance: string
  gravity: string
}

export interface Claim {
  id: string
  text: string
  quadrant: 'UL' | 'UR' | 'LL' | 'LR'
  domain: string
  reasoning: string
  relevance: string
  inferred: boolean
  archetype: string
  narrative: ClaimNarrative | string
  quadrant_tension: string[]
  domain_tension: string[]
  gravity_role: string | null
}
```

Then update imports in both `OrientResults.tsx` and `TensorDatasphere.tsx`:
```typescript
import type { Claim, ClaimNarrative } from '@/types/orientation'
```

### Step 2 — Add Observatory toggle state to OrientResults

At the top of the `OrientResults` component function, add:
```typescript
const [showDatasphere, setShowDatasphere] = useState(false)
```

### Step 3 — Add import

At the top of OrientResults.tsx, add:
```typescript
import TensorDatasphere from '@/components/TensorDatasphere'
```


### Step 4 — Insert toggle bar and conditional Datasphere render

In OrientResults.tsx, locate the RETURN block that begins:
```tsx
return (
  <div className="flex-1 py-8">
    <h2 className="text-lg font-medium text-[var(--poe-text-primary)] mb-1">
      Orientation Map Generated
    </h2>
    <p className="text-xs text-[var(--poe-text-muted)] mb-8">
      Orientation snapshot. Not a verdict.
    </p>

    <div className="space-y-3">
```

REPLACE the opening of that block with:
```tsx
return (
  <div className="flex-1 py-8">
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-lg font-medium text-[var(--poe-text-primary)]">
        Orientation Map Generated
      </h2>
      <div className="flex gap-2">
        <button
          onClick={() => setShowDatasphere(false)}
          className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded border transition-colors ${
            !showDatasphere
              ? 'border-[var(--poe-accent)] text-[var(--poe-accent)]'
              : 'border-[var(--poe-border)] text-[var(--poe-text-muted)] hover:text-[var(--poe-text-secondary)]'
          }`}
        >
          Orientation
        </button>
        <button
          onClick={() => setShowDatasphere(true)}
          className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded border transition-colors ${
            showDatasphere
              ? 'border-[var(--poe-accent)] text-[var(--poe-accent)]'
              : 'border-[var(--poe-border)] text-[var(--poe-text-muted)] hover:text-[var(--poe-text-secondary)]'
          }`}
        >
          Observatory
        </button>
      </div>
    </div>
    <p className="text-xs text-[var(--poe-text-muted)] mb-8">
      Orientation snapshot. Not a verdict.
    </p>

    {showDatasphere ? (
      <TensorDatasphere
        claims={claims}
        centralClaimId={result.central_claim_id}
      />
    ) : (
    <div className="space-y-3">
```

Then at the END of the card list block (after `{/* Other claims in original order */}` section,
before the "Orient again" button), close the new conditional wrapper:
```tsx
    </div>
    )}
```

The "Orient again" button and the outer `</div>` remain unchanged after this.


---

## ACCEPTANCE CRITERIA

Claude Code must verify ALL of the following before declaring the slice done.

### Must pass — functional

1. A live brain dump submission renders results with an "Orientation" and
   "Observatory" toggle at the top of the results panel.

2. "Orientation" toggle shows the existing card list exactly as before.
   No existing UI is broken. All badge pills, narratives, gravity section,
   and "Orient again" button still work.

3. "Observatory" toggle shows the TensorDatasphere canvas component.

4. Datasphere sphere mode renders:
   - All claims as colored nodes (correct quadrant colors)
   - Central claim as amber with glow rings
   - Nodes positioned in 3D space with visible quadrant/depth structure
   - Canvas is not blank, not all black, not all claims at center

5. Mouse drag in sphere mode rotates the field. Dragging left/right
   rotates around Y. Dragging up/down rotates around X.

6. Auto-rotation runs when sphere mode is idle. Stops when user hovers.

7. All 5 mode buttons are visible and clickable.

8. Switching modes animates node positions (claims visibly travel to new
   positions — not a hard cut).

9. Clicking a node opens the inspect panel below the canvas showing
   the claim's archetype, text, and tensor coordinates.

10. Clicking the ✕ in the inspect panel closes it.

11. /orient/[uuid] (saved orientation view) also shows the toggle and
    Observatory works on saved orientations.

### Must pass — no regression

12. All existing /orient/[uuid] URLs continue to load correctly.
13. The OrientInput and submission flow is unchanged.
14. No TypeScript errors in build output.
15. No console errors on load or mode switch.

### Acceptance is NOT met if:

- Canvas is blank or all-black in sphere mode
- Claims all render at the same position (jitter not working)
- Mode switch causes an error or crash
- Existing card view is broken by the toggle
- TypeScript build fails

---

## SESSION STATE UPDATE (after passing all criteria)

When the build passes, update SESSION-STATE.md:

1. Change SLICE-VIZ-DATASPHERE in the build queue from 🔴 to ✅ DONE
2. Under "WHAT IS LIVE", add:
   - Observatory toggle on orientation results (card view ↔ Datasphere)
   - Canvas 2D Datasphere: 5 lens modes (sphere, quadrant, cynefin, gravity, tension)
   - Animated mode transitions
   - Click-to-inspect tensor panel
3. Update the git hash after commit
4. Record the session number (12 or whatever applies)
5. Note: claims table data is NOT yet used — Datasphere reads result.claims
   from in-memory extraction JSON. Longitudinal multi-orientation mode
   (get_project_claims) is Phase 2, sequenced after SLICE-PROJECT-UI.

---

## DOCTRINE COMPLIANCE NOTE

This slice touches Control Variables 2, 8, 9, and 12 (per FEATURE spec).

- CV2: The central claim remains the gravitational center in Gravity mode.
  The observer (user) remains at the periphery. No hierarchy of importance
  is implied by orbital distance — only structural relationship.
- CV8: The Observatory toggle is exactly the Orientation/Observatory split
  described in Control Variable 8. Card view = Orientation (layers 1-4).
  Datasphere = Observatory (all 7 layers visible).
- CV9: The visualization does not influence structural placement.
  Positions are determined by the extraction model, not the renderer.
- CV12: All new UI labels must use canonical vocabulary:
  "Observatory" (not "3D view"), "Datasphere" (not "visualization"),
  "Projection Lenses" (not "modes" in any user-facing copy, though
  internal code variable names may use 'mode').

TRUE-BY-ASSUMPTION is preserved throughout. The Datasphere renders
positions. It does not evaluate claims. No node is "better" than another.

---

*Handoff written and audited by Blue Ocean — Session 11 — 2026-04-01*
*Anti-Rush Doctrine applied. Reviewed twice before release.*
*All bugs corrected before this file left the Foreman's hands.*

