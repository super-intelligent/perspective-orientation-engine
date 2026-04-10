# PATCH NOTES — POE Governance Record
## Enterprise-grade record of in-session fixes and lessons learned

---

## PATCH-001 — save_orientation_v2 NOT NULL constraint
**Session:** 11
**Date:** 2026-04-01
**Severity:** Blocking (400 error on all saves)
**Status:** ✅ Resolved

### What Happened
The original `orientations` table (created Session 6) has a NOT NULL
constraint on the `brain_dump` column. The HANDOFF-SLICE-SCHEMA-V2.md
spec wrote `save_orientation_v2` to insert into `raw_brain_dump` only —
not the original `brain_dump` column. Every save attempt returned a
Postgres 23502 NOT NULL violation, caught silently by the route.ts
try/catch, causing the UI to render correctly but nothing to write to DB.

### How It Was Caught
Supabase RPC tested directly in SQL Editor before hitting live site.
Error surfaced immediately. Vercel logs confirmed: Supabase POST → 400.

### Fix Applied
`save_orientation_v2` updated to write `p_brain_dump` into BOTH:
- `brain_dump` (original column, NOT NULL, keeps constraint satisfied)
- `raw_brain_dump` (new column, nullable, for future migration use)

### Redundancy Note
Both columns now store identical text. This is intentional short-term
redundancy. A future cleanup migration can drop `brain_dump` and rename
`raw_brain_dump` once all RPCs and reads are migrated. Not urgent.

### orientations Table — Full Constraint Map (verified 2026-04-01)
| column_name       | is_nullable |
| ----------------- | ----------- |
| id                | NO          |
| brain_dump        | NO          |
| result_json       | NO          |
| field_coherence   | YES         |
| central_archetype | YES         |
| created_at        | YES         |
| user_id           | YES         |
| project_id        | YES         |
| tenant_id         | YES         |
| raw_brain_dump    | YES         |
| central_claim_ref | YES         |
| claim_count       | YES         |
| socratic_needed   | YES         |
| gravity_structure | YES         |

---

## LESSON-001 — Handoff prerequisite gap
**Applies to:** All future ALTER TABLE or INSERT-touching slices

Future handoffs must include this query in the prerequisites section:

```sql
select column_name, is_nullable, column_default
from information_schema.columns
where table_name = 'orientations' and table_schema = 'public'
order by ordinal_position;
```

Any NOT NULL column without a default is a required field in every INSERT.
The handoff author must account for ALL such columns before writing RPCs.

---

## LESSON-002 — Test RPC in SQL Editor before live deploy
**Applies to:** All future RPC slices

Pattern confirmed in Session 11:
1. Create the RPC in Supabase SQL Editor
2. Call it directly with a minimal test payload BEFORE touching the live site
3. Confirm it returns a UUID (or expected value) with no errors
4. Only then submit via the live UI

This pattern caught PATCH-001 safely with zero user-facing impact.

---

*Filed by Blue Ocean — Session 11 — 2026-04-01*
*Read this file at the start of any session touching Supabase schema or RPCs.*
