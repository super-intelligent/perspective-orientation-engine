# SESSION MANAGEMENT SYSTEM — V2
## How We Remember Across Sessions
## Location: .governance/SESSION-MANAGEMENT-V2.md
## Status: CONSTITUTIONAL

---

## THE PROBLEM THIS SOLVES

AI agents lose memory between sessions. Governance documents accumulate
stale items that are never reconciled. When a new agent instance reads
old documents and treats dated entries as current state, it produces
invalid handoffs and builds from ghost requirements.

Root causes:
1. Documents try to serve too many purposes at once
2. Items are logged at discovery time and never reconciled at close
3. Handoffs are narratives, not verified state snapshots
4. The system trusts DOCUMENTS over CODE
5. No ritual step verifies governance claims against live code

---

## THE NEW ARCHITECTURE: Three Tiers

### TIER 1: SESSION-STATE.md (Read FIRST — updated every session close)
- Maximum 80 lines. If it's longer, it's wrong.
- Updated (not rewritten) at every session close
- Every change verified against git + code before writing
- THE primary rehydration document. Foreman reads THIS first.

### TIER 2: OPERATIONAL-LEDGER.md (Constitutional Law — rarely changes)
- Permanent governance rules: classification, gates, protocols, anti-drift
- Read only when governance decisions are needed
- Does NOT need to be read at every session start

### TIER 3: Handoffs Archive (Never read at startup)
- Old handoffs + archived SESSION-STATE versions
- Historical record only. Only referenced if human asks about past sessions.

---

## THE VERIFICATION RULE

Before writing any item to SESSION-STATE.md, the Foreman must have
ONE of these proofs:

| Proof Type | Example |
|-----------|---------|
| **Git evidence** | Commit hash, git log showing the change |
| **Code grep** | File search confirming code exists or doesn't |
| **Human confirmation** | Human said "X is still broken" THIS session |
| **Direct observation** | Screenshot, error message, test result |

If the Foreman cannot produce proof → the item does NOT go into
SESSION-STATE.md. It goes into "UNVERIFIED — ask human" at the bottom.

---

## SESSION START RITUAL (2-3 minutes)

```
STEP 1: Read SESSION-STATE.md (the ONLY mandatory read)
STEP 2: Verify git hash matches
        → Run: git log --oneline -1
        → If hash matches → state is current
        → If hash DOESN'T match → code changed outside session
           Read git log between hashes to see what changed
           Flag differences to human before proceeding
STEP 3: Run governance file age index (3 seconds):
        → List .governance/*.md files sorted by last modified
        → Note which are fresh (<48 hrs) vs stale (>7 days)
STEP 4: Report to human:
        "This is Session [N+1]. Last session ended at [git hash].
         [Match/mismatch]. Next action: [X]. Ready to proceed."
STEP 5: Read additional docs only if session type requires it:
        → Architecture → read invariants
        → Build → read DEVELOPMENT-PROTOCOL.md
        → Routine conversation → SESSION-STATE.md is enough
```

## SESSION CLOSE RITUAL (5 minutes, verified)

```
STEP 1: VERIFY — git log, git status, what was committed
STEP 2: RECONCILE — walk previous open items:
        → Fixed this session? → move to resolved
        → Still broken? → keep with fresh evidence
        → Uncertain? → move to UNVERIFIED section
STEP 3: ARCHIVE — copy SESSION-STATE.md to handoffs/
STEP 4: UPDATE — update (don't rewrite) SESSION-STATE.md
STEP 5: CONFIRM — human verifies accuracy
STEP 6: COMMIT — git add, commit, push
```

---

## DOCUMENT AGE WEIGHTING — Relevance Realization

When the Foreman reads ANY governance file, check last modified date
BEFORE treating any claim as current:

| Age | Weight | Treatment |
|-----|--------|-----------|
| **0-48 hours** | FULL TRUST | Claims can drive build decisions directly. |
| **3-7 days** | VERIFY FIRST | MUST be verified against code before acting. |
| **8-30 days** | HISTORICAL | Background context only. Not for build decisions. |
| **30+ days** | ARCHIVAL | Rules/invariants survive. Items/queues are EXPIRED. |

---

## SAFETY MECHANISMS

1. **Git Hash Anchor** — Every SESSION-STATE starts with a git hash.
   Mismatch = code changed outside session. Investigate first.
2. **80-Line Limit** — Forces ruthless conciseness. Fit on one screen.
3. **UNVERIFIED Section** — Items without proof are quarantined as questions.
4. **Archive Trail** — Previous SESSION-STATE copied before every rewrite.
5. **Code-First Principle** — When docs and code disagree, CODE WINS.

---

## MODE SWITCHING PROTOCOL

When changing modes mid-session (analysis → build planning):
1. Check: Am I using any governance doc older than 48 hours?
2. If YES → verify each claim against code before acting
3. If compiling a punch list → every item needs code-level proof
4. If uncertain → ask the human, don't assume

*"Trust code, not documents. Verify, don't assume."*
