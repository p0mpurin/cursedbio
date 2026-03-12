'use client'

import Link from 'next/link'
import type { TemplateMeta } from '@/lib/editor/templates'

export default function TemplateGallery({
  templates,
  onApplyTemplate,
}: {
  templates: TemplateMeta[]
  onApplyTemplate?: (template: TemplateMeta) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {templates.map((t) => (
        <div
          key={t.id}
          className="group rounded-lg overflow-hidden border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all duration-200"
        >
          {/* Compact square thumbnail */}
          <div
            className="aspect-square relative max-h-24"
            style={{
              background: t.previewGradient || 'linear-gradient(180deg, #050810 0%, #0c1222 100%)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-70 transition">
              <span className="text-xl font-semibold tracking-tight text-white/70">{t.previewEmoji ?? t.name.charAt(0)}</span>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-[var(--text-primary)] text-sm mb-0.5">{t.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)] mb-2 line-clamp-2">{t.description}</p>
            {onApplyTemplate ? (
              <button
                type="button"
                onClick={() => onApplyTemplate(t)}
                className="w-full py-2 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/15 text-[var(--text-primary)] transition active:scale-[0.98]"
              >
                Use
              </button>
            ) : (
              <Link
                href={`/editor?template=${t.id}`}
                className="block w-full py-2 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/15 text-[var(--text-primary)] transition text-center active:scale-[0.98]"
              >
                Use template
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
