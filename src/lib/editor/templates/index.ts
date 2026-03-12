import type { PageLayout, ResponsivePageLayout } from '@/lib/db'
import minimal from './minimal-responsive.json'
import y2k from './y2k-responsive.json'
import linkInBio from './link-in-bio-responsive.json'
import musician from './musician-responsive.json'

export type TemplateMeta = {
  id: string
  name: string
  description: string
  layout: ResponsivePageLayout
  previewGradient?: string
  previewEmoji?: string
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean, classic layout with name, tagline, and one link', layout: minimal as ResponsivePageLayout, previewGradient: 'linear-gradient(180deg, #0a0908 0%, #141210 100%)' },
  { id: 'y2k', name: 'Y2K / Vaporwave', description: 'Retro aesthetic with typewriter, glitch effects, and 3D tilt', layout: y2k as ResponsivePageLayout, previewGradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #0f3460 100%)' },
  { id: 'link-in-bio', name: 'Link in Bio', description: 'Hero image, avatar, links grid, and profile views', layout: linkInBio as ResponsivePageLayout, previewGradient: 'linear-gradient(180deg, #1a1512 0%, #0a0908 100%)' },
  { id: 'musician', name: 'Musician', description: 'Artist card with photo, Spotify/Bandcamp, and background audio', layout: musician as ResponsivePageLayout, previewGradient: 'linear-gradient(180deg, #0d0d0d 0%, #1a1512 100%)' },
]

export function getTemplate(id: string): ResponsivePageLayout | null {
  const t = TEMPLATES.find((x) => x.id === id)
  return t ? JSON.parse(JSON.stringify(t.layout)) : null
}
