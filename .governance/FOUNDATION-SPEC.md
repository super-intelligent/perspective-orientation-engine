# POE ENTERPRISE FOUNDATION — Schema Architecture Specification
## Classification: 🔴 RED — Constitutional architecture document
## Date: 2026-03-31 — Session 10
## Status: SPEC COMPLETE — Anti-Rush Doctrine applied — Awaiting Russell sign-off
## Prerequisite for: ALL future slices

---

## WHY THIS SPEC EXISTS

The current `orientations` table stores everything as a single JSONB blob.
This worked correctly for the build phase. It breaks for enterprise use.

The failure modes at scale:

1. **Cross-orientation queries are painful.** "Show me how claim quadrant
   distribution shifted across a user's last 6 brain dumps" requires
   extracting and parsing every JSONB blob in application code.

2. **Cross-user analytics are nearly impossible.** Aggregating field_coherence
   patterns across dozens of users requires full table scans of JSONB.

3. **Longitudinal trajectory is incoherent.** Without a normalized claims
   table, there is no query path from "story to story claim breakdown."

4. **The Datasphere reads the wrong thing.** Built on JSONB, the visualization
   reads one orientation's blob. Built on the claims table, it reads
   across all orientations in a project with a single SQL query — and
   longitudinal mode requires no architectural change, just a wider query.

The solution is a **dual-write pattern**:
- The JSONB blob stays on orientations (fast single-orientation rendering)
- Every claim is ALSO written as a normalized row in a claims table
- Both writes happen atomically inside the RPC function

One write. Two persistence paths. Zero regression on existing behavior.

---

## SOURCE VERIFICATION

This spec was written after reading the actual extraction route:
`staging-app/src/app/api/orient/route.ts`

The JSON schema below is derived from the LIVE system prompt output format,
not from documentation. Every field name matches what the AI actually emits.

Current RPC signature (verified from code):
```
save_orientation(p_brain_dump, p_result_json, p_field_coherence, p_central_archetype)
```

---

## ARCHITECTURAL DECISIONS

### Decision 1 — Dual-Write Pattern (not migration away from JSONB)

The full result_json JSONB blob STAYS on the orientations table.
Single-orientation rendering reads the blob directly — zero performance change.
Claims table is additive, not replacement. Both are written atomically.

Rationale: The JSONB blob is the "source of record" for rendering.
The claims table is the "analytics surface." They serve different queries.
A normalized-only approach would require rebuilding the renderer.
A JSONB-only approach cannot support longitudinal analytics.

### Decision 2 — New RPC (save_orientation_v2), not replacement

The current `save_orientation` RPC continues to exist and work.
A new `save_orientation_v2` is created alongside it.
The API route is updated to call v2.
The old function is deprecated (not deleted) after v2 is verified.

Rationale: Zero-downtime migration. Any cached or legacy calls still work.
Claude Code does not touch the old function — only adds the new one.

### Decision 3 — Tenant ID added NOW (nullable)

A `tenant_id` column is added to projects, orientations, and claims NOW.
It is nullable. No tenant management UI is built in this spec.

Rationale: Adding tenant_id to a table with millions of rows later
requires a painful migration. Adding it now as nullable costs nothing.
When multi-tenancy is built, the column already exists on every row.
This is the correct enterprise-forward call.

### Decision 4 — Claims are denormalized enough to query independently

Each claims row contains: user_id, project_id, orientation_id.
This denormalization means cross-user or cross-project analytics
never require joining through orientations to find the parent.
A query like "all Complex/Abductive claims for user X" is a single
indexed scan on the claims table.

### Decision 5 — Tension is axis-level (not claim-to-claim)

The extraction JSON uses `quadrant_tension: ["LL", "LR"]` and
`domain_tension: ["Chaotic"]` to express secondary axis pulls.
These are NOT references to other claims. They are secondary axis values.
Therefore: no claim_tensions join table is needed.
Tension is stored as `text[]` arrays directly on the claims row.

### Decision 6 — Gravity role is on each claim (not a join table)

The extraction JSON already includes `gravity_role` on each claim:
"structural_support" | "narrative_pressure" | "internal_anchoring" |
"direct_observation" | null (for the central claim).
This is stored as a text column on claims — no join table needed.
The full gravity_structure object is also stored as JSONB on orientations
for fast rendering.

### Decision 7 — Auth unparked as part of foundation (not separate)

SLICE-AUTH-V2 is a sub-component of the foundation build.
It is not a separate future slice.
The schema needs user_id wired everywhere before any enterprise use is valid.
Auth is the prerequisite. Schema is the consequence. They build together.

### Decision 8 — Anonymous orientations are preserved

All existing anonymous orientations (user_id = null) remain valid.
user_id is nullable on all tables.
When a user logs in after submitting an orientation, their session
can optionally be associated with a user_id (future SLICE-SESSION-CLAIM).
No forced migration of legacy data.

### Decision 9 — sequence_order extracted from claim_ref

The AI assigns claim IDs as "c1", "c2", "c3" etc.
The sequence_order integer is derived from this: c1 → 1, c2 → 2.
This preserves the extraction order without relying on insertion order.

---

## THE FULL SCHEMA

### Table 1 — projects (new)

```sql
create table public.projects (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade,
  tenant_id             uuid,                    -- nullable, future multi-tenancy
  name                  text not null,
  description           text,
  orientation_count     integer not null default 0,
  last_orientation_at   timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Indexes
create index projects_user_id_idx on public.projects(user_id);
create index projects_tenant_id_idx on public.projects(tenant_id) where tenant_id is not null;

-- RLS
alter table public.projects enable row level security;
create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);
```

### Table 2 — orientations (ALTER existing table)

The existing table stays. These columns are added via ALTER TABLE.
Claude Code must check each column exists before adding (IF NOT EXISTS).

```sql
-- Columns already likely present (verify before adding):
-- id uuid, result_json jsonb, created_at timestamptz

alter table public.orientations
  add column if not exists user_id             uuid references auth.users(id),
  add column if not exists project_id          uuid references public.projects(id),
  add column if not exists tenant_id           uuid,
  add column if not exists raw_brain_dump      text,
  add column if not exists central_archetype   text,
  add column if not exists central_claim_ref   text,
  add column if not exists field_coherence     text,
  add column if not exists claim_count         integer,
  add column if not exists socratic_needed     boolean default false,
  add column if not exists gravity_structure   jsonb;

-- Indexes (add only if not exists)
create index if not exists orientations_user_id_idx
  on public.orientations(user_id);
create index if not exists orientations_project_id_created_idx
  on public.orientations(project_id, created_at desc)
  where project_id is not null;
create index if not exists orientations_tenant_id_idx
  on public.orientations(tenant_id)
  where tenant_id is not null;
```


### Table 3 — claims (new — the critical table)

Field names are derived directly from the live extraction JSON schema.
JSON key → column name mapping is explicit below.

```sql
create table public.claims (
  id               uuid primary key default gen_random_uuid(),
  orientation_id   uuid not null references public.orientations(id) on delete cascade,
  project_id       uuid references public.projects(id),
  user_id          uuid references auth.users(id),
  tenant_id        uuid,

  -- Identity (from JSON: claims[n].id, claims[n].text, claims[n].inferred)
  claim_ref        text not null,       -- "c1", "c2" etc. — AI-assigned ID
  raw_text         text not null,       -- JSON: "text" field
  is_central       boolean not null default false,
  inferred         boolean not null default false,  -- JSON: "inferred" field
  sequence_order   integer,             -- derived: c1→1, c2→2

  -- Tensor axes (from JSON: claims[n].quadrant/domain/reasoning/relevance)
  quadrant         text not null,       -- UL | UR | LL | LR
  domain           text not null,       -- Clear | Complicated | Complex | Chaotic | Confused
  reasoning_mode   text not null,       -- JSON key "reasoning" → stored as reasoning_mode
                                        -- Deductive | Inductive | Abductive | Unknown
  relevance        text not null,       -- High | Medium | Low

  -- Semantic (from JSON: claims[n].archetype)
  archetype        text not null,       -- "Identity Destabilization"

  -- Gravity (from JSON: claims[n].gravity_role)
  gravity_role     text,                -- structural_support | narrative_pressure |
                                        -- internal_anchoring | direct_observation | null

  -- Tension — axis-level (from JSON: claims[n].quadrant_tension, domain_tension)
  quadrant_tension text[],              -- e.g. ARRAY['LL','LR'] — secondary quadrant pulls
  domain_tension   text[],              -- e.g. ARRAY['Chaotic'] — secondary domain pull

  -- Narrative (from JSON: claims[n].narrative — 5-field object)
  narrative_json   jsonb,               -- {"quadrant":"...","domain":"...","reasoning":"...",
                                        --  "relevance":"...","gravity":"..."}

  created_at       timestamptz not null default now()
);

-- Indexes
create index claims_orientation_id_idx
  on public.claims(orientation_id);
create index claims_project_id_created_idx
  on public.claims(project_id, created_at desc)
  where project_id is not null;
create index claims_user_id_quadrant_idx
  on public.claims(user_id, quadrant)
  where user_id is not null;
create index claims_user_id_central_idx
  on public.claims(user_id, is_central)
  where user_id is not null and is_central = true;
create index claims_project_central_idx
  on public.claims(project_id, is_central, created_at)
  where project_id is not null;

-- RLS
alter table public.claims enable row level security;
create policy "Users see own claims"
  on public.claims for select
  using (user_id is null or auth.uid() = user_id);
create policy "Service role full access on claims"
  on public.claims for all
  using (true)
  with check (true);
```

Note on RLS: `save_orientation_v2` runs as security definer (service role),
so it bypasses RLS for writes. User reads are protected by the select policy.


### Views

```sql
-- Project trajectory: gravitational center movement across orientations
create or replace view public.project_trajectory as
  select
    o.project_id,
    p.name                as project_name,
    o.id                  as orientation_id,
    o.central_archetype,
    o.central_claim_ref,
    o.field_coherence,
    o.claim_count,
    o.created_at,
    row_number() over (
      partition by o.project_id
      order by o.created_at
    )                     as orientation_sequence
  from public.orientations o
  join public.projects p on p.id = o.project_id
  where o.project_id is not null
  order by o.project_id, o.created_at;

-- Claim distribution by project: quadrant/domain breakdown per project
create or replace view public.project_claim_distribution as
  select
    project_id,
    quadrant,
    domain,
    reasoning_mode,
    relevance,
    count(*)                                    as claim_count,
    count(*) filter (where is_central = true)   as central_count
  from public.claims
  where project_id is not null
  group by project_id, quadrant, domain, reasoning_mode, relevance;

-- User orientation summary: one row per user with aggregate stats
create or replace view public.user_orientation_summary as
  select
    user_id,
    count(distinct o.id)          as total_orientations,
    count(distinct o.project_id)  as total_projects,
    count(c.id)                   as total_claims,
    max(o.created_at)             as last_orientation_at
  from public.orientations o
  left join public.claims c on c.orientation_id = o.id
  where o.user_id is not null
  group by o.user_id;
```

---

## RPC FUNCTION SPECIFICATION

### save_orientation_v2 (new — replaces v1 in API route)

```sql
create or replace function public.save_orientation_v2(
  p_brain_dump        text,
  p_result_json       jsonb,
  p_user_id           uuid    default null,
  p_project_id        uuid    default null,
  p_tenant_id         uuid    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orientation_id    uuid;
  v_claim             jsonb;
  v_claim_ref         text;
  v_is_central        boolean;
  v_sequence_order    integer;
  v_central_claim_ref text;
  v_field_coherence   text;
  v_central_archetype text;
  v_claim_count       integer;
  v_socratic_needed   boolean;
begin
  -- Extract summary fields from result JSON
  v_central_claim_ref := p_result_json->>'central_claim_id';
  v_field_coherence   := p_result_json->>'field_coherence';
  v_central_archetype := p_result_json->'gravity_structure'->>'center_archetype';
  v_claim_count       := jsonb_array_length(p_result_json->'claims');
  v_socratic_needed   := coalesce((p_result_json->>'socratic_needed')::boolean, false);

  -- 1. Insert orientation row
  insert into public.orientations (
    user_id, project_id, tenant_id,
    raw_brain_dump, result_json,
    central_archetype, central_claim_ref,
    field_coherence, claim_count,
    socratic_needed, gravity_structure
  ) values (
    p_user_id, p_project_id, p_tenant_id,
    p_brain_dump, p_result_json,
    v_central_archetype, v_central_claim_ref,
    v_field_coherence, v_claim_count,
    v_socratic_needed, p_result_json->'gravity_structure'
  )
  returning id into v_orientation_id;

  -- 2. Insert each claim as a normalized row (dual-write)
  for v_claim in
    select * from jsonb_array_elements(p_result_json->'claims')
  loop
    v_claim_ref      := v_claim->>'id';
    v_is_central     := (v_claim_ref = v_central_claim_ref);
    v_sequence_order := (regexp_replace(v_claim_ref, '[^0-9]', '', 'g'))::integer;

    insert into public.claims (
      orientation_id, project_id, user_id, tenant_id,
      claim_ref, raw_text, is_central, inferred, sequence_order,
      quadrant, domain, reasoning_mode, relevance,
      archetype, gravity_role,
      quadrant_tension, domain_tension,
      narrative_json
    ) values (
      v_orientation_id, p_project_id, p_user_id, p_tenant_id,
      v_claim_ref,
      v_claim->>'text',
      v_is_central,
      coalesce((v_claim->>'inferred')::boolean, false),
      v_sequence_order,
      v_claim->>'quadrant',
      v_claim->>'domain',
      v_claim->>'reasoning',        -- JSON key is "reasoning", stored as reasoning_mode
      v_claim->>'relevance',
      v_claim->>'archetype',
      case when v_is_central then null else v_claim->>'gravity_role' end,
      array(select jsonb_array_elements_text(v_claim->'quadrant_tension')),
      array(select jsonb_array_elements_text(v_claim->'domain_tension')),
      v_claim->'narrative'
    );
  end loop;

  -- 3. Update project stats if project is set
  if p_project_id is not null then
    update public.projects
    set
      orientation_count    = orientation_count + 1,
      last_orientation_at  = now(),
      updated_at           = now()
    where id = p_project_id;
  end if;

  return v_orientation_id;
end;
$$;

-- Grant execution to service role (same pattern as existing RPCs)
grant execute on function public.save_orientation_v2 to service_role;
```

### get_orientation (existing — no change to signature)

The existing `get_orientation` RPC does not need to change.
It returns the full result_json JSONB which remains complete and intact.
The renderer continues to work without modification.

### get_project_claims (new — for Datasphere and analytics)

```sql
create or replace function public.get_project_claims(
  p_project_id  uuid,
  p_user_id     uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'id',              c.id,
      'claim_ref',       c.claim_ref,
      'orientation_id',  c.orientation_id,
      'raw_text',        c.raw_text,
      'archetype',       c.archetype,
      'quadrant',        c.quadrant,
      'domain',          c.domain,
      'reasoning_mode',  c.reasoning_mode,
      'relevance',       c.relevance,
      'gravity_role',    c.gravity_role,
      'is_central',      c.is_central,
      'quadrant_tension',c.quadrant_tension,
      'domain_tension',  c.domain_tension,
      'created_at',      c.created_at
    )
    order by c.created_at, c.sequence_order
  )
  into v_result
  from public.claims c
  where c.project_id = p_project_id
    and (p_user_id is null or c.user_id = p_user_id);

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

grant execute on function public.get_project_claims to service_role;
```


---

## API ROUTE CHANGES

One change to `staging-app/src/app/api/orient/route.ts`:

**Before:**
```typescript
const { data: savedId, error: saveError } = await supabase
  .rpc('save_orientation', {
    p_brain_dump: brainDump,
    p_result_json: result,
    p_field_coherence: result.field_coherence ?? null,
    p_central_archetype: result.gravity_structure?.center_archetype ?? null,
  })
```

**After:**
```typescript
const { data: savedId, error: saveError } = await supabase
  .rpc('save_orientation_v2', {
    p_brain_dump:    brainDump,
    p_result_json:   result,
    p_user_id:       userId ?? null,      // from session if auth enabled
    p_project_id:    projectId ?? null,   // from request body if project selected
    p_tenant_id:     null,                // null until multi-tenancy is built
  })
```

The request body should be extended to accept `project_id` when project
selection UI is built (SLICE-PROJECT-UI). Until then, `p_project_id` is null.

No other changes to the API route. Return value is the same (orientation_id).
The renderer reads result_json unchanged.

---

## MIGRATION STRATEGY

### Phase 1 — Schema creation (no data migration)
1. Run SQL: create `projects` table
2. Run SQL: ALTER `orientations` (add all new columns with IF NOT EXISTS)
3. Run SQL: create `claims` table
4. Run SQL: create views
5. Run SQL: create `save_orientation_v2` RPC
6. Run SQL: create `get_project_claims` RPC
7. Update API route to call `save_orientation_v2`
8. Verify with regression test (TEST-FIXTURES)

All existing orientations remain intact. New columns are nullable.
Old `save_orientation` function is untouched. System is live throughout.

### Phase 2 — Auth wiring (SLICE-AUTH-V2)
1. Unpark auth flow (existing SLICE-AUTH code)
2. Pass user_id from session into `save_orientation_v2`
3. Wire user_id to orientations going forward (nulls for legacy rows are fine)

### Phase 3 — Project UI (SLICE-PROJECT-UI)
1. Project creation form
2. Project selector on brain dump submission screen
3. Pass project_id into `save_orientation_v2`

### Phase 4 — Backfill (optional, future)
Legacy anonymous orientations can optionally be associated with
a user when they log in (session attribution). Not required.
Not specified here. Future SLICE-SESSION-CLAIM if needed.

---

## BACKWARDS COMPATIBILITY CONTRACT

The following MUST remain true after every migration step:

1. `GET /orient/[uuid]` continues to work for all existing URLs
2. The existing `get_orientation` RPC continues to return full result_json
3. The renderer (current card view + badges + narratives) works without change
4. The existing `save_orientation` RPC continues to exist (not deleted)
5. Anonymous orientations (user_id = null) are valid and retrievable forever

These are NON-NEGOTIABLE. If any migration step would break them, STOP.

---

## BUILD SLICE BREAKDOWN

### SLICE-SCHEMA-V2 (first — foundation)
**Risk:** 🔴 RED
**Prerequisites:** S-008/S-009 output test passed
**What Claude Code builds:**
- Creates projects table
- Alters orientations table (new columns)
- Creates claims table + indexes
- Creates all views
- Creates save_orientation_v2 RPC
- Creates get_project_claims RPC
- Updates /api/orient route to call v2
- Regression test: submit TEST-FIXTURES brain dump, verify claims table populated

**Russell verifies:**
- Existing UUID URLs still work
- New orientation has rows in claims table
- Claim count matches (same number as in result_json)
- Central claim has is_central = true

### SLICE-AUTH-V2 (second — identity layer)
**Risk:** 🔴 RED
**Prerequisites:** SLICE-SCHEMA-V2 verified
**What Claude Code builds:**
- Unparks SLICE-AUTH magic link flow
- Wires auth.user.id into save_orientation_v2 call
- Configures Supabase email templates for POE project
- Adds user session to /api/orient context

### SLICE-PROJECT-UI (third — container layer)
**Risk:** 🟡 YELLOW
**Prerequisites:** SLICE-AUTH-V2 verified
**What Claude Code builds:**
- Project creation modal on orientation result page
- Project list / selector in UI
- Passes project_id into brain dump submission
- Projects page: list all user projects with orientation count

**After these three slices**, the foundation is solid.
Every subsequent slice (Datasphere, Meta Layer, Longitudinal) builds on
normalized, user-attributed, project-organized data.

---

## DOWNSTREAM IMPACT

### Datasphere (SLICE-VIZ-DATASPHERE)
After SLICE-SCHEMA-V2:
- Single-orientation mode: reads result_json blob (unchanged, fast)
- Multi-orientation / longitudinal mode: calls `get_project_claims(project_id)`
  → returns all claims across all orientations in the project
  → Datasphere renders the full project tensor field
No architectural change required when adding longitudinal — just a wider query.

### META-LAYER (incubating)
The META-LAYER reads completed extraction JSON from orientations.
It does NOT read the claims table.
SLICE-SCHEMA-V2 does not affect the META-LAYER sequencing dependency.
SLICE-SOCRATIC is still the prerequisite for unquarantining META-LAYER-SPEC.

### Longitudinal Trajectory View
After SLICE-PROJECT-UI:
```sql
-- Central claim trajectory (story-to-story)
select
  orientation_sequence,
  central_archetype,
  field_coherence,
  created_at
from public.project_trajectory
where project_id = '[uuid]'
order by orientation_sequence;
```
This is the query that drives the Longitudinal view. It works the moment
SLICE-SCHEMA-V2 and SLICE-PROJECT-UI are complete.

---

## OPEN QUESTIONS FOR RUSSELL

These require a decision before SLICE-AUTH-V2 is built (not before SLICE-SCHEMA-V2):

**Q1 — What does "enterprise" mean for the POE?**
Option A: Individual SaaS — many individual users, no org structure
Option B: Team SaaS — organizations/teams share projects
Option C: Both (individual accounts + team accounts)

The tenant_id column is already in the schema for Option B/C.
The answer determines whether SLICE-TENANT is in the build queue.

**Q2 — Should anonymous orientations be claimable?**
When a user creates an account after submitting an orientation,
should the system offer to associate that orientation with their account?
(This requires storing a session token on the orientation at submission time.)

**Q3 — Is the AP teacher brain dump text available to store in TEST-FIXTURES.md?**
The regression test referenced in SLICE-SCHEMA-V2 needs the actual input text.
(You indicated you have this file.)

---

## DOCTRINE COMPLIANCE

**TRUE-BY-ASSUMPTION:**
The schema stores claim positions without evaluating them.
No column in the claims table implies truth, validity, or correctness.
Column names (`quadrant`, `domain`, `archetype`) are placement descriptors,
not evaluative labels.

**Control Variable 2 (Observer/Situation emphasis):**
The central claim (is_central = true) is always the situation center.
The user is always at the edge. No column implies hierarchy of importance.
`is_central` is structural, not prescriptive.

**Control Variable 8 (Visualization density):**
The claims table enables all 7 visualization layers.
The Orientation mode (layers 1-4) continues to read result_json.
The Observatory mode (all 7 layers) will read the claims table.
This is the correct mapping.

**Control Variable 11 (Longitudinal identity):**
The project_trajectory view shows orientation movement, not user identity.
It tracks the gravitational center, not the person.
"The system shows the path. It does not evaluate the path."

---

## VERIFICATION CHECKPOINTS FOR CLAUDE CODE

Before building SLICE-SCHEMA-V2, Claude Code MUST verify:

1. **Current orientations table columns** — run:
   ```sql
   select column_name, data_type, is_nullable
   from information_schema.columns
   where table_name = 'orientations' and table_schema = 'public'
   order by ordinal_position;
   ```
   Do NOT add columns that already exist. Check before ALTER TABLE.

2. **Current save_orientation RPC signature** — run:
   ```sql
   select proname, pg_get_function_arguments(oid)
   from pg_proc where proname = 'save_orientation';
   ```
   Confirm before creating v2 that v1 still exists and will not be touched.

3. **JSON field names in a real result_json** — run:
   ```sql
   select result_json->'claims'->0
   from public.orientations
   order by created_at desc limit 1;
   ```
   Confirm the field names match this spec exactly:
   "id", "text", "quadrant", "domain", "reasoning", "relevance",
   "inferred", "archetype", "narrative", "quadrant_tension",
   "domain_tension", "gravity_role"
   The RPC extracts fields by name. A mismatch = silent null writes.

4. **RLS on orientations** — confirm existing policy names before adding new ones.
   Do not create duplicate policies.

---

## SESSION STATE UPDATE REQUIRED

When this spec is signed off by Russell, update SESSION-STATE.md:
- Add SLICE-SCHEMA-V2, SLICE-AUTH-V2, SLICE-PROJECT-UI to build queue
  (insert before SLICE-VIZ-DATASPHERE)
- Note FOUNDATION-SPEC.md as the governing document for all three slices
- Note that TEST-FIXTURES.md is pending (Russell has the brain dump text)

---

*Filed by Blue Ocean — Session 10 — 2026-03-31*
*Anti-Rush Doctrine applied. Spec written from verified source code.*
*Russell Wright must sign off before any handoff is written.*
*This document governs SLICE-SCHEMA-V2, SLICE-AUTH-V2, and SLICE-PROJECT-UI.*
