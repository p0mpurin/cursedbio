'use client'

import { useEffect, useRef, useState } from 'react'

const TOAST_DURATION_MS = 2200

export default function CopyToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      const detail = (e as CustomEvent<{ message?: string }>).detail
      setMessage(detail?.message ?? 'Copied!')
      timeoutRef.current = setTimeout(() => {
        setMessage(null)
        timeoutRef.current = null
      }, TOAST_DURATION_MS)
    }
    window.addEventListener('cursedbio-toast', handler)
    return () => {
      window.removeEventListener('cursedbio-toast', handler)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
    >
      <div className="px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-white/15 text-[var(--text-primary)] text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease-out]">
        {message}
      </div>
    </div>
  )
}
