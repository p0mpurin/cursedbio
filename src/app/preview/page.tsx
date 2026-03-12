'use client'

/**
 * Preview route - reads layout from localStorage (set by editor Preview button)
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

export default function PreviewPage() {
  const [layout, setLayout] = useState<PageLayout | ResponsivePageLayout | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('cursedbio-preview-layout')
    if (raw) {
      try {
        setLayout(JSON.parse(raw) as PageLayout | ResponsivePageLayout)
      } catch {
        setLayout(null)
      }
    }
  }, [])

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
        <p className="text-sm">No preview. Open the editor and click Preview.</p>
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
