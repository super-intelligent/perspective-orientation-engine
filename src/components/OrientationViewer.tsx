'use client'

import { useEffect, useState, use } from 'react'
import OrientResults from '@/components/OrientResults'
import Link from 'next/link'

export default function OrientationViewer({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>
}) {
  const { id } = use(paramsPromise)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [brainDump, setBrainDump] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/orient/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setBrainDump(data.brain_dump ?? null)
          setResult(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load orientation.')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
        <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center px-6 z-10">
          <Link href="/" className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)] hover:text-[var(--poe-accent)] transition-colors">
            PERSPECTIVE ORIENTATION ENGINE
          </Link>
        </header>
        <main className="flex-1 pt-12 flex flex-col items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--poe-accent)] animate-pulse" style={{ animationDuration: '2s' }} />
          <p className="text-[var(--poe-text-secondary)] mt-4 text-sm">Loading orientation...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
        <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center px-6 z-10">
          <Link href="/" className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)] hover:text-[var(--poe-accent)] transition-colors">
            PERSPECTIVE ORIENTATION ENGINE
          </Link>
        </header>
        <main className="flex-1 pt-12 flex flex-col items-center justify-center">
          <p className="text-[var(--poe-text-primary)] mb-4">{error}</p>
          <Link href="/" className="text-sm text-[var(--poe-accent)] hover:underline">Start a new orientation</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--poe-bg)] flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-12 bg-[var(--poe-surface)] border-b border-[var(--poe-border)] flex items-center justify-between px-6 z-10">
        <Link href="/" className="text-xs uppercase tracking-wider text-[var(--poe-text-primary)] hover:text-[var(--poe-accent)] transition-colors">
          PERSPECTIVE ORIENTATION ENGINE
        </Link>
        <p className="text-[10px] text-[var(--poe-text-muted)]">
          Saved orientation
        </p>
      </header>
      <main className="flex-1 pt-12 flex flex-col">
        <div className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col">
          {brainDump && (
            <details className="mb-6">
              <summary className="text-xs text-[var(--poe-text-secondary)] cursor-pointer hover:text-[var(--poe-text-primary)] transition-colors">
                Original brain dump
              </summary>
              <p className="mt-2 text-sm text-[var(--poe-text-secondary)] bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded p-4 whitespace-pre-wrap">
                {brainDump}
              </p>
            </details>
          )}
          {result && (
            <OrientResults result={result} onReset={() => window.location.href = '/'} />
          )}
        </div>
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
