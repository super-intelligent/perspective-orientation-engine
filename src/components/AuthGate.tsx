'use client'

export default function AuthGate({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 p-8 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium text-[var(--poe-text-primary)] mb-2">
          Your free orientation is complete.
        </h2>
        <p className="text-sm text-[var(--poe-text-secondary)] mb-6">
          Members orient without limits.
        </p>
        <a
          href="#"
          className="block w-full py-3 bg-[var(--poe-accent)] text-black font-medium rounded text-center hover:bg-[var(--poe-accent)]/90 transition-colors"
        >
          Become a member
        </a>
      </div>
    </div>
  )
}
