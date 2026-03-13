'use client'

/**
 * Preview route - reads layout from localStorage (editor Preview) or fetches from API (dashboard Preview)
 * Renders full-viewport bio without nav.
 */
import { useEffect, useState } from 'react'
import BioPageView from '@/components/bio/BioPageView'
import { isResponsiveLayout } from '@/lib/responsive-layout'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'

function getCustomCss(layout: PageLayout | ResponsivePageLayout): string | null {
  if (isResponsiveLayout(layout)) {
    return layout.desktop.canvas.customCss ?? layout.mobile.canvas.customCss ?? null
  }
  return layout.canvas.customCss ?? null
}

function isValidLayout(data: unknown): data is PageLayout | ResponsivePageLayout {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if ('desktop' in d && 'mobile' in d) {
    return (
      typeof (d.desktop as PageLayout).canvas === 'object' &&
      Array.isArray((d.desktop as PageLayout).elements)
    )
  }
  return typeof (d as PageLayout).canvas === 'object' && Array.isArray((d as PageLayout).elements)
}

export default function PreviewPage() {
  const [layout, setLayout] = useState<PageLayout | ResponsivePageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadLayout = async () => {
      const raw = localStorage.getItem('cursedbio-preview-layout')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PageLayout | ResponsivePageLayout
          if (isValidLayout(parsed)) {
            setLayout(parsed)
            setLoading(false)
            return
          }
        } catch {
          /* invalid JSON */
        }
      }

      try {
        const res = await fetch('/api/pages')
        const data = await res.json()
        if (cancelled) return
        const saved = data?.page?.layout
        if (saved && isValidLayout(saved)) {
          setLayout(saved)
        } else if (res.status === 401) {
          setError('Sign in to preview your saved layout.')
        } else {
          setError('No preview. Open the editor and click Preview, or save a layout first.')
        }
      } catch {
        if (!cancelled) setError('No preview. Open the editor and click Preview.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLayout()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] text-[var(--text-muted)]">
        <div className="w-8 h-8 border-2 border-[var(--messmer-copper)]/40 border-t-[var(--messmer-copper)] rounded-full animate-spin" />
        <p className="text-sm">Loading preview…</p>
      </div>
    )
  }

  if (error || !layout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
        <p className="text-sm text-center px-4">{error ?? 'No preview. Open the editor and click Preview.'}</p>
      </div>
    )
  }

  return (
    <BioPageView
      username="preview"
      layout={layout}
      customCss={getCustomCss(layout)}
      customJs={null}
    />
  )
}
