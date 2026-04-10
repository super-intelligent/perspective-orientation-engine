# POE ← EVH Architecture Crosswalk
## Blue Ocean's Notes — What Transfers, What Doesn't
## Date: 2026-03-23
## Source: EVH-ARCHITECTURE-REFERENCE.md (295 lines, read from EVH machine)
## Purpose: Inform SLICE-PERSISTENCE and future multi-tenancy for POE

---

## PATTERNS THAT TRANSFER DIRECTLY

### 1. Multi-Tenant Isolation (EVH Pattern)
**EVH:** `staging.tenants` table, every data table has `tenant_id`, RLS enforces boundary.
**POE Translation:** Same pattern. Each POE tenant gets isolated orientation data.
- `tenants` table → same
- `orientations` table needs `tenant_id` column
- RLS policies scope all reads/writes to auth.uid() → tenant lookup
- Two-key model (service key for API, anon key for client) → same

### 2. Two-Key Auth Model
**EVH:** createClientComponentClient() for frontend, createServiceClient() for API routes.
**POE:** Already have this — src/utils/supabase/client.ts and server.ts. No change needed.

### 3. Single Write, Many Reads (EVH Pattern 4)
**EVH:** Each data type has ONE write surface, multiple surfaces read the same data.
**POE Translation:**
- Write: /api/orient creates the orientation → saves to orientations table
- Read: Results page, history list, shared link, future observatory mode

### 4. Staging Schema + Public View Convention (EVH Pattern 6)
**EVH:** staging.* tables with public.*_public unfiltered views. RLS on staging = real security.
**POE Translation:** Adopt this convention:
- staging.orientations (write target, RLS-protected)
- public.orientations_public (read view)
- Keeps the same security model Russell already knows from EVH

### 5. Entity = Atomic Unit → Orientation = Atomic Unit
**EVH:** Entity is the atomic unit — everything hangs off entity_id.
**POE Translation:** Orientation is the atomic unit — everything hangs off orientation_id.
- Each orientation stores: brain dump input, full claims JSON, gravity structure, metadata
- Future: claims could be promoted to their own table for cross-orientation tracking

### 6. UUID-Based Retrieval URLs
**EVH:** /report/[id] loads a saved entity report by UUID.
**POE Translation:** /orient/[id] loads a saved orientation by UUID.

---

## PATTERNS THAT PARTIALLY TRANSFER

### 7. Scoring Over Time → Orientation Trajectory
**EVH:** VX score is strictly additive proof-of-work. No penalties.
**POE Adaptation:** Not a score. But a trajectory.
- Track how gravitational center shifts across multiple brain dumps
- "Your orientation center moved from Systemic Fracture to Role Identity Crisis
  across 3 orientations"
- Database schema should accommodate this from the start

### 8. Server Health Signals → Field Coherence Signals
**EVH:** 3-state (off/doing/on) per server, readable diagnostically at scale.
**POE Adaptation:** Field coherence (strong/competing/distributed/low) already in schema.
- Over time: "Your last 3 orientations all showed competing centers around same themes"

### 9. Onboarding Sequence = Architecture
**EVH:** Identity → presence → measurement → amplification. The sequence IS the architecture.
**POE:** Brain dump → extraction → orientation map → (future: Socratic → diagnostics → observatory)
- Each step adds depth. The slice build queue reflects this sequence.

---

## PATTERNS THAT DON'T TRANSFER

### 10. Ink Before Trust (OPPOSITE of POE doctrine)
**EVH:** Human must "ink" (verify) evidence before it affects score.
**POE:** TRUE-BY-ASSUMPTION means we NEVER verify claims. This pattern is the
opposite of POE's foundational axiom.
- Future cousin: user might confirm which claims feel most RELEVANT (not TRUE)

### 11. Review Import / External Data (EVH-specific)
**EVH:** Pulls reviews from Google, PT, Yelp via Apify actors.
**POE:** No external data. Only input is the user's brain dump.

### 12. 4 Volumes Model (EVH-specific)
**EVH:** Identity, Digital Presence, Sentiment, Distribution.
**POE:** 4 axes (AQAL, Cynefin, Reasoning, Relevance) + future speech acts.
Different framework, but "multiple dimensions tracked in parallel" is shared.

---

## DRAFT SCHEMA FOR POE PERSISTENCE

```sql
-- Tenants (mirrors EVH pattern)
create table staging.tenants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  created_at    timestamptz default now()
);

-- User-tenant mapping (1:1 for now, 1:many future)
create table staging.user_tenants (
  user_id       uuid references auth.users(id),
  tenant_id     uuid references staging.tenants(id),
  role          text default 'owner',
  primary key (user_id, tenant_id)
);

-- Orientations (the atomic unit)
create table staging.orientations (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references staging.tenants(id),
  user_id       uuid references auth.users(id),
  brain_dump    text not null,
  result_json   jsonb not null,
  field_coherence text,
  central_archetype text,
  created_at    timestamptz default now()
);

-- RLS
alter table staging.orientations enable row level security;
create policy "Users read own tenant orientations"
  on staging.orientations for select
  using (tenant_id in (
    select tenant_id from staging.user_tenants
    where user_id = auth.uid()
  ));
create policy "Users insert own orientations"
  on staging.orientations for insert
  with check (user_id = auth.uid());

-- Public view (EVH convention)
create view public.orientations_public as
  select * from staging.orientations;
```

---

## FUTURE: CONNECTOR SOCKET (EVH ↔ POE)

Russell mentioned long-term connection between the two applications.
- Entity in EVH could have associated POE orientations
- Claims from POE could feed into EVH entity fields
- UUID-based model supports this naturally
- Each app stays independent; connector is a bridge layer, not a merge

---

## DECISIONS STILL NEEDED FROM RUSSELL

1. Auto-save vs manual save (after Orient click)
2. Login required vs anonymous shareable links
3. Whether to build tenant table now or defer to auth completion
