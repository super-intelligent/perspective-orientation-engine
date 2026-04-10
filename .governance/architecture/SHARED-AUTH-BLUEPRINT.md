# SHARED AUTH BLUEPRINT — POE
## Cross-App Auth Architecture for Russell's Three-App Ecosystem
## Date: 2026-04-01 — Session 12
## Classification: ARCHITECTURE REFERENCE — Not a build spec yet
## Source: Blue Ocean reading Story Arc Hub governance + auth code (read-only)

---

## THE CONFIRMED ARCHITECTURE DECISION

Each app maintains **independent auth on its own Supabase instance**.
Apps do NOT share a database or a user pool.

This decision was already made and confirmed by Russell in Story Arc Hub's
`.governance/ARCHITECTURE-DECISION-SHARED-AUTH.md` (Session 6, Opus 4.6).

| App | Supabase Instance |
|-----|-------------------|
| Entity Veracity Hub (EVH) | apweqqbilvopgxzcrrvm.supabase.co |
| Story Arc Hub (SAH) | gnyqbkuubrbklyxkscpo.supabase.co |
| POE | pvrirrwgiyejsuoaohvb.supabase.co (already exists) |

POE already has its own Supabase instance. The auth architecture
is already correct by default. The task is to IMPLEMENT it,
not to reconsider the approach.

---

## WHAT THE PATTERN LOOKS LIKE (From SAH — Reference Only)

SAH's auth implementation is the confirmed template.
POE's SLICE-AUTH-V2 should replicate this pattern exactly.

### Three server-side utility files:

```
src/lib/supabase/
  service.ts            — createServiceClient() — server-side only, uses SERVICE_ROLE_KEY
  verify-admin.ts       — verifyAdmin(req) — extracts Bearer token, checks is_admin
  verify-tenant-member.ts — verifyTenantMember(req, tenantId) — checks tenant_memberships
```

### Auth flow (Bearer token pattern):
1. Client sends `Authorization: Bearer <token>` header
2. Server calls `supabase.auth.getUser(token)` to validate JWT
3. Check `user_profiles` for admin flag if needed
4. Check `tenant_memberships` for tenant access if needed
5. Per-route verification — no monolithic middleware gate

### Middleware pattern (from SAH's middleware.ts):
- Runs on every request
- Refreshes session cookie via `supabase.auth.getUser()`
- Redirects unauthenticated users to `/login`
- Public routes declared explicitly: `/login`, any public share endpoints
- Uses `@supabase/ssr` createServerClient (not createClient)

---

## THE TENANT MODEL (To Implement in POE)

SAH has a fully working tenant model. POE's SLICE-AUTH-V2 should
match this schema exactly.

### Required tables (new, POE Supabase):

```sql
-- User profiles — links auth.users to app metadata
CREATE TABLE public.user_profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  is_admin   boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tenant memberships — many users per tenant, many tenants per user
CREATE TABLE public.tenant_memberships (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role       text DEFAULT 'member',    -- 'owner' | 'admin' | 'member'
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);
```

Note: POE already has a `tenant_id` column on `orientations` and `claims`
(added in SLICE-SCHEMA-V2 as nullable). The tenant model slots in without
schema changes to those tables.

---


## NAMED TENANTS IN THE ECOSYSTEM

SAH already has two seeded tenants that POE should mirror:

| Tenant | UUID | Slug |
|--------|------|------|
| Default (SuperIntelligentAI) | 00000000-0000-0000-0000-000000000001 | superintelligent |
| Moonraker | 00000000-0000-0000-0000-000000000002 | moonraker |

**DECISION NEEDED before SLICE-AUTH-V2 builds:**
Should POE use the same tenant UUIDs as SAH for logical alignment,
or are POE tenants entirely independent (different users, different scope)?

Given independent Supabase instances, the UUIDs are cosmetic —
they don't join across databases. But using the same UUIDs makes
Russell's mental model cleaner (one "Moonraker" concept, same ID everywhere).

Recommendation: Use the same UUIDs. It costs nothing and reduces confusion.

---

## RLS PATTERN (From SAH — Reference Only)

SAH's RLS is the template. POE applies the same pattern to its tables.

```sql
-- Tenant isolation: authenticated users see only their tenant's data
CREATE POLICY "Tenant orientations access" ON public.orientations
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid()
    )
    OR tenant_id IS NULL   -- anonymous orientations always accessible
  );

CREATE POLICY "Tenant claims access" ON public.claims
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid()
    )
    OR tenant_id IS NULL
  );
```

The `OR tenant_id IS NULL` clause preserves the backwards compatibility
contract — all existing anonymous orientations remain accessible.

---

## MAGIC LINK AUTH (POE-SPECIFIC)

SAH uses email/password. POE's existing SLICE-AUTH code (currently parked)
uses **magic link** (passwordless email). This is intentional and should
be preserved — it matches the contemplative, frictionless UX of the POE.

The parked SLICE-AUTH code already has the magic link flow. SLICE-AUTH-V2
wires it with:
1. `user_profiles` auto-creation on first login
2. `user_id` passed into `save_orientation_v2`
3. Tenant membership checked if tenant_id is present

No password login needed for POE. Magic link is the right call.

---

## MIDDLEWARE FOR POE

POE currently has NO middleware.ts. SLICE-AUTH-V2 should add one,
matching SAH's pattern exactly:

```typescript
// src/middleware.ts
// Public routes (no auth required):
// - / (input page — anonymous use allowed at free tier)
// - /orient/[id] (shareable orientation links — always public)
// - /api/orient (extraction endpoint — anonymous allowed)
// - /login
// - /auth/callback

const PUBLIC_ROUTES = ['/', '/orient', '/api/orient', '/login', '/auth'];
```

Key difference from SAH: POE allows anonymous use at the input level.
SAH requires login for everything. POE's free tier is anonymous,
premium tier is authenticated. The middleware must reflect this.

---

## WHAT THIS MEANS FOR SLICE-AUTH-V2

When SLICE-AUTH-V2 is specced, the handoff should include:

### SQL to run in POE Supabase (pvrirrwgiyejsuoaohvb):
1. Create `user_profiles` table + auto-create trigger
2. Create `tenant_memberships` table
3. Seed two tenants (same UUIDs as SAH — pending Russell decision above)
4. Add RLS policies to `orientations`, `claims`, `projects` tables
5. Make Russell admin + owner of default tenant

### Code to create:
1. `src/lib/supabase/service.ts` — createServiceClient()
2. `src/middleware.ts` — session refresh + public route config
3. Unpark existing magic link auth components (AuthModal.tsx, AuthGate.tsx,
   useAuth.ts — all already exist from SLICE-AUTH)
4. Wire `user_id` from session into `save_orientation_v2` call in route.ts
5. Configure Supabase email templates for POE project

### NOT needed for SLICE-AUTH-V2:
- verify-admin.ts (POE has no admin routes yet)
- verify-tenant-member.ts (POE has no tenant-scoped API routes yet)
- These come in SLICE-PROJECT-UI when projects become tenant-scoped

---

## CROSS-APP INTEGRATION (FUTURE — Vision Only)

Story Arc Hub's POE-INTEGRATION-VISION.md describes the convergence:
- Story Arc = temporal (what happened, in what order)
- POE = spatial (cognitive address at each moment)
- Watch Mode = where they converge (live grid during extraction)

The API contract is already roughed out in SAH:
`GET /api/collections/[id]/poe-export` — structured extraction data
POE would receive this and orient it. This is Phase 3+ work.

Nothing to build now. Captured here so SLICE-AUTH-V2 and
SLICE-PROJECT-UI are designed with this future integration in mind.

---

## SUMMARY — What To Do When

| When | Action |
|------|--------|
| SLICE-AUTH-V2 (next) | Implement user_profiles + tenant_memberships + magic link wiring |
| SLICE-PROJECT-UI | Add tenant_id to project creation, tenant-scope project queries |
| Phase 3+ | POE exposes orientation API endpoint for SAH Watch Mode integration |

---

*Filed by Blue Ocean — Session 12 — 2026-04-01*
*Source: Read-only reference of Story Arc Hub governance + auth code*
*No Story Arc files were modified. No Story Arc code was copied into POE.*
*This document lives in POE governance only.*

---

## ADDENDUM — THE GROUP/FILE STRUCTURE (Collections Layer)

*Added after reading SAH schema and collections migration in full.*

SAH has a three-level hierarchy for organizing content:

```
TENANT
  └── COLLECTION (group of related story arcs — the "project folder")
        └── EXTRACTION (one run = one story arc HTML artifact)
              └── SOURCE (the original document/conversation)
```

The `collections` table is the critical piece I missed in the first read:

```sql
-- Collections: groups of related story arcs
collections (
  id, tenant_id, user_id,
  name,           -- e.g. "Q1 Client Sessions"
  description,
  impulse,        -- the unifying question/imperative for this collection
  extraction_count
)

-- Junction: extractions can belong to multiple collections
collection_members (
  collection_id,
  extraction_id
)
```

An extraction can belong to MULTIPLE collections (many-to-many).
A source can be run multiple times — each run is a separate extraction.

---

## THE STRUCTURAL PARALLEL TO POE

This maps directly onto POE's existing schema:

| SAH Concept | POE Equivalent | Status in POE |
|-------------|---------------|---------------|
| tenant | tenant | ✅ tenant_id column exists (nullable) |
| collection | project | ✅ projects table exists (SLICE-SCHEMA-V2) |
| extraction | orientation | ✅ orientations table |
| source | brain_dump / raw_brain_dump | ✅ on orientations table |
| collection_members | (orientations have project_id FK) | ✅ project_id on orientations |

POE's `projects` table is already the correct structural equivalent
of SAH's `collections` table. The design is aligned.

One difference: SAH uses a many-to-many junction table (an extraction
can belong to multiple collections). POE currently uses a single
`project_id` FK on orientations (one orientation = one project).

**Decision for SLICE-PROJECT-UI:** Keep POE as one-to-one (project_id on
orientations) for now. The many-to-many case is for cross-referencing
story arcs across client work — POE orientations are more naturally
contained within a single project context. Revisit if Russell needs
an orientation to appear in multiple projects.

---

## WHAT THIS MEANS FOR THE CROSS-APP INTEGRATION

When SAH sends a document to POE for orientation (future Watch Mode):

```
SAH Collection → POE Project
SAH Extraction → POE Orientation (the brain dump IS the extraction output)
SAH Source     → POE brain_dump (the original document)
```

The POE-INTEGRATION-VISION spec describes this exactly:
"Every element of a Story Arc extraction has a POE address."

When Watch Mode is built, a SAH collection will map to a POE project.
Multiple extractions within that collection will generate multiple
orientations within the corresponding POE project — and the Longitudinal
Trajectory view will show how the cognitive address moved across those runs.

This is the moment the Datasphere becomes something new. Not a snapshot
of one brain dump — a trajectory across an entire client engagement.

---

## UPDATED SLICE-AUTH-V2 SCOPE (Addendum)

The tenant + collections understanding adds one item to SLICE-AUTH-V2:

When a user logs in, POE needs to know their tenant context to:
1. Scope orientations to `tenant_id`
2. Scope projects to `tenant_id`
3. Display only their tenant's projects in the project selector (SLICE-PROJECT-UI)

The `tenant_memberships` table handles this. On login, fetch the user's
tenant memberships and store the active `tenant_id` in session context.
Pass it into every `save_orientation_v2` call.

For Russell's current use: one user, one tenant (SuperIntelligentAI).
For Moonraker: same user, different tenant. The active tenant is selected
at login or via a tenant-switcher (SLICE-PROJECT-UI concern).

---

*Addendum filed by Blue Ocean — Session 12 — 2026-04-01*
*Source: SAH SCHEMA-SPEC.md, supabase-collections-migration.sql,*
*supabase-complete-setup.sql — all read-only reference.*
