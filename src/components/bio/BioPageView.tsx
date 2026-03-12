'use client'

/**
 * BioPageView - Full-viewport bio display. Adapts to viewer (desktop vs phone).
 * Supports click-to-enter for audio autoplay (browsers require user gesture for unmuted audio).
 */
import { useRef, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import BioCanvas from '@/components/editor/BioCanvas'
import { getLayoutForViewport } from '@/lib/responsive-layout'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'

function hasAutoplayAudio(layout: PageLayout) {
  return layout.elements.some((el) => el.type === 'audio' && el.props?.autoplay)
}

export default function BioPageView({
  username,
  layout,
  customCss,
  customJs,
}: {
  username: string
  layout: PageLayout | ResponsivePageLayout
  customCss: string | null
  customJs: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [entered, setEntered] = useState(false)
  const [activeLayout, setActiveLayout] = useState<PageLayout>(() =>
    getLayoutForViewport(layout, typeof window !== 'undefined' ? window.innerWidth : 768)
  )

  useEffect(() => {
    const updateLayoutAndScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const resolved = getLayoutForViewport(layout, vw)
      setActiveLayout(resolved)
      if (!containerRef.current) return
      const cw = resolved.canvas.width
      const ch = resolved.canvas.height
      const s = Math.min(vw / cw, vh / ch)
      setScale(s)
    }
    updateLayoutAndScale()
    window.addEventListener('resize', updateLayoutAndScale)
    return () => window.removeEventListener('resize', updateLayoutAndScale)
  }, [layout])

  const useClickToEnter = activeLayout.canvas.clickToEnter ?? hasAutoplayAudio(activeLayout)
  const cursorUrl = activeLayout.canvas.customCursor
  const cursorX = activeLayout.canvas.customCursorHotspotX ?? 0
  const cursorY = activeLayout.canvas.customCursorHotspotY ?? 0
  const cursorCss = cursorUrl
    ? `.bio-page-view, .bio-page-view * { cursor: url('${cursorUrl}') ${cursorX} ${cursorY}, auto; } .bio-page-view a, .bio-page-view button, .bio-page-view [role="button"] { cursor: url('${cursorUrl}') ${cursorX} ${cursorY}, pointer; }`
    : null

  const cw = activeLayout.canvas.width
  const ch = activeLayout.canvas.height
  const canvas = activeLayout.canvas
  const isImageBg = canvas.backgroundType === 'image' && canvas.backgroundImage
  const pageBgStyle: CSSProperties = isImageBg
    ? {
        width: '100%',
        height: '100%',
        minWidth: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        backgroundImage: `url(${canvas.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: canvas.backgroundImagePosition || 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: canvas.backgroundColor || '#0a0908',
      }
    : { backgroundColor: 'var(--bg-primary)' }

  const bioContent = (
    <div
      ref={containerRef}
      className="bio-page-root fixed inset-0 w-screen h-screen flex items-center justify-center overflow-auto"
      style={pageBgStyle}
    >
      {/* Outer: scaled size for centering. Inner: zoom (not transform) so backdrop-filter works in Chrome */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ width: cw * scale, height: ch * scale }}
      >
        <div style={{ width: cw, height: ch, zoom: scale }}>
          <BioCanvas layout={activeLayout} isEditMode={false} />
        </div>
      </div>
    </div>
  )

  if (useClickToEnter && !entered) {
    const enterBg = activeLayout.canvas.enterScreenBg ?? 'transparent'
    const enterBlur = activeLayout.canvas.enterScreenBlur ?? 12
    const enterTitle = activeLayout.canvas.enterScreenTitle ?? 'ENTER'
    const enterSubtitle = activeLayout.canvas.enterScreenSubtitle ?? 'Click to continue'
    return (
      <div className="bio-page-view fixed inset-0">
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        {cursorCss && <style dangerouslySetInnerHTML={{ __html: cursorCss }} />}
        {bioContent}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('cursedbio-enter'))
            document.querySelectorAll<HTMLAudioElement>('audio[data-autoplay="1"]').forEach((a) => {
              a.play().catch(() => {})
            })
            setEntered(true)
          }}
          className="fixed inset-0 w-screen h-screen flex items-center justify-center cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-[var(--messmer-copper)] z-10"
          style={{
            font: 'inherit',
            background: enterBg,
            backdropFilter: enterBlur ? `blur(${enterBlur}px)` : undefined,
            WebkitBackdropFilter: enterBlur ? `blur(${enterBlur}px)` : undefined,
          }}
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="text-2xl font-serif text-[var(--messmer-copper)] tracking-wider">{enterTitle}</span>
            <span className="text-sm text-[var(--text-muted)]">{enterSubtitle}</span>
          </div>
        </button>
        {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
      </div>
    )
  }

  return (
    <div className="bio-page-view fixed inset-0">
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      {cursorCss && <style dangerouslySetInnerHTML={{ __html: cursorCss }} />}
      {bioContent}
      {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
    </div>
  )
}
