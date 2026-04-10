# POE ARCHITECTURAL VISION — Workshop + Datacube + Longitudinal Tracking
## Date: 2026-03-23
## Source: Russell Wright directive during build session
## Status: SACRED — This is the north star for future slices
## Classification: 🔴 RED — touches schema, visualization, and product architecture

---

## THE VISION (Russell's words, paraphrased)

The POE is not just an extraction tool that produces a results page.
It is heading toward a WORKSHOP — a multi-surface environment where
the user can work with their orientation data across different views,
staging areas, and visualization modes.

## THREE PILLARS

### 1. TENSOR VISUALIZATION (Datacube)

The current claim cards are a flat list. The future is spatial.

Reference: Cynefin framework diagram (Snowden, Rob England/Teal Unicorn
v13) — a 3D terrain showing domains as topological surfaces with
transition boundaries between them.

POE's version: A datacube that users can "spin" — viewing the same
orientation data from different tensor perspectives:
- AQAL quadrant view (4-quadrant spatial layout)
- Cynefin domain view (terrain/topology)
- Reasoning mode view (deductive/inductive/abductive clustering)
- Gravitational view (center + orbit relationships)
- Cross-tensor view (tension lines between claims)

These are not separate features. They are different PROJECTIONS of the
same underlying tensor field. The datacube holds all the data; each
view is a lens.

Technology: D3.js radial orientation field (already in the build queue
as SLICE-VIZ-FIELD, SLICE-VIZ-HAZE, SLICE-VIZ-RELATIONS). The Cynefin
terrain is one visualization mode. Others to be discovered through
experimentation.

### 2. WORKSHOP STAGING AREAS

The orientation output will be distributed across different screen
locations and staging areas — not confined to a single results page.

Pattern reference: Entity Veracity Hub uses staging areas as cognitive
workspaces (one per domain: sentiment, maps, citations, etc.). POE's
version:

- Central claim staging area (deep contemplation workspace)
- Claim detail staging area (per-claim exploration)
- Gravity map staging area (relationship visualization)
- Tensor projection staging area (datacube views)
- Longitudinal staging area (cross-orientation trajectory)

Each staging area is a spoke off the main orientation result. The user
enters one workspace at a time, works with that perspective, then moves
to the next. The orientation result page is the hub.

This mirrors EVH's Command Center → Staging Area pattern, adapted for
orientation rather than entity management.

### 3. PROJECT/CLUSTER IDENTITY + LONGITUDINAL TRACKING

Each brain dump should have a PROJECT IDENTITY — not just a standalone
orientation, but part of a thread. This enables:

#### Project/Cluster Model
- A user creates a "project" (or "cluster") — a named container
- Multiple brain dumps (orientations) belong to that project
- Each orientation is a snapshot in time within the project
- The project tracks how orientation SHIFTS across brain dumps

#### Central Claim Trajectory
The most powerful longitudinal feature: tracking how the gravitational
center moves FROM one orientation TO the next within a project.

Example:
  Orientation 1: Central claim = "Systemic Fracture Realization"
  Orientation 2: Central claim = "Authority Legitimacy Crisis"
  Orientation 3: Central claim = "Role Identity Displacement"

The system can show: "Your orientation center has moved from systemic
concern → authority questioning → identity reorientation across three
sessions."

This is NOT interpretation. It is TRAJECTORY VISIBILITY.
The user sees their own path. The system does not evaluate the path.

#### Schema Implication
The orientations table already stores each result. What's needed:

```sql
-- Future: Project/Cluster table
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id),
  tenant_id     uuid,  -- when multi-tenant is built
  name          text not null,
  description   text,
  created_at    timestamptz default now()
);

-- Future: Link orientations to projects
alter table public.orientations add column project_id uuid references public.projects(id);

-- Future: Track central claim trajectory
create view public.project_trajectory as
  select
    o.project_id,
    o.id as orientation_id,
    o.central_archetype,
    o.field_coherence,
    o.created_at
  from public.orientations o
  where o.project_id is not null
  order by o.project_id, o.created_at;
```

This schema is NOT built now. It is preserved here so when we build
SLICE-PERSISTENCE-V2 or SLICE-LONGITUDINAL, the design is ready.

#### Contemplative Narrative Must Be Stored

Russell's directive: the contemplative narratives (the human-readable
explanations per claim) must be stored in the database as part of
result_json. This is already the case — result_json is JSONB and stores
the entire AI output. When we add contemplative paragraphs to the
extraction output, they persist automatically.

However, for the workshop staging areas and datacube, we may eventually
need individual claim records in their own table (not just nested in
JSONB) to support cross-orientation queries, trajectory comparison,
and claim-level visualization. That is a future schema evolution.

---

## IMPLEMENTATION ORDER (Incremental, Not Big Bang)

Phase 1 (NOW): Contemplative voice in current results page
Phase 2 (NEXT): Project/cluster identity + association
Phase 3: Longitudinal trajectory view (central claim over time)
Phase 4: Staging area architecture (hub + spoke pages)
Phase 5: D3 visualization experiments (Cynefin terrain, quadrant map)
Phase 6: Datacube projections (spin between tensor views)
Phase 7: Workshop mode (full multi-staging-area experience)

Each phase is a slice or set of slices. Each builds on what came before.
The current result_json JSONB storage accommodates Phases 1-3 without
schema changes. Phase 4+ requires new routes and components. Phase 5+
requires D3.js integration.

---

## DOCTRINE COMPLIANCE

All visualization and workshop features must pass the Gyroscope Test:
"Does this keep the system stabilizing orientation, or does it nudge
toward evaluation?"

The datacube shows PROJECTIONS, not JUDGMENTS.
The trajectory shows MOVEMENT, not PROGRESS.
The workshop enables CONTEMPLATION, not PROBLEM-SOLVING.

---

*This document is PERMANENT architectural north star.
It survives all session boundaries.
Russell directed: these relationships must be stored and accessible
for advanced future slices.*
