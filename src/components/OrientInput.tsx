'use client'

import { useState } from 'react'

export default function OrientInput() {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOrient = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/orient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainDump: value })
      })

      const data = await response.json()
      console.log('[OrientInput] Response:', data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('[OrientInput] Error:', err)
    } finally {
      setIsLoading(false)
    }
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
        disabled={value.length < 20 || isLoading}
        className="w-full py-3 bg-[var(--poe-accent)] text-black font-medium rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--poe-accent)]/90 transition-colors"
      >
        {isLoading ? 'Orienting...' : 'Orient'}
      </button>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}
