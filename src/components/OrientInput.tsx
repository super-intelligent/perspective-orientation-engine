'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface OrientInputProps {
  user: User | null
  sessionCount: number
  onNeedsAuth: () => void
  onNeedsUpgrade: () => void
  onSessionIncrement: () => Promise<void>
  onStateChange: (state: 'input' | 'loading' | 'results') => void
  onResult: (data: Record<string, unknown>) => void
}

export default function OrientInput({
  user,
  sessionCount,
  onNeedsAuth,
  onNeedsUpgrade,
  onSessionIncrement,
  onStateChange,
  onResult,
}: OrientInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isMember = user?.user_metadata?.is_member === true

  const handleOrient = async () => {
    // Auth and session gating bypassed for pipeline testing
    // TODO: re-enable auth checks before production

    setError(null)
    onStateChange('loading')

    try {
      const response = await fetch('/api/orient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainDump: value }),
      })

      const data = await response.json()

      if (data.error) {
        onResult(data)
        onStateChange('results')
        return
      }

      onResult(data)
      onStateChange('results')
      await onSessionIncrement()
    } catch (err) {
      console.error('[OrientInput] Error:', err)
      setError('Orientation could not be mapped. Please try again.')
      onStateChange('input')
    }
  }

  const reset = () => {
    setValue('')
    setError(null)
  }

  return (
    <div className="w-full space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Begin here."
        className="w-full min-h-[280px] px-4 py-3 bg-[var(--poe-surface)] border border-[var(--poe-border)] text-[var(--poe-text-primary)] rounded resize-y focus:outline-none focus:border-[var(--poe-accent-dim)] placeholder:text-[var(--poe-text-secondary)] placeholder:opacity-100 focus:placeholder:opacity-40 transition-all"
      />

      <button
        onClick={handleOrient}
        disabled={value.length < 20}
        className="w-full py-3 bg-[var(--poe-accent)] text-black font-medium rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--poe-accent)]/90 transition-colors"
      >
        Orient
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
