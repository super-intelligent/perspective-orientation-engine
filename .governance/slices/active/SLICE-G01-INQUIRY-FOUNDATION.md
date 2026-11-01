# G01 — inquiry-preserving foundation

Date: November 1, 2026. Classification: BLUE / new bounded slice.
Status: development increment; independent review and human acceptance pending.

## Authority and evidence

Russell's November 1 direction selected coding/codification of G01, preserving inquiry upstream of claims, with routine reversible design delegated to the coder. Source custody stays in the reconstruction workspace's `integration/questions-handoff-2026-11-01/{SOURCE,CODING-DIRECTION,QUESTIONS-HANDOFF,CRUISE-EVIDENCE}.md`. Those source documents are not copied into this public repository.

The creator-recognized direction is recovered in CS-020 (question behind/before/after question and claim downstream of inquiry) and CS-022 (human correction and explicit request to add this feature). Historical glyphs, weights, Studio designs and the quarantined March 26 Meta Layer remain design evidence. This increment does not activate them.

## Product question and journey

Can a developer retain explicit human questions, attributed interpretations, and proposed links to existing claims without turning any of them into accepted meaning? A local synthetic fixture is the first executable journey. This is an offline foundation, not an extraction or end-user feature release.

Build-facing scenarios: `.governance/scenarios/g01-inquiry-foundation.md`.
Meanings: `CONTEXT.md`. Invariants: `.governance/invariants/POE-DOCTRINE.md` and `docs/architecture/semantic-custody/concepts/inquiry-interpretation.yaml`.

## Contract v1

- A self-contained inquiry document has `schema_version: 1`, a document `id`, actors, verbatim sources, questions, proposed relationships and human responses. IDs are scoped to a document and unique within each collection; they are not cross-session entity identity.
- Actors are explicitly attributed as human, model or analyst. This is supplied attribution, not authenticated identity.
- Sources retain `id`, `actor_id`, a nonempty `locator` and exact `text`. A locator is a custody label, not a fetched URL or authenticity proof.
- A source span is `{source_id, start, end, quote}`. Offsets are zero-based JavaScript UTF-16 code units, end-exclusive, against unchanged source text. Exact quote equality is required. No normalization or question-mark heuristic is used.
- `questions` are a discriminated union. `explicit` requires verbatim `text` and a span attributed to a human. `inferred` requires `text`, `proposed_by`, nonempty source `basis`, and `rationale`; it never receives an acceptance status. A human can also propose an inferred interpretation.
- `relationships` have an ID, `question_id`, `target: {kind: 'question' | 'claim', id}`, `relation`, literal `status: 'proposed'`, `proposed_by`, source `basis` and `rationale`. `possibly_underlies` targets a different question; `possibly_informs` targets a claim. Many-to-many links are permitted; no complete, acyclic, single-root or temporal-order graph is imposed. Absence of a link is allowed.
- Claim targets are checked against supplied existing claim IDs, using the existing `Claim` type's ID projection. The inquiry document does not reclassify, copy or mutate claims. Passing the correct orientation's claims is the caller's responsibility; v1 establishes no stored orientation identity.
- `responses` preserve exact human text, `question_id`, source span and `kind: 'response' | 'correction'`. They do not erase questions or proposals or auto-confirm anything. Calling a response a correction is supplied annotation, not an automated diagnosis. No complete revision/event system is claimed.
- The parser rejects unknown fields, unsupported schema versions, dangling/duplicate IDs, invalid offsets, mismatched quotes, model-attributed explicit questions/human responses, invalid relation/target combinations, and self-links.
- The parser returns a new value and never mutates the input or claims. JSON round-trip retains document content. Empty collections are valid, including legacy claim-only cases; the parser never fabricates inquiry.

## Build-facing acceptance criteria

1. The synthetic mixed fixture retains one explicit question, a distinct inferred alternative, separate claim IDs, two proposed links, and a later human correction without overwriting either question.
2. Invalid or model-attributed quotations, dangling references, unsupported acceptance fields and impossible relationship types are rejected with structured validation errors.
3. Multiple questions may link to one claim and one question may link to multiple claims without requiring a link for every claim.
4. Empty inquiry round-trips without manufacturing questions; JSON serialization and parsing preserve the populated fixture, source spans and correction.
5. The demo and automated tests run offline without credentials, provider calls or database access. Existing live routes, prompt, auth, renderers and persistence code are untouched.

## Five-question gate and engineering scope

New invariants: yes, provenance/reference rules scoped to this contract. New product lifecycle state: no. Existing state transitions, propagation and access rules changed: no. Conservatively BLUE for a new developer-facing contract boundary. Current user delegation authorizes this foundation build; it does not supply an independent Judge pass. Review remains required before merge; this slice stays active.

Implementation: `src/lib/inquiry.ts`, synthetic fixture, Node built-in tests/demo and package scripts. Zod is already a dependency. Tests require Node 22.18+ with built-in TypeScript stripping; application runtime requirements are unchanged. Run `npm ci --ignore-scripts`, `npm test`, `npm run demo:inquiry`, `npx tsc --noEmit`, and targeted ESLint. No new dependencies or lockfile changes are intended.

The development branch's `vercel.json` disables Git auto-deployment for exactly `codex/g01-inquiry-foundation`. Other branches retain Vercel's default behavior. See [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration). Do not merge: main is connected to production. A draft PR is a review artifact, not deployment approval.

## Deferred decisions

Extraction/prompt behavior, live capture/edit UI, question geometry/glyphs, authenticated acceptance, persistence/history and stable orientation identity require later scoped work. General question ranking, information-gain calculations, Meta Layer activation and external-engine coupling are outside G01's first increment. The two proposed relationship names and v1 contract are reversible engineering choices for review, not inventor-approved universal ontology.
