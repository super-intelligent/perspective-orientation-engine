'use client'

export default function OrientTransition() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24">
      <div
        className="w-2 h-2 rounded-full bg-[var(--poe-accent)] animate-pulse mb-8"
        style={{ animationDuration: '2s' }}
      />
      <p className="text-[var(--poe-text-primary)] text-lg font-light tracking-wide mb-3">
        Orientation in progress.
      </p>
      <p className="text-[var(--poe-text-secondary)] text-sm">
        Mapping your situation across multiple perspectives.
      </p>
    </div>
  )
}
