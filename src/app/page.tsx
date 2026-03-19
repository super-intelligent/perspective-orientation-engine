'use client'

import { useState, useRef, useEffect } from 'react'
import OrientInput from '@/components/OrientInput'
import OrientTransition from '@/components/OrientTransition'
import OrientResults from '@/components/OrientResults'
import AuthModal from '@/components/AuthModal'
import AuthGate from '@/components/AuthGate'
import { useAuth } from '@/hooks/useAuth'
import { useSessionCount } from '@/hooks/useSessionCount'

function truncateEmail(email: string): string {
  if (email.length <= 24) return email
  const [local, domain] = email.split('@')
  if (!domain) return email.slice(0, 24) + '...'
  const truncatedLocal = local.length > 12 ? local.slice(0, 12) + '...' : local
  return `${truncatedLocal}@${domain}`
}

type PageState = 'input' | 'loading' | 'results'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const { count, increment } = useSessionCount(user?.id)
  const [pageState, setPageState] = useState<PageState>('input')
  const [orientResult, setOrientResult] = useState<Record<string, unknown> | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleReset = () => {
    setPageState('input')
    setOrientResult(null)
  }

  return (
    <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
      {/* Zone 1 — Title Bar (fixed top) */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center justify-between px-6 z-10">
        <h1 className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)]">
          PERSPECTIVE ORIENTATION ENGINE
        </h1>
        <div>
          {!loading && user?.email && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="text-xs text-[var(--poe-text-secondary)] hover:text-[var(--poe-text-primary)] transition-colors"
              >
                {truncateEmail(user.email)}
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded shadow-lg">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      signOut()
                    }}
                    className="px-4 py-2 text-sm text-[var(--poe-text-secondary)] hover:text-[var(--poe-text-primary)] hover:bg-[var(--poe-bg)] whitespace-nowrap transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content area with top padding to account for fixed header */}
      <main className="flex-1 pt-12 flex flex-col">
        <div className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col">
          {pageState === 'input' && (
            <>
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
                <OrientInput
                  user={user}
                  sessionCount={count}
                  onNeedsAuth={() => setShowAuthModal(true)}
                  onNeedsUpgrade={() => setShowAuthGate(true)}
                  onSessionIncrement={increment}
                  onStateChange={setPageState}
                  onResult={setOrientResult}
                />
              </div>
            </>
          )}

          {pageState === 'loading' && <OrientTransition />}

          {pageState === 'results' && orientResult && (
            <OrientResults result={orientResult} onReset={handleReset} />
          )}
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

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showAuthGate && <AuthGate onClose={() => setShowAuthGate(false)} />}
    </div>
  )
}
