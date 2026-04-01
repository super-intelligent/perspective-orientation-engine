export interface ClaimNarrative {
  quadrant: string
  domain: string
  reasoning: string
  relevance: string
  gravity: string
}

export interface Claim {
  id: string
  text: string
  quadrant: 'UL' | 'UR' | 'LL' | 'LR'
  domain: string
  reasoning: string
  relevance: string
  inferred: boolean
  archetype: string
  narrative: ClaimNarrative | string
  quadrant_tension: string[]
  domain_tension: string[]
  gravity_role: string | null
}
