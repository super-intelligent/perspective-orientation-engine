'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    setError(null)

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setSending(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://perspective.super-intelligent.ai/auth/callback',
      },
    })
    setSending(false)

    if (otpError) {
      setError("Couldn't send the link. Please try again.")
      return
    }

    setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 p-8 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <h2 className="text-lg font-medium text-[var(--poe-text-primary)] mb-2">
              Orient requires an email.
            </h2>
            <p className="text-sm text-[var(--poe-text-secondary)] mb-6">
              We send a one-time link. No password. No account setup.
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com"
              className="w-full px-4 py-3 mb-4 bg-[var(--poe-bg)] border border-[var(--poe-border)] text-[var(--poe-text-primary)] rounded focus:outline-none focus:border-[var(--poe-accent-dim)]"
            />

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={sending}
              className="w-full py-3 bg-[var(--poe-accent)] text-black font-medium rounded hover:bg-[var(--poe-accent)]/90 transition-colors disabled:opacity-40"
            >
              {sending ? 'Sending...' : 'Send orientation link'}
            </button>

            <p className="text-xs text-[var(--poe-text-muted)] mt-4 text-center">
              You get one free orientation. Members get unlimited.
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-[var(--poe-text-primary)] mb-6">
              Check your email. Your orientation link is waiting.
            </p>
            <button
              onClick={() => {
                setSent(false)
                setSending(false)
                setError(null)
              }}
              className="text-sm text-[var(--poe-text-secondary)] hover:text-[var(--poe-text-primary)] transition-colors"
            >
              Resend link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
