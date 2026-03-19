'use client'

interface Claim {
  id: string
  text: string
  quadrant: 'UL' | 'UR' | 'LL' | 'LR'
  domain: string
  reasoning: string
  relevance: string
  inferred: boolean
}

interface OrientResult {
  claims?: Claim[]
  central_claim_id?: string
  error?: string
}

const QUADRANT_COLORS: Record<string, string> = {
  UL: 'border-blue-400/40 text-blue-300/80',
  UR: 'border-green-400/40 text-green-300/80',
  LL: 'border-purple-400/40 text-purple-300/80',
  LR: 'border-amber-400/40 text-amber-300/80',
}

function Badge({ label, quadrantColor }: { label: string; quadrantColor?: string }) {
  const base = 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border'
  const colors = quadrantColor ?? 'border-[var(--poe-border)] text-[var(--poe-text-secondary)]'
  return <span className={`${base} ${colors}`}>{label}</span>
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

  return (
    <div className="flex-1 py-8">
      <h2 className="text-lg font-medium text-[var(--poe-text-primary)] mb-1">
        Orientation Map Generated
      </h2>
      <p className="text-xs text-[var(--poe-text-muted)] mb-8">
        Orientation snapshot. Not a verdict.
      </p>

      <div className="space-y-3">
        {claims.map((claim) => {
          const isCentral = claim.id === result.central_claim_id
          return (
            <div
              key={claim.id}
              className={`p-4 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded ${
                isCentral ? 'border-l-2 border-l-[var(--poe-accent)]' : ''
              }`}
            >
              <p className="text-[var(--poe-text-primary)] text-sm mb-3">
                {claim.text}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge label={claim.quadrant} quadrantColor={QUADRANT_COLORS[claim.quadrant]} />
                <Badge label={claim.domain} />
                <Badge label={claim.reasoning} />
                <Badge label={claim.relevance} />
              </div>
            </div>
          )
        })}
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
