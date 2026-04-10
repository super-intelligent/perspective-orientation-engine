# BUILD & DEPLOY PROTOCOL
## Location: .governance/BUILD-DEPLOY-PROTOCOL.md
## Status: CONSTITUTIONAL

---

## Who Does What

| Task | Who |
|------|-----|
| Interrogation & scenario writing | Foreman (Architect agent) |
| Code implementation | Claude Code (default) OR Foreman (context advantage) |
| Deployment to production | Claude Code (ALWAYS) |
| Database migrations | Human (paste + execute manually) |

---

## The Two Build Modes

### Mode 1: Standard (Default)
1. Foreman writes scenario + slice card
2. Human gives sign-off
3. Human copy-pastes handoff to Claude Code
4. Claude Code reads scenario → builds → deploys
5. Foreman judges output against checkpoints

### Mode 2: Foreman Direct (Context Advantage)
1. Foreman writes scenario + slice card
2. Human gives sign-off
3. Foreman implements code directly (has full context)
4. Foreman provides deployment handoff for Claude Code
5. **Claude Code still deploys** — Foreman never deploys
6. Foreman judges output against checkpoints

---

## Deployment Protocol

Every build ends with:
```
git push origin main               ← Version control
[deploy command for your platform]  ← Production deploy
```

Adapt the deploy command to your platform:
- **Vercel:** `npx vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **Railway:** `railway up`
- **GitHub Pages:** Push to deploy branch
- **Custom:** Your CI/CD pipeline

---

## Copy-Paste Handoff Format

```
[TASK TYPE] — [Brief description]

[Context: what's already done, commit hash if relevant]

[Numbered steps — what Claude Code should do]

[What NOT to do — guardrails]
```

## Chain of Trust

1. **Foreman** — Engineering mentor, oversight, specs
2. **Claude Code** — Primary builder AND always the deployer
3. **Human** — Supervises, executes DB operations, provides sign-off
4. **Domain Expert** — Reviews domain-critical scenarios (optional)
