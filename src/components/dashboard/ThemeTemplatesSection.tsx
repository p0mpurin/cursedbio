'use client'

/**
 * Theme templates - choose a template, fill in your info, apply.
 * Populates the template with user settings (avatar, name, bio, links, etc.)
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProfileInfo } from './ProfileInfoCard'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'

const STORAGE_KEY = 'cursedbio-editor-layout'

export type ThemeTemplateConfig = {
  id: string
  name: string
  description: string
  previewGradient?: string
  template: () => Promise<ResponsivePageLayout>
}

type GhostForm = {
  displayName: string
  bio: string
  avatarUrl: string
  discordUserId: string
  // Buttons
  btn1Label: string
  btn1Href: string
  btn2Label: string
  btn2Href: string
  // Social icons (ic1=Discord, ic2=Twitter, ic3=GitHub, ic4=Twitch, ic5=TikTok)
  discordHref: string
  twitterHref: string
  githubHref: string
  twitchHref: string
  tiktokHref: string
}

function applyGhostForm(layout: ResponsivePageLayout, form: GhostForm): ResponsivePageLayout {
  const applyToVariant = (variant: PageLayout) => ({
    ...variant,
    elements: variant.elements.map((el) => {
      const upd: Record<string, unknown> = { ...(el.props ?? {}) }
      if (el.id === 'avatar' && form.avatarUrl) upd.src = form.avatarUrl
      if (el.id === 'name') upd.content = form.displayName
      if (el.id === 'bio') upd.content = form.bio
      if (el.id === 'spotify') upd.userId = form.discordUserId || (upd.userId as string)
      if (el.id === 'btn1') {
        upd.label = form.btn1Label
        upd.href = form.btn1Href
      }
      if (el.id === 'btn2') {
        upd.label = form.btn2Label
        upd.href = form.btn2Href
      }
      if (el.id === 'ic1') upd.href = form.discordHref
      if (el.id === 'ic2') upd.href = form.twitterHref
      if (el.id === 'ic3') upd.href = form.githubHref
      if (el.id === 'ic4') upd.href = form.twitchHref
      if (el.id === 'ic5') upd.href = form.tiktokHref
      return { ...el, props: upd }
    }),
  })

  return {
    ...layout,
    desktop: applyToVariant(layout.desktop),
    mobile: applyToVariant(layout.mobile),
  }
}

const THEME_TEMPLATES: ThemeTemplateConfig[] = [
  {
    id: 'ghost',
    name: 'ghost.exe',
    description: 'Purple glassmorphism card with orbs, glitch name, Discord profile, Spotify, and social links.',
    previewGradient: 'linear-gradient(135deg, #050308 0%, #1a0a2e 40%, #0f0a1a 100%)',
    template: () => import('@/lib/editor/templates/ghost-responsive.json').then((m) => m.default as ResponsivePageLayout),
  },
]

export default function ThemeTemplatesSection({
  defaultUsername = '',
  defaultDisplayName = '',
}: {
  defaultUsername?: string
  defaultDisplayName?: string
} = {}) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const profile = getProfileInfo()

  const [form, setForm] = useState<GhostForm>({
    displayName: profile.displayName || defaultDisplayName || '',
    bio: profile.bio || profile.tagline || '19 · dev · pvper · he/him',
    avatarUrl: '',
    discordUserId: '',
    btn1Label: 'my projects',
    btn1Href: '#',
    btn2Label: 'hire me',
    btn2Href: '#',
    discordHref: '#',
    twitterHref: '#',
    githubHref: '#',
    twitchHref: '#',
    tiktokHref: '#',
  })

  const handleUse = async (config: ThemeTemplateConfig) => {
    setExpandedId(config.id)
    if (config.id === 'ghost') {
      setForm((f) => ({
        ...f,
        displayName: profile.displayName || defaultDisplayName || f.displayName || defaultUsername,
        bio: profile.bio || profile.tagline || f.bio,
      }))
    }
  }

  const handleSubmit = async (config: ThemeTemplateConfig) => {
    const template = await config.template()
    let layout: ResponsivePageLayout
    if (config.id === 'ghost') {
      layout = applyGhostForm(template, form)
    } else {
      layout = template
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    router.push('/editor?from=template')
  }

  return (
    <section className="mb-12 p-6 rounded-2xl bg-[var(--bg-secondary)]/80 border border-white/10">
      <h2 className="text-lg font-semibold text-[var(--accent-blue-soft)] mb-2">
        Theme templates
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Pick a theme, fill in your info, and open the editor. Your avatar, name, links, and more get applied automatically.
      </p>
      <div className="space-y-4">
        {THEME_TEMPLATES.map((config) => (
          <div
            key={config.id}
            className="rounded-xl bg-black/30 border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg shrink-0"
                  style={{
                    background: config.previewGradient || 'linear-gradient(180deg, #1a0a2e 0%, #0f3460 100%)',
                  }}
                />
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{config.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{config.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleUse(config)}
                className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/80 hover:bg-[var(--accent-blue)] text-white text-sm font-medium transition"
              >
                Use & customize
              </button>
            </div>
            {expandedId === config.id && config.id === 'ghost' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit(config)
                }}
                className="p-4 pt-0 border-t border-white/10 space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Display name</label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="yourname"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Bio</label>
                    <input
                      type="text"
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      placeholder="19 · dev · pvper · he/him"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                  </div>
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
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Leave empty to keep default. Connect Discord to use your Discord avatar.</p>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Discord user ID (for Spotify / Lanyard)</label>
                  <input
                    type="text"
                    value={form.discordUserId}
                    onChange={(e) => setForm((f) => ({ ...f, discordUserId: e.target.value }))}
                    placeholder="e.g. 94490510688792576"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-white/30 focus:outline-none focus:border-[var(--accent-blue)]/50 font-mono"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Required for Spotify now-playing. User must be in <a href="https://discord.gg/lanyard" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue-soft)] underline">Lanyard server</a>.</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Links</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">Projects button</label>
                      <input
                        type="text"
                        value={form.btn1Label}
                        onChange={(e) => setForm((f) => ({ ...f, btn1Label: e.target.value }))}
                        placeholder="Label"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm mb-1"
                      />
                      <input
                        type="url"
                        value={form.btn1Href}
                        onChange={(e) => setForm((f) => ({ ...f, btn1Href: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">Hire button</label>
                      <input
                        type="text"
                        value={form.btn2Label}
                        onChange={(e) => setForm((f) => ({ ...f, btn2Label: e.target.value }))}
                        placeholder="Label"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm mb-1"
                      />
                      <input
                        type="url"
                        value={form.btn2Href}
                        onChange={(e) => setForm((f) => ({ ...f, btn2Href: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Social icons</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">Discord</label>
                      <input
                        type="url"
                        value={form.discordHref}
                        onChange={(e) => setForm((f) => ({ ...f, discordHref: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">Twitter / X</label>
                      <input
                        type="url"
                        value={form.twitterHref}
                        onChange={(e) => setForm((f) => ({ ...f, twitterHref: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">GitHub</label>
                      <input
                        type="url"
                        value={form.githubHref}
                        onChange={(e) => setForm((f) => ({ ...f, githubHref: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">Twitch</label>
                      <input
                        type="url"
                        value={form.twitchHref}
                        onChange={(e) => setForm((f) => ({ ...f, twitchHref: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--text-muted)] mb-1">TikTok</label>
                      <input
                        type="url"
                        value={form.tiktokHref}
                        onChange={(e) => setForm((f) => ({ ...f, tiktokHref: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-white font-medium text-sm transition"
                  >
                    Apply & open editor
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
