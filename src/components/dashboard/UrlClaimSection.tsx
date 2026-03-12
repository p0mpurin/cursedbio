'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MAX_FREE_URL_CHANGES = 3

type UrlClaimSectionProps = {
  currentSlug: string
  changesUsed: number
  onClaimed?: (newSlug: string) => void
}

export default function UrlClaimSection({
  currentSlug,
  changesUsed,
  onClaimed,
}: UrlClaimSectionProps) {
  const router = useRouter()
  const [value, setValue] = useState(currentSlug)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const remaining = MAX_FREE_URL_CHANGES - changesUsed
  const canChange = remaining > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const slug = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
    if (!slug) {
      setError('Enter a URL slug')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/claim-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: slug }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Failed to claim URL')
        return
      }
      setSuccess(`URL updated to /${data.username}`)
      setValue(data.username)
      onClaimed?.(data.username)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Your page URL</p>
        <p className="font-mono text-sm text-[var(--text-primary)]">/{currentSlug}</p>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {remaining > 0
          ? `${remaining} of ${MAX_FREE_URL_CHANGES} free URL change${MAX_FREE_URL_CHANGES === 1 ? '' : 's'} remaining.`
          : `You've used all ${MAX_FREE_URL_CHANGES} free URL changes.`}
      </p>

      {canChange && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full sm:max-w-xs">
            <label htmlFor="claim-url" className="sr-only">Claim or change URL</label>
            <input
              id="claim-url"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="your-custom-url"
              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/15 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || value.trim() === ''}
            className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/80 hover:bg-[var(--accent-blue)] text-white text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Saving…' : 'Claim / Change URL'}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">{success}</p>}
    </div>
  )
}
