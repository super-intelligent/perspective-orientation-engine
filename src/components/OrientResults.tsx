'use client'

import { useState } from 'react'

interface ClaimNarrative {
  quadrant: string
  domain: string
  reasoning: string
  relevance: string
  gravity: string
}

interface Claim {
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
  UL: 'border-blue-400 text-blue-300',
  UR: 'border-green-400 text-green-300',
  LL: 'border-purple-400 text-purple-300',
  LR: 'border-amber-400 text-amber-300',
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

function getNarrative(n: ClaimNarrative | string | undefined): ClaimNarrative | null {
  if (!n) return null
  if (typeof n === 'string') return null
  return n
}

function ClickableBadge({
  label,
  explanation,
  quadrantColor,
  isActive,
  onClick,
  axisKey,
}: {
  label: string
  explanation?: string | null
  quadrantColor?: string
  isActive?: boolean
  onClick?: () => void
  axisKey?: string
}) {
  const base = 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border cursor-pointer transition-all'
  const colors = quadrantColor ?? 'border-[var(--poe-border)] text-[var(--poe-text-secondary)]'
  const activeStyle = isActive ? 'ring-1 ring-[var(--poe-accent)] bg-[var(--poe-accent)]/10' : ''
  const clickable = explanation ? 'hover:border-[var(--poe-accent)]' : 'cursor-default'

  return (
    <span
      className={`${base} ${colors} ${activeStyle} ${clickable}`}
      onClick={explanation ? onClick : undefined}
      data-axis-key={axisKey}
    >
      {label}
    </span>
  )
}

function RelevanceLegend({ level }: { level: string }) {
  const levels = ['Low', 'Medium', 'High']
  return (
    <div className="flex items-center gap-3 mt-2 mb-1">
      {levels.map((l) => (
        <span
          key={l}
          className={`text-[11px] px-2 py-0.5 rounded ${
            l === level
              ? 'text-[var(--poe-accent)] border border-[var(--poe-accent)] font-medium'
              : 'text-[var(--poe-text-muted)] border border-[var(--poe-border)]'
          }`}
        >
          {l}
        </span>
      ))}
    </div>
  )
}

function NarrativeSection({
  text,
  sectionKey,
}: {
  text: string | undefined | null
  sectionKey?: string
}) {
  if (!text) return null
  return (
    <p
      className="text-sm text-[var(--poe-text-secondary)] leading-relaxed mt-2 mb-3"
      data-narrative-key={sectionKey}
    >
      {text}
    </p>
  )
}

function InteractiveBadgeRow({ claim }: { claim: Claim }) {
  const [activeBadge, setActiveBadge] = useState<string | null>(null)
  const narr = getNarrative(claim.narrative)

  const toggle = (key: string) => {
    setActiveBadge(activeBadge === key ? null : key)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ClickableBadge
          label={claim.quadrant}
          quadrantColor={QUADRANT_COLORS[claim.quadrant]}
          explanation={narr?.quadrant}
          isActive={activeBadge === 'quadrant'}
          onClick={() => toggle('quadrant')}
          axisKey="quadrant"
        />
        <ClickableBadge
          label={claim.domain}
          explanation={narr?.domain}
          isActive={activeBadge === 'domain'}
          onClick={() => toggle('domain')}
          axisKey="domain"
        />
        <ClickableBadge
          label={claim.reasoning}
          explanation={narr?.reasoning}
          isActive={activeBadge === 'reasoning'}
          onClick={() => toggle('reasoning')}
          axisKey="reasoning"
        />
        <ClickableBadge
          label={claim.relevance}
          explanation={narr?.relevance}
          isActive={activeBadge === 'relevance'}
          onClick={() => toggle('relevance')}
          axisKey="relevance"
        />
      </div>

      {activeBadge && narr && (
        <div className="mt-3 pl-2 border-l-2 border-[var(--poe-accent)]/30">
          {activeBadge === 'relevance' && (
            <RelevanceLegend level={claim.relevance} />
          )}
          <NarrativeSection
            text={
              activeBadge === 'quadrant' ? narr.quadrant :
              activeBadge === 'domain' ? narr.domain :
              activeBadge === 'reasoning' ? narr.reasoning :
              activeBadge === 'relevance' ? narr.relevance :
              null
            }
            sectionKey={activeBadge}
          />
        </div>
      )}
    </div>
  )
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
    <div
      className="p-4 bg-[var(--poe-surface)] border border-[var(--poe-border)] border-t-2 border-t-[var(--poe-accent)] rounded"
      data-claim-id={claim.id}
    >
      <p className="text-[10px] uppercase tracking-wider text-[var(--poe-accent)] mb-1 font-medium">
        ● Orientation Center
      </p>
      <p className="text-[15px] font-medium text-[var(--poe-text-primary)] mb-1">
        {claim.archetype}
      </p>
      <p className="text-sm text-[var(--poe-text-primary)] mb-3">
        &ldquo;{claim.text}&rdquo;
      </p>
      <InteractiveBadgeRow claim={claim} />
      <TensionDisplay
        quadrantTension={claim.quadrant_tension ?? []}
        domainTension={claim.domain_tension ?? []}
      />

      {/* Full narrative sections — always visible for central claim */}
      {getNarrative(claim.narrative) ? (
        <div className="mt-4 space-y-3">
          <NarrativeSection text={getNarrative(claim.narrative)?.quadrant} sectionKey="quadrant" />
          <NarrativeSection text={getNarrative(claim.narrative)?.domain} sectionKey="domain" />
          <NarrativeSection text={getNarrative(claim.narrative)?.reasoning} sectionKey="reasoning" />
          <NarrativeSection text={getNarrative(claim.narrative)?.relevance} sectionKey="relevance" />
          <NarrativeSection text={getNarrative(claim.narrative)?.gravity} sectionKey="gravity" />
        </div>
      ) : typeof claim.narrative === 'string' && claim.narrative ? (
        <p className="text-sm text-[var(--poe-text-secondary)] mt-3 leading-relaxed">
          {claim.narrative}
        </p>
      ) : null}

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
    <div
      className="p-4 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded"
      data-claim-id={claim.id}
    >
      <p className="text-[13px] font-medium text-[var(--poe-text-primary)] mb-1">
        {claim.archetype}
      </p>
      <p className="text-sm text-[var(--poe-text-primary)] mb-3">
        &ldquo;{claim.text}&rdquo;
      </p>
      <InteractiveBadgeRow claim={claim} />
      <TensionDisplay
        quadrantTension={claim.quadrant_tension ?? []}
        domainTension={claim.domain_tension ?? []}
      />
      {roleLabel && (
        <p className="text-[11px] text-[var(--poe-text-muted)] italic mt-2">
          {roleLabel} for {centerArchetype ?? 'center'}
        </p>
      )}

      {/* Expandable narrative — sections with paragraph breaks */}
      {getNarrative(claim.narrative) ? (
        <details className="mt-3">
          <summary className="text-xs text-[var(--poe-accent)] cursor-pointer hover:underline">
            Why this placement
          </summary>
          <div className="mt-2 space-y-3">
            <NarrativeSection text={getNarrative(claim.narrative)?.quadrant} sectionKey="quadrant" />
            <NarrativeSection text={getNarrative(claim.narrative)?.domain} sectionKey="domain" />
            <NarrativeSection text={getNarrative(claim.narrative)?.reasoning} sectionKey="reasoning" />
            <NarrativeSection text={getNarrative(claim.narrative)?.relevance} sectionKey="relevance" />
            <NarrativeSection text={getNarrative(claim.narrative)?.gravity} sectionKey="gravity" />
          </div>
        </details>
      ) : typeof claim.narrative === 'string' && claim.narrative ? (
        <details className="mt-3">
          <summary className="text-xs text-[var(--poe-accent)] cursor-pointer hover:underline">
            Why this placement
          </summary>
          <p className="text-sm text-[var(--poe-text-secondary)] mt-2 leading-relaxed">
            {claim.narrative}
          </p>
        </details>
      ) : null}
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
