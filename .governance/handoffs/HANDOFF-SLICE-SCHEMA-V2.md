# HANDOFF — SLICE-SCHEMA-V2
## Enterprise Foundation: Projects + Claims + Dual-Write
## Date: 2026-03-31 — Session 10
## Status: READY FOR CLAUDE CODE — Russell signed off
## Risk: 🔴 RED — touches database schema, RPC functions, and API route
## Governing spec: .governance/FOUNDATION-SPEC.md

---

## WHAT THIS SLICE DOES

Transforms the POE from a single-user JSONB blob store into an enterprise
foundation capable of supporting dozens of users tracking story-to-story
claim breakdowns over time.

Three things are built:
1. A `projects` table — named containers for groups of brain dumps
2. A `claims` table — one row per extracted claim (normalized, queryable)
3. A `save_orientation_v2` RPC — dual-writes to both orientations and claims atomically

The existing system is NOT broken. Zero regression on existing behavior.
All existing URLs continue to work. The old save_orientation RPC is untouched.

---

## PREREQUISITES — VERIFY BEFORE TOUCHING ANYTHING

Run these SQL queries in the Supabase SQL Editor for project:
**POE project ID: pvrirrwgiyejsuoaohvb**
DO NOT run against the entity-veracity-hub project.

### Verification Query 1 — Current orientations columns
```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'orientations' and table_schema = 'public'
order by ordinal_position;
```
Note every column that already exists. The ALTER TABLE step uses
IF NOT EXISTS for every column — but you must know what's there.

### Verification Query 2 — Current RPC functions
```sql
select proname, pg_get_function_arguments(oid)
from pg_proc
where proname in ('save_orientation', 'get_orientation')
and pronamespace = (select oid from pg_namespace where nspname = 'public');
```
Confirm save_orientation exists and note its exact signature.
You will NOT modify it. You will create save_orientation_v2 alongside it.

### Verification Query 3 — Real JSON field names from live data
```sql
select result_json->'claims'->0
from public.orientations
order by created_at desc limit 1;
```
Confirm these exact field names exist in the output:
"id", "text", "quadrant", "domain", "reasoning", "relevance",
"inferred", "archetype", "narrative", "quadrant_tension",
"domain_tension", "gravity_role"

CRITICAL: The JSON key is "reasoning" but the column is named "reasoning_mode".
The RPC maps this explicitly. If "reasoning" is missing from the JSON, STOP
and report to Russell before proceeding.

### Verification Query 4 — Existing RLS policies on orientations
```sql
select policyname, cmd, qual
from pg_policies
where tablename = 'orientations' and schemaname = 'public';
```
Note policy names. Do not create duplicate policies.

---

## BUILD ORDER — EXECUTE EXACTLY IN THIS SEQUENCE

### STEP 1 — Create the projects table (Supabase SQL Editor)

```sql
create table public.projects (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade,
  tenant_id             uuid,
  name                  text not null,
  description           text,
  orientation_count     integer not null default 0,
  last_orientation_at   timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index projects_user_id_idx
  on public.projects(user_id);
create index projects_tenant_id_idx
  on public.projects(tenant_id)
  where tenant_id is not null;

alter table public.projects enable row level security;

create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);
```

Verify after running:
```sql
select count(*) from public.projects;
-- should return 0 (empty, just created)
```

---

### STEP 2 — Alter the orientations table

Run each line carefully. IF NOT EXISTS prevents errors if a column
was already added in a previous attempt.

```sql
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

create index if not exists orientations_user_id_idx
  on public.orientations(user_id);
create index if not exists orientations_project_id_created_idx
  on public.orientations(project_id, created_at desc)
  where project_id is not null;
create index if not exists orientations_tenant_id_idx
  on public.orientations(tenant_id)
  where tenant_id is not null;
```

Verify after running:
```sql
select column_name from information_schema.columns
where table_name = 'orientations' and table_schema = 'public'
order by ordinal_position;
```
Confirm all new columns appear in the list.

---

### STEP 3 — Create the claims table

```sql
create table public.claims (
  id               uuid primary key default gen_random_uuid(),
  orientation_id   uuid not null references public.orientations(id) on delete cascade,
  project_id       uuid references public.projects(id),
  user_id          uuid references auth.users(id),
  tenant_id        uuid,

  claim_ref        text not null,
  raw_text         text not null,
  is_central       boolean not null default false,
  inferred         boolean not null default false,
  sequence_order   integer,

  quadrant         text not null,
  domain           text not null,
  reasoning_mode   text not null,
  relevance        text not null,

  archetype        text not null,
  gravity_role     text,

  quadrant_tension text[],
  domain_tension   text[],

  narrative_json   jsonb,

  created_at       timestamptz not null default now()
);

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

alter table public.claims enable row level security;

create policy "Users see own claims"
  on public.claims for select
  using (user_id is null or auth.uid() = user_id);

create policy "Service role full access on claims"
  on public.claims for all
  using (true)
  with check (true);
```

Verify after running:
```sql
select count(*) from public.claims;
-- should return 0 (empty, just created)
```

---

### STEP 4 — Create the analytics views

```sql
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
    ) as orientation_sequence
  from public.orientations o
  join public.projects p on p.id = o.project_id
  where o.project_id is not null
  order by o.project_id, o.created_at;

create or replace view public.project_claim_distribution as
  select
    project_id,
    quadrant,
    domain,
    reasoning_mode,
    relevance,
    count(*)                                  as claim_count,
    count(*) filter (where is_central = true) as central_count
  from public.claims
  where project_id is not null
  group by project_id, quadrant, domain, reasoning_mode, relevance;

create or replace view public.user_orientation_summary as
  select
    o.user_id,
    count(distinct o.id)         as total_orientations,
    count(distinct o.project_id) as total_projects,
    count(c.id)                  as total_claims,
    max(o.created_at)            as last_orientation_at
  from public.orientations o
  left join public.claims c on c.orientation_id = o.id
  where o.user_id is not null
  group by o.user_id;
```

---

### STEP 5 — Create save_orientation_v2 RPC

This is the most critical function. Read it fully before running.
Key mapping: JSON key "reasoning" → column "reasoning_mode" (line noted inline).

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
  v_central_claim_ref := p_result_json->>'central_claim_id';
  v_field_coherence   := p_result_json->>'field_coherence';
  v_central_archetype := p_result_json->'gravity_structure'->>'center_archetype';
  v_claim_count       := jsonb_array_length(p_result_json->'claims');
  v_socratic_needed   := coalesce((p_result_json->>'socratic_needed')::boolean, false);

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
      v_claim->>'reasoning',    -- JSON key "reasoning" maps to column "reasoning_mode"
      v_claim->>'relevance',
      v_claim->>'archetype',
      case when v_is_central then null else v_claim->>'gravity_role' end,
      array(select jsonb_array_elements_text(
        coalesce(v_claim->'quadrant_tension', '[]'::jsonb)
      )),
      array(select jsonb_array_elements_text(
        coalesce(v_claim->'domain_tension', '[]'::jsonb)
      )),
      v_claim->'narrative'
    );
  end loop;

  if p_project_id is not null then
    update public.projects
    set
      orientation_count   = orientation_count + 1,
      last_orientation_at = now(),
      updated_at          = now()
    where id = p_project_id;
  end if;

  return v_orientation_id;
end;
$$;

grant execute on function public.save_orientation_v2 to service_role;
```

Verify the function was created:
```sql
select proname, pg_get_function_arguments(oid)
from pg_proc
where proname = 'save_orientation_v2'
and pronamespace = (select oid from pg_namespace where nspname = 'public');
```
Should return one row.

---

### STEP 6 — Create get_project_claims RPC

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

### STEP 7 — Update the API route

File: `staging-app/src/app/api/orient/route.ts`

Find this block (around line 220):
```typescript
const { data: savedId, error: saveError } = await supabase
  .rpc('save_orientation', {
    p_brain_dump: brainDump,
    p_result_json: result,
    p_field_coherence: result.field_coherence ?? null,
    p_central_archetype: result.gravity_structure?.center_archetype ?? null,
  })
```

Replace it with:
```typescript
const { data: savedId, error: saveError } = await supabase
  .rpc('save_orientation_v2', {
    p_brain_dump:  brainDump,
    p_result_json: result,
    p_user_id:     null,
    p_project_id:  null,
    p_tenant_id:   null,
  })
```

No other changes to route.ts. The return shape is identical.
user_id and project_id are null until SLICE-AUTH-V2 and SLICE-PROJECT-UI
wire them in. That is correct and expected.

---

### STEP 8 — Regression test (the critical verification step)

After deploying the updated route, Russell will submit the TEST-FIXTURES
brain dump at perspective.super-intelligent.ai.

You (Claude Code) must then run these verification queries and report results:

```sql
-- 1. Did the orientation save?
select id, central_archetype, field_coherence, claim_count, created_at
from public.orientations
order by created_at desc limit 1;

-- 2. Did claims get written? (should match claim_count above)
select count(*) as claim_count
from public.claims
where orientation_id = (
  select id from public.orientations order by created_at desc limit 1
);

-- 3. Is exactly one claim marked central?
select claim_ref, raw_text, is_central, archetype, quadrant, domain, reasoning_mode
from public.claims
where orientation_id = (
  select id from public.orientations order by created_at desc limit 1
)
order by sequence_order;

-- 4. Does is_central match the central_claim_ref on the orientation?
select
  o.central_claim_ref,
  c.claim_ref,
  c.is_central,
  c.archetype
from public.orientations o
join public.claims c on c.orientation_id = o.id and c.is_central = true
order by o.created_at desc limit 1;

-- 5. Are quadrant_tension and domain_tension arrays (not null)?
select claim_ref, quadrant_tension, domain_tension
from public.claims
where orientation_id = (
  select id from public.orientations order by created_at desc limit 1
)
order by sequence_order;

-- 6. Does the old UUID URL still work? (copy an existing UUID from orientations)
select id from public.orientations order by created_at asc limit 3;
-- Then test: perspective.super-intelligent.ai/orient/[each uuid]
-- All three should still render correctly.
```

PASS criteria:
- claim_count on orientations matches count(*) from claims ✅
- Exactly 1 row has is_central = true ✅
- central_claim_ref on orientation matches claim_ref of is_central row ✅
- reasoning_mode column is populated (not null) on all rows ✅
- Old UUID URLs render without error ✅

If ANY check fails — STOP. Do not deploy. Report the specific failure
to Russell with the query result. Blue Ocean will diagnose.

---

## FILES TOUCHED IN THIS SLICE

**Supabase SQL Editor (Russell runs these, not deployed via code):**
- CREATE TABLE public.projects
- ALTER TABLE public.orientations
- CREATE TABLE public.claims
- CREATE VIEW public.project_trajectory
- CREATE VIEW public.project_claim_distribution
- CREATE VIEW public.user_orientation_summary
- CREATE FUNCTION public.save_orientation_v2
- CREATE FUNCTION public.get_project_claims

**Application code (Claude Code edits this):**
- `staging-app/src/app/api/orient/route.ts` — one RPC call changed

**NOT touched:**
- save_orientation (old RPC) — do not modify or delete
- get_orientation (existing RPC) — do not modify
- Any component or page files — zero UI changes in this slice
- The system prompt — zero prompt changes
- Any other route files

---

## WHAT SUCCESS LOOKS LIKE

From the user's perspective: nothing changes. The site looks and works
exactly as before. Shareable URLs still work. Orientations still save.

Under the hood: every new orientation now writes two persistence paths —
the JSONB blob for rendering AND normalized rows in the claims table
for analytics. The foundation for enterprise longitudinal tracking is live.

---

## WHAT COMES NEXT AFTER THIS SLICE IS VERIFIED

SLICE-AUTH-V2: Unpark the magic link auth flow, wire user_id from
session into save_orientation_v2. Russell to provide Supabase email
template configuration for the POE project.

Blue Ocean writes that handoff once SLICE-SCHEMA-V2 passes regression.

---

## IF SOMETHING GOES WRONG

**If save_orientation_v2 throws a Postgres error:**
Check the verification queries first. Most likely cause: a field name
mismatch between the live JSON and this spec. Query 3 in the prerequisites
section will show the actual JSON shape.

**If claims count does not match orientation claim_count:**
The most likely cause is the tension array extraction failing silently.
Check: does the live JSON have `quadrant_tension: []` (empty array) or
`quadrant_tension: null` (missing)? The RPC uses coalesce to handle null,
but if the key is entirely absent from some claims, add a fallback.

**If old UUID URLs break:**
The orientations table ALTER TABLE should not affect existing rows or
the get_orientation RPC. If it does, check whether the RPC references
specific columns by name that were not expected. Report to Russell.

**If the function is created but returns null instead of a UUID:**
Check that the orientations table INSERT is reaching the RETURNING clause.
Most likely a constraint violation on one of the new FK columns.
Since user_id, project_id, tenant_id are all nullable, this should not
happen — but check the orientations table constraints to confirm.

---

*Filed by Blue Ocean — Session 10 — 2026-03-31*
*Governing spec: .governance/FOUNDATION-SPEC.md*
*This handoff is complete and ready for Claude Code.*
*Russell must run the SQL steps (Steps 1-6) directly in Supabase SQL Editor.*
*Claude Code handles Step 7 (route.ts edit) and Step 8 (verification queries).*
