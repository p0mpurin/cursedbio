'use client'

/**
 * Simple layout templates - quick setup for non-advanced users.
 * Choose a layout, fill a short form, then open the editor with your content.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProfileInfo } from './ProfileInfoCard'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'

const STORAGE_KEY = 'cursedbio-editor-layout'

export type SimpleLayoutConfig = {
  id: string
  name: string
  description: string
  template: () => Promise<ResponsivePageLayout>
}

type SocialProfileForm = {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  showDiscord: boolean
  joinedText: string
  musicUrl: string
  trackTitle: string
  albumArtUrl: string
}

function applySocialProfileForm(
  layout: ResponsivePageLayout,
  form: SocialProfileForm
): ResponsivePageLayout {
  const applyToVariant = (variant: PageLayout) => ({
    ...variant,
    elements: variant.elements
      .filter((el) => form.showDiscord || el.id !== 'discord')
      .map((el) => {
        const upd: Record<string, unknown> = { ...(el.props ?? {}) }
        if (el.id === 'avatar' && form.avatarUrl) upd.src = form.avatarUrl
        if (el.id === 'name') upd.content = form.displayName || form.username
        if (el.id === 'bio') upd.content = form.bio
        if (el.id === 'joined') upd.content = form.joinedText
        if (el.id === 'music') {
          upd.src = form.musicUrl
          upd.trackTitle = form.trackTitle
          upd.albumArtUrl = form.albumArtUrl
        }
        return { ...el, props: upd }
      }),
  })

  return {
    ...layout,
    desktop: applyToVariant(layout.desktop),
    mobile: applyToVariant(layout.mobile),
  }
}

const LAYOUTS: SimpleLayoutConfig[] = [
  {
    id: 'social-profile',
    name: 'Social Profile',
    description: 'Avatar, username, bio, Discord profile, and a music player.',
    template: () => import('@/lib/editor/templates/social-profile-responsive.json').then((m) => m.default as ResponsivePageLayout),
  },
]

export default function SimpleLayoutsSection({
  defaultUsername = '',
  defaultDisplayName = '',
}: {
  defaultUsername?: string
  defaultDisplayName?: string
} = {}) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const profile = getProfileInfo()

  const [form, setForm] = useState<SocialProfileForm>({
    username: profile.username || defaultUsername || '',
    displayName: profile.displayName || defaultDisplayName || '',
    bio: profile.bio || profile.tagline || '',
    avatarUrl: '',
    showDiscord: true,
    joinedText: `Joined ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    musicUrl: '',
    trackTitle: '',
    albumArtUrl: '',
  })

  const handleUse = async (config: SimpleLayoutConfig) => {
    setExpandedId(config.id)
    if (config.id === 'social-profile') {
      setForm((f) => ({
        ...f,
        username: profile.username || f.username,
        displayName: profile.displayName || f.displayName,
        bio: profile.bio || profile.tagline || f.bio,
      }))
    }
  }

  const handleSubmit = async (config: SimpleLayoutConfig) => {
    const template = await config.template()
    let layout: ResponsivePageLayout
    if (config.id === 'social-profile') {
      layout = applySocialProfileForm(template, form)
    } else {
      layout = template
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    router.push('/editor')
  }

  return (
    <section className="mb-12 p-6 rounded-2xl bg-[var(--bg-secondary)]/80 border border-white/10">
      <h2 className="text-lg font-semibold text-[var(--accent-blue-soft)] mb-2">
        Quick layouts
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Pick a layout and fill in your info — no need to use the full editor. Your data will open in the editor so you can tweak it further.
      </p>
      <div className="space-y-4">
        {LAYOUTS.map((config) => (
          <div
            key={config.id}
            className="rounded-xl bg-black/30 border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">{config.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{config.description}</p>
              </div>
              <button
                onClick={() => handleUse(config)}
                className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/80 hover:bg-[var(--accent-blue)] text-white text-sm font-medium transition"
              >
                Use
              </button>
            </div>
            {expandedId === config.id && config.id === 'social-profile' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit(config)
                }}
                className="p-4 pt-0 border-t border-white/10 space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      placeholder="yourname"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Display name</label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="How you appear"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Bio / status</label>
                  <input
                    type="text"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="A short bio or status"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Avatar URL</label>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Joined text</label>
                  <input
                    type="text"
                    value={form.joinedText}
                    onChange={(e) => setForm((f) => ({ ...f, joinedText: e.target.value }))}
                    placeholder="Joined October 14, 2023"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showDiscord}
                    onChange={(e) => setForm((f) => ({ ...f, showDiscord: e.target.checked }))}
                    className="accent-[var(--accent-blue)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Show Discord profile</span>
                </label>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Music player (optional)</p>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={form.musicUrl}
                      onChange={(e) => setForm((f) => ({ ...f, musicUrl: e.target.value }))}
                      placeholder="Audio URL (optional)"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                    <input
                      type="text"
                      value={form.trackTitle}
                      onChange={(e) => setForm((f) => ({ ...f, trackTitle: e.target.value }))}
                      placeholder="Track title"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                    <input
                      type="url"
                      value={form.albumArtUrl}
                      onChange={(e) => setForm((f) => ({ ...f, albumArtUrl: e.target.value }))}
                      placeholder="Album art URL (optional)"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-medium text-sm transition"
                  >
                    Use this layout
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(null)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-[var(--text-muted)] hover:bg-white/5 text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
