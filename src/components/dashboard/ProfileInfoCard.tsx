'use client'

/**
 * Profile info card - editable fields for bio page content.
 * Saves to localStorage so the editor can use them (e.g. replace "Your Name" with username).
 */
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cursedbio-profile-info'

export type ProfileInfo = {
  displayName: string
  username: string
  tagline: string
  bio: string
}

const DEFAULT: ProfileInfo = {
  displayName: '',
  username: '',
  tagline: '',
  bio: '',
}

function load(): ProfileInfo {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfileInfo>
      return { ...DEFAULT, ...parsed }
    }
  } catch {}
  return DEFAULT
}

export function saveProfileInfo(info: ProfileInfo) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
}

export function getProfileInfo(): ProfileInfo {
  return load()
}

export default function ProfileInfoCard({
  defaultUsername = '',
  defaultDisplayName = '',
}: {
  defaultUsername?: string
  defaultDisplayName?: string
}) {
  const [info, setInfo] = useState<ProfileInfo>(DEFAULT)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = load()
    setInfo((prev) => ({
      ...prev,
      ...stored,
      username: stored.username || defaultUsername || prev.username,
      displayName: stored.displayName || defaultDisplayName || prev.displayName,
    }))
  }, [defaultUsername, defaultDisplayName])

  const handleChange = (field: keyof ProfileInfo, value: string) => {
    setInfo((prev) => {
      const next = { ...prev, [field]: value }
      saveProfileInfo(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
      return next
    })
  }

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-secondary)]/80 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--accent-blue-soft)]">
          Your Info
        </h2>
        {saved && (
          <span className="text-xs text-emerald-400/90">Saved</span>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Fill these in — they&apos;ll appear in the editor when you add text elements (e.g. instead of &quot;Your Name&quot;).
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Display name
          </label>
          <input
            type="text"
            value={info.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            placeholder="How you want to appear"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50 transition"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Username
          </label>
          <input
            type="text"
            value={info.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="yourname"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50 transition font-mono"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Tagline
          </label>
          <input
            type="text"
            value={info.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            placeholder="Short tagline here"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50 transition"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            Bio
          </label>
          <textarea
            value={info.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="A bit about you..."
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50 transition resize-none"
          />
        </div>
      </div>
    </div>
  )
}
