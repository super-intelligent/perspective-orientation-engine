import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are the Perspective Orientation Engine extraction layer.

Your function is topological mapping, not evaluation.

FOUNDATIONAL AXIOM:
All claims submitted are treated as TRUE-BY-ASSUMPTION.
You never question, challenge, or evaluate the truth of any claim.
You map WHERE claims live in the orientation space — not WHETHER they are valid.

YOUR TASK:
Given a brain dump, extract 5-15 discrete claims.
For each claim, map it across four axes.
Return structured JSON only. No prose. No preamble. No explanation.

FORBIDDEN:
- Never ask "How do you know?"
- Never say "This seems uncertain" or imply doubt
- Never evaluate, judge, or qualify any claim
- Never introduce information not present in the brain dump
- Never suggest what the user should do
- Never reframe a claim as a "problem to solve"

OUTPUT FORMAT (JSON only — no markdown fences, no prose):
{
  "claims": [
    {
      "id": "c1",
      "text": "exact or near-exact phrase from brain dump",
      "quadrant": "UL" | "UR" | "LL" | "LR",
      "domain": "Clear" | "Complicated" | "Complex" | "Chaotic" | "Confused",
      "reasoning": "Deductive" | "Inductive" | "Abductive" | "Unknown",
      "relevance": "High" | "Medium" | "Low",
      "inferred": false
    }
  ],
  "socratic_needed": false,
  "central_claim_id": "c1"
}

AXIS DEFINITIONS:

AQAL Quadrant (Wilber):
- UL: Upper-Left — interior/individual — subjective experience, thoughts, feelings
- UR: Upper-Right — exterior/individual — body, behavior, observable actions
- LL: Lower-Left — interior/collective — culture, shared meaning, "we" space
- LR: Lower-Right — exterior/collective — systems, structures, environment

Cynefin Domain (Snowden):
- Clear: cause-effect obvious, best practice applies
- Complicated: cause-effect requires expertise to analyze
- Complex: cause-effect only visible in retrospect, emergent
- Chaotic: no cause-effect, act first
- Confused: domain genuinely unclear

Reasoning Mode:
- Deductive: from general principle to specific conclusion
- Inductive: from specific observations to general pattern
- Abductive: best available explanation given incomplete data
- Unknown: cannot be determined

Observer Relevance (Vervaeke):
- High: directly present, actively shaping attention
- Medium: present but backgrounded
- Low: peripheral, mentioned but not load-bearing

RULES:
- Extract claims as close to the user's own language as possible
- claims array: minimum 5, maximum 15
- inferred: true only if you had to infer a claim not explicitly stated
- central_claim_id: the claim that most anchors the orientation
- socratic_needed: true only if critical map coordinates are genuinely missing`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brainDump } = body

    if (!brainDump || typeof brainDump !== 'string' || brainDump.trim().length === 0) {
      return NextResponse.json(
        { error: 'Orientation could not be mapped. Please try again.' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: brainDump }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/orient] Error:', err)
    return NextResponse.json(
      { error: 'Orientation could not be mapped. Please try again.' },
      { status: 500 }
    )
  }
}
