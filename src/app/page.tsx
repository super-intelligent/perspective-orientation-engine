import OrientInput from '@/components/OrientInput'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
      {/* Zone 1 — Title Bar (fixed top) */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center justify-between px-6 z-10">
        <h1 className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)]">
          PERSPECTIVE ORIENTATION ENGINE
        </h1>
        <div>{/* Placeholder for auth */}</div>
      </header>

      {/* Main content area with top padding to account for fixed header */}
      <main className="flex-1 pt-12 flex flex-col">
        <div className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col">
          {/* Zone 2 — Tagline */}
          <p className="text-center text-[var(--poe-text-secondary)] mb-12">
            The system does not evaluate reality. It stabilizes orientation toward it.
          </p>

          {/* Zone 3 — Disorder Invitation */}
          <p className="text-[var(--poe-text-primary)] mb-6">
            Describe your current situation. Whatever feels most present.
          </p>

          {/* Zone 4 — Input Area */}
          <div className="flex-1">
            <OrientInput />
          </div>
        </div>

        {/* Zone 5 — Disclaimer (bottom, always visible) */}
        <footer className="w-full px-6 py-6 text-center">
          <p className="text-[11px] text-[var(--poe-text-muted)] max-w-3xl mx-auto leading-relaxed">
            This system does not determine truth or prescribe action.
            It visualizes how claims, experiences, and narratives distribute across
            multiple ontological perspectives and complexity domains.
            Its purpose is orientation, not verification.
          </p>
        </footer>
      </main>
    </div>
  )
}
