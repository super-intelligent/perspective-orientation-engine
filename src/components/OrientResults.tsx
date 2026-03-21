'use client'

interface Claim {
  id: string
  text: string
  quadrant: 'UL' | 'UR' | 'LL' | 'LR'
  domain: string
  reasoning: string
  relevance: string
  inferred: boolean
  archetype: string
  quadrant_tension: string[]
  domain_tension: string[]
  gravity_role: string | null
}

interface GravityStructure {
  center_archetype: string
  why_central: string
  structural_support: string[]
  narrative_pressure: string[]
  internal_anchoring: string[]
  direct_observation: string[]
  recursive_loop: string | null
  pattern?: string
  description?: string
}

interface OrientResult {
  claims?: Claim[]
  central_claim_id?: string | string[]
  field_coherence?: string
  gravity_structure?: GravityStructure | GravityStructure[] | null
  socratic_needed?: boolean
  error?: string
}

const QUADRANT_COLORS: Record<string, string> = {
  UL: 'border-blue-400/40 text-blue-300/80',
  UR: 'border-green-400/40 text-green-300/80',
  LL: 'border-purple-400/40 text-purple-300/80',
  LR: 'border-amber-400/40 text-amber-300/80',
}

const QUADRANT_LABELS: Record<string, string> = {
  UL: 'Upper Left — Interior Individual',
  UR: 'Upper Right — Exterior Individual',
  LL: 'Lower Left — Interior Collective',
  LR: 'Lower Right — Exterior Collective',
}

const GRAVITY_ROLE_LABELS: Record<string, string> = {
  structural_support: 'Structural support',
  narrative_pressure: 'Narrative pressure',
  internal_anchoring: 'Internal anchor',
  direct_observation: 'Direct observation',
}

function Badge({ label, quadrantColor, dimmed }: { label: string; quadrantColor?: string; dimmed?: boolean }) {
  const base = 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border'
  const colors = quadrantColor ?? 'border-[var(--poe-border)] text-[var(--poe-text-secondary)]'
  const opacity = dimmed ? 'opacity-50' : ''
  return <span className={`${base} ${colors} ${opacity}`}>{label}</span>
}

function TensionDisplay({ quadrantTension, domainTension }: { quadrantTension: string[]; domainTension: string[] }) {
  const tensions = [...quadrantTension, ...domainTension]
  if (tensions.length === 0) return null
  return (
    <p className="text-[11px] text-[var(--poe-text-muted)] mt-1">
      Tension: {tensions.join(', ')}
    </p>
  )
}

function GravitySection({
  structure,
  claims,
}: {
  structure: GravityStructure
  claims: Claim[]
}) {
  const claimMap = new Map(claims.map((c) => [c.id, c]))

  const groups: { key: keyof GravityStructure; label: string }[] = [
    { key: 'structural_support', label: 'Structural support' },
    { key: 'narrative_pressure', label: 'Narrative pressure' },
    { key: 'internal_anchoring', label: 'Internal anchoring' },
    { key: 'direct_observation', label: 'Direct observation' },
  ]

  return (
    <div className="mt-4 pt-4 border-t border-[var(--poe-border)]">
      <p className="text-xs uppercase tracking-wider text-[var(--poe-text-secondary)] mb-3">
        Gravitational Structure
      </p>
      {groups.map(({ key, label }) => {
        const ids = structure[key] as string[] | undefined
        if (!ids || !Array.isArray(ids) || ids.length === 0) return null
        return (
          <div key={key} className="mb-2">
            <p className="text-xs text-[var(--poe-text-secondary)]">{label}:</p>
            {ids.map((id) => {
              const claim = claimMap.get(id)
              return (
                <p key={id} className="text-[11px] text-[var(--poe-text-muted)] ml-3">
                  {claim?.archetype ?? id}
                </p>
              )
            })}
          </div>
        )
      })}
      {structure.recursive_loop && (
        <p className="text-[11px] text-[var(--poe-text-muted)] mt-2">
          ↻ {structure.recursive_loop}
        </p>
      )}
    </div>
  )
}

function CentralClaimCard({
  claim,
  result,
  claims,
  gravityStructure,
}: {
  claim: Claim
  result: OrientResult
  claims: Claim[]
  gravityStructure: GravityStructure | null
}) {
  const showGravity =
    gravityStructure &&
    !gravityStructure.pattern &&
    result.field_coherence !== 'low' &&
    result.field_coherence !== 'distributed'

  return (
    <div className="p-4 bg-[var(--poe-surface)] border border-[var(--poe-border)] border-t-2 border-t-[var(--poe-accent)] rounded">
      <p className="text-[10px] uppercase tracking-wider text-[var(--poe-accent)] mb-1 font-medium">
        ● Orientation Center
      </p>
      <p className="text-[15px] font-medium text-[var(--poe-text-primary)] mb-1">
        {claim.archetype}
      </p>
      <p className="text-sm text-[var(--poe-text-primary)] mb-3">
        &ldquo;{claim.text}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge label={claim.quadrant} quadrantColor={QUADRANT_COLORS[claim.quadrant]} />
        <Badge label={claim.domain} />
        <Badge label={claim.reasoning} />
        <Badge label={claim.relevance} />
      </div>
      <TensionDisplay quadrantTension={claim.quadrant_tension ?? []} domainTension={claim.domain_tension ?? []} />
      {gravityStructure?.why_central && (
        <p className="text-xs text-[var(--poe-text-secondary)] mt-3">
          {gravityStructure.why_central}
        </p>
      )}
      {showGravity && <GravitySection structure={gravityStructure} claims={claims} />}
    </div>
  )
}

function ClaimCard({
  claim,
  centerArchetype,
}: {
  claim: Claim
  centerArchetype: string | null
}) {
  const roleLabel = claim.gravity_role ? GRAVITY_ROLE_LABELS[claim.gravity_role] : null

  return (
    <div className="p-4 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded">
      <p className="text-[13px] font-medium text-[var(--poe-text-primary)] mb-1">
        {claim.archetype}
      </p>
      <p className="text-sm text-[var(--poe-text-primary)] mb-3">
        &ldquo;{claim.text}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge label={claim.quadrant} quadrantColor={QUADRANT_COLORS[claim.quadrant]} />
        <Badge label={claim.domain} />
        <Badge label={claim.reasoning} />
        <Badge label={claim.relevance} />
      </div>
      <TensionDisplay quadrantTension={claim.quadrant_tension ?? []} domainTension={claim.domain_tension ?? []} />
      {roleLabel && (
        <p className="text-[11px] text-[var(--poe-text-muted)] italic mt-2">
          {roleLabel} for {centerArchetype ?? 'center'}
        </p>
      )}
    </div>
  )
}

export default function OrientResults({
  result,
  onReset,
}: {
  result: OrientResult
  onReset: () => void
}) {
  if (result.error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24">
        <p className="text-[var(--poe-text-primary)] mb-6">{result.error}</p>
        <button
          onClick={onReset}
          className="text-sm text-[var(--poe-text-secondary)] hover:text-[var(--poe-text-primary)] transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  const claims = result.claims ?? []
  const centralIds = Array.isArray(result.central_claim_id)
    ? result.central_claim_id
    : result.central_claim_id
      ? [result.central_claim_id]
      : []

  const centralClaims = claims.filter((c) => centralIds.includes(c.id))
  const otherClaims = claims.filter((c) => !centralIds.includes(c.id))

  // Resolve gravity structures per central claim
  const gravityStructures = Array.isArray(result.gravity_structure)
    ? result.gravity_structure
    : result.gravity_structure
      ? [result.gravity_structure]
      : []

  const isDistributedOrLow =
    result.field_coherence === 'distributed' || result.field_coherence === 'low'

  // Get center archetype for non-central claim labels
  const centerArchetype =
    centralClaims.length === 1
      ? centralClaims[0].archetype
      : centralClaims.length > 1
        ? centralClaims.map((c) => c.archetype).join(' / ')
        : null

  return (
    <div className="flex-1 py-8">
      <h2 className="text-lg font-medium text-[var(--poe-text-primary)] mb-1">
        Orientation Map Generated
      </h2>
      <p className="text-xs text-[var(--poe-text-muted)] mb-8">
        Orientation snapshot. Not a verdict.
      </p>

      <div className="space-y-3">
        {/* Central claim(s) first */}
        {isDistributedOrLow ? (
          <div className="p-4 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded">
            <p className="text-xs text-[var(--poe-text-muted)] italic">
              No dominant orientation center detected in this field.
            </p>
          </div>
        ) : (
          centralClaims.map((claim, idx) => (
            <CentralClaimCard
              key={claim.id}
              claim={claim}
              result={result}
              claims={claims}
              gravityStructure={gravityStructures[idx] ?? gravityStructures[0] ?? null}
            />
          ))
        )}

        {/* Other claims in original order */}
        {otherClaims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} centerArchetype={centerArchetype} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="text-sm text-[var(--poe-text-secondary)] hover:text-[var(--poe-text-primary)] transition-colors"
        >
          Orient again
        </button>
      </div>
    </div>
  )
}
