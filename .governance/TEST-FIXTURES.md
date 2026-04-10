# TEST FIXTURES — POE Regression Test Inputs
## Location: .governance/TEST-FIXTURES.md
## Date: 2026-03-31 — Session 10
## Status: PERMANENT — Do not modify the brain dump text

---

## PURPOSE

This file contains the canonical test input(s) for POE regression testing.
Every build session that touches the extraction pipeline, schema, or persistence
layer MUST run this brain dump through the live system and verify output.

The AP Teacher scenario is the PRIMARY regression fixture. It has 14 known
claims, a known central claim, and a known tensor distribution. Any significant
deviation in claim count, central claim identity, or quadrant distribution
signals a regression.

---

## FIXTURE 001 — AP Teacher (Primary Regression Test)

**Label:** AP US History teacher / AI academic integrity crisis
**Word count:** ~450 words
**Expected claim count:** ~14 claims (may vary ±2 across runs — monitor)
**Known central claim archetype:** Identity Destabilization (or equivalent)
**Known field coherence:** strong or competing
**First used:** Session 4 (S-004) — first live POE extraction
**Last verified:** Session 9 (S-009) — model upgrade to Sonnet 4.6

### HOW TO USE

1. Open perspective.super-intelligent.ai
2. Copy EVERYTHING between the START and END markers below
3. Paste into the brain dump input field
4. Submit and observe output
5. Run verification queries from HANDOFF-SLICE-SCHEMA-V2.md Step 8

### BRAIN DUMP TEXT

=== START ===

I don't even know where to start. I've been teaching AP US History and Government for 14 years and I have never felt this lost. Last week I assigned a DBQ on Reconstruction-era legislation and at least 8 of my 32 students turned in responses that read like they were written by the same person. Perfect topic sentences, eerily similar paragraph structure, and this weird pattern where every essay mentions "the nuanced interplay between federal authority and states' rights" — nobody in 10th grade talks like that. Nobody.

So I started running them through detection tools and most came back "likely AI generated" but then Marcus's mom called me saying I was "targeting her son" because he's a strong writer and I'm "assuming Black kids can't write well" — which is absolutely not what happened but now I'm terrified of the optics. Meanwhile I KNOW at least 3 kids are using something called Undetectable AI or GPTZero bypass or whatever because Tyler literally told me "everyone uses humanizers now, it's not even cheating anymore, the AI just helps organize your thoughts." He said it to my face like I was the unreasonable one.

The worst part is the kids reporting on each other. Jayden came to me privately and said he knows for a fact that his study group — 5 kids — splits up the questions and has ChatGPT answer each one, then they run it through a humanizer and submit individual versions. He's angry because he actually does the reading and gets B's while they get A's. But if I act on that information I'm putting Jayden in a social position I don't want to put a 15-year-old in.

And honestly? Some of the AI-assisted work is... not bad. Like genuinely. Sofia's analysis of federalism was structured better than what I could typically expect from a sophomore. If she used AI to outline it and then wrote it herself, is that cheating? Where is the line? I told them it's an F but I don't even know if I believe my own policy anymore. The college board hasn't given us anything useful. My department head says "use your professional judgment" which is code for "we have no idea either and if a parent sues we're throwing you under the bus."

I feel like I'm spending more time policing than teaching. I redesigned my entire assessment strategy to include in-class handwritten components but now I have kids with IEPs and 504 plans who legitimately need technology accommodations and I can't take their laptops away without violating their plans. Last Tuesday I watched a kid literally alt-tab away from ChatGPT when I walked by during a timed in-class essay. I pretended I didn't see it because I didn't have the energy for another confrontation.

My principal wants me to present on "AI in the classroom" at our next PD day like I have answers. I don't have answers. I have a folder of screenshots, a stomach ache every Sunday night, and a growing suspicion that the entire assessment model I've built my career on is fundamentally broken and nobody above me wants to admit it.

=== END ===


---

## KNOWN OUTPUT FROM FIRST RUN (S-004, Session 4)

For reference — this is what the system extracted before S-005 through S-009
enhancements. Current output will be richer (archetypes, narratives, gravity
structure). The quadrant/domain placements should remain broadly stable.

| # | Claim excerpt | Quadrant | Domain | Reasoning | Relevance | Archetype |
|---|---|---|---|---|---|---|
| c1 | "I've been teaching AP US History...never felt this lost" | UL | Complex | Abductive | High | Identity Destabilization |
| c2 | "at least 8 of my 32 students turned in responses...written by the same person" | UR | Complicated | Inductive | High | Pattern Anomaly Detection |
| c3 | "Marcus's mom called me...targeting her son" | LL | Complex | Abductive | High | Interpretive Conflict Injection |
| c4 | "everyone uses humanizers now, it's not even cheating anymore" | LL | Complex | Deductive | High | Norm Drift Assertion |
| c5 | "Jayden...study group splits up the questions" | UR | Complicated | Deductive | High | Coordinated System Gaming |
| c6 | "if I act on that information I'm putting Jayden in a social position" | UL | Complex | Abductive | High | Protection Paradox |
| c7 | "Some of the AI-assisted work is...not bad" | UL | Complex | Inductive | Medium | Value Alignment Drift |
| c8 | "Where is the line? I told them it's an F but I don't even know if I believe my own policy" | UL | Chaotic | Abductive | High | Authority Legitimacy Collapse |
| c9 | "The college board hasn't given us anything useful" | LR | Complicated | Deductive | Medium | Institutional Vacuum Signal |
| c10 | "department head says 'use your professional judgment'...code for 'we have no idea'" | LR | Chaotic | Inductive | High | Systemic Abandonment |
| c11 | "I redesigned my entire assessment strategy" | UR | Complicated | Deductive | Medium | Adaptive Response Attempt |
| c12 | "kids with IEPs and 504 plans who legitimately need technology" | LR | Complicated | Deductive | Medium | Constraint Lock |
| c13 | "I watched a kid literally alt-tab away from ChatGPT...pretended I didn't see it" | UR | Complex | Abductive | High | Enforcement Collapse Signal |
| c14 | "entire assessment model I've built my career on is fundamentally broken" | UL | Chaotic | Abductive | High | Systemic Fracture Realization |

**Central claim (S-004):** c1 — Identity Destabilization
**Note:** central claim may vary between runs — c14 (Systemic Fracture Realization)
is also a strong attractor. Monitor for stability across sessions.

---

## REGRESSION PASS CRITERIA

After submitting this brain dump, a passing result means:

| Check | Expected | How to verify |
|---|---|---|
| Claim count | 12–16 | Count claim cards in UI |
| Central claim | UL quadrant, Complex or Chaotic | Check gravitational center label |
| Field coherence | strong or competing | Check field coherence badge |
| Clickable badge pills | present on every claim | Click a badge, verify panel opens |
| Atomized narrative | 5 sections per claim | Expand "Why this placement" |
| Relevance gradient legend | visible, one level highlighted green | Check bottom of page |
| Shareable URL | /orient/[uuid] loads on fresh tab | Copy URL, open new tab |
| claims table populated | row count = claim count | Run Step 8 queries from HANDOFF-SLICE-SCHEMA-V2.md |

---

## ADDING NEW FIXTURES

When a second test brain dump is created (e.g. a scenario designed to stress-test
the Datasphere lens modes or test a different field_coherence state), add it here
as FIXTURE 002 following the same format.

Suggested future fixtures:
- A brain dump with strong "distributed" field coherence (no clear central claim)
- A brain dump that triggers socratic_needed: true
- A brain dump from a domain outside education (business, personal, creative)

---

*Filed by Blue Ocean — Session 10 — 2026-03-31*
*Brain dump text provided by Russell Wright — verbatim, unmodified*
*This file is PERMANENT. The brain dump text must never be edited.*
