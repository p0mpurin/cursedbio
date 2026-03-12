'use client'

/**
 * Full-screen Editor Overhaul
 * 3-panel layout: Sidebar (Elements/Hierarchy) | Canvas | Properties/PageSettings
 */
import { useCallback, useEffect, useState, useRef } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import BioCanvas from '@/components/editor/BioCanvas'
import EditorSidebar from '@/components/editor/EditorSidebar'
import PropertiesPanel from '@/components/editor/PropertiesPanel'
import PageSettingsPanel from '@/components/editor/PageSettingsPanel'
import { getEditableLayout, isResponsiveLayout, updateLayoutWithCascade } from '@/lib/responsive-layout'
import { getTemplate } from '@/lib/editor/templates'
import type { PageElement, PageLayout, ResponsivePageLayout } from '@/lib/db'

/** Default: desktop-sized canvas with a single container. Users add elements inside it. */
const DEFAULT_DESKTOP_LAYOUT: PageLayout = {
  version: 2,
  canvas: {
    width: 1920,
    height: 1080,
    backgroundType: 'solid',
    backgroundColor: '#000000',
  },
  elements: [
    {
      id: 'main',
      type: 'div',
      name: 'Content',
      x: 640, y: 354, width: 640, height: 372, zIndex: 1,
      props: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
      },
    },
  ],
}

const DEFAULT_MOBILE_LAYOUT: PageLayout = {
  version: 2,
  canvas: {
    width: 390,
    height: 844,
    backgroundType: 'solid',
    backgroundColor: '#000000',
  },
  elements: [
    {
      id: 'main',
      type: 'div',
      name: 'Content',
      x: 24, y: 80, width: 342, height: 684, zIndex: 1,
      props: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
      },
    },
  ],
}

function getDefaultLayout(): ResponsivePageLayout {
  return {
    version: 3,
    breakpoint: 768,
    desktop: DEFAULT_DESKTOP_LAYOUT,
    mobile: DEFAULT_MOBILE_LAYOUT,
  }
}

export default function EditorPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  const getInitialLayout = useCallback((): PageLayout | ResponsivePageLayout => {
    if (typeof window !== 'undefined') {
      // ?template= takes priority for TemplateGallery links
      const params = new URLSearchParams(window.location.search)
      const templateId = params.get('template')
      if (templateId) {
        const t = getTemplate(templateId)
        if (t) return t
      }
      const raw = localStorage.getItem('cursedbio-editor-layout')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PageLayout | ResponsivePageLayout
          if (parsed && (('desktop' in parsed && 'mobile' in parsed) || (parsed.canvas && Array.isArray(parsed.elements)))) {
            return parsed
          }
        } catch {}
      }
    }
    return getDefaultLayout()
  }, [])

  const [layout, setLayout] = useState<PageLayout | ResponsivePageLayout>(getInitialLayout)
  const [layoutLoaded, setLayoutLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeVariant, setActiveVariant] = useState<'desktop' | 'mobile'>('desktop')

  // Load saved layout from API (persists across dev restarts)
  useEffect(() => {
    if (!isLoaded) return
    let cancelled = false
    fetch('/api/pages')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const saved = d?.page?.layout
        if (saved && (('desktop' in saved && 'mobile' in saved) || (saved.canvas && Array.isArray(saved.elements)))) {
          setLayout(saved as PageLayout | ResponsivePageLayout)
        }
      })
      .catch(() => {})
      .finally(() => setLayoutLoaded(true))
    return () => { cancelled = true }
  }, [isLoaded])

  const effectiveLayout = getEditableLayout(layout, activeVariant)

  const setEffectiveLayout = useCallback((updated: PageLayout | ((prev: PageLayout) => PageLayout)) => {
    setLayout((prev) => {
      const next = typeof updated === 'function' ? updated(getEditableLayout(prev, activeVariant)) : updated
      if (!isResponsiveLayout(prev)) return next
      // Cascade: when editing desktop, sync scaled changes to mobile so you don't have to repeat
      return updateLayoutWithCascade(prev, activeVariant, next)
    })
  }, [activeVariant])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const copiedElement = useRef<PageElement | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const panContainerRef = useRef<HTMLDivElement>(null)
  const panStart = useRef({ x: 0, y: 0 })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<'properties' | 'page'>('page')

  // Auth check overlay while preserving editor for dev
  const [isDevAuthMode, setIsDevAuthMode] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) return
    let cancelled = false
    fetch('/api/dev-auth/check')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d?.devAuth) setIsDevAuthMode(true)
        else router.push('/')
      })
      .catch(() => { if (!cancelled) router.push('/') })
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, router])

  // Auto-switch right panel based on selection
  useEffect(() => {
    if (selectedId) setRightTab('properties')
    else setRightTab('page')
  }, [selectedId])

  // Callbacks (use setEffectiveLayout to edit the active variant)
  const handleAddElement = useCallback((el: PageElement) => {
    setEffectiveLayout((prev) => ({ ...prev, elements: [...prev.elements, el] }))
    setSelectedId(el.id)
  }, [setEffectiveLayout])

  const handleUpdateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    setEffectiveLayout((prev) => ({
      ...prev,
      elements: prev.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }, [setEffectiveLayout])

  const handleDeleteElement = useCallback((id: string) => {
    setEffectiveLayout((prev) => ({
      ...prev,
      elements: prev.elements.filter((e) => e.id !== id),
    }))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId, setEffectiveLayout])

  const handleDuplicateElement = useCallback((id: string) => {
    setEffectiveLayout((prev) => {
      const source = prev.elements.find((e) => e.id === id)
      if (!source) return prev
      const newId = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const maxZ = prev.elements.reduce((max, el) => Math.max(max, el.zIndex), 0)
      const copy: PageElement = {
        ...source,
        id: newId,
        x: source.x + 20,
        y: source.y + 20,
        zIndex: maxZ + 1,
        props: JSON.parse(JSON.stringify(source.props))
      }
      setSelectedId(newId)
      return { ...prev, elements: [...prev.elements, copy] }
    })
  }, [setEffectiveLayout])

  const handleUpdateCanvas = useCallback((updates: Partial<PageLayout['canvas']>) => {
    setEffectiveLayout((prev) => ({ ...prev, canvas: { ...prev.canvas, ...updates } }))
  }, [setEffectiveLayout])

  const handleFitZoom = useCallback(() => {
    if (!mainRef.current) return
    const rect = mainRef.current.getBoundingClientRect()
    const cw = effectiveLayout.canvas.width
    const ch = effectiveLayout.canvas.height
    const pad = 24
    const scale = Math.min((rect.width - pad) / cw, (rect.height - pad) / ch, 3)
    setZoom(Math.max(0.1, scale))
    setPan({ x: 0, y: 0 })
  }, [effectiveLayout.canvas.width, effectiveLayout.canvas.height])

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => { if (mainRef.current) handleFitZoom() })
    })
    return () => cancelAnimationFrame(timer)
  }, [effectiveLayout.canvas.width, effectiveLayout.canvas.height, handleFitZoom])

  const handleMiddleDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
      panContainerRef.current?.setPointerCapture(e.pointerId)
    }
  }, [pan])

  const handleMiddleMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })
    }
  }, [isPanning])

  const handleMiddleUp = useCallback((e: React.PointerEvent) => {
    if (e.button === 1) {
      setIsPanning(false)
      panContainerRef.current?.releasePointerCapture(e.pointerId)
    }
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? res.statusText)
      }
      window.dispatchEvent(new CustomEvent('cursedbio-toast', { detail: { message: 'Saved!' } }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      setError(msg)
      window.dispatchEvent(new CustomEvent('cursedbio-toast', { detail: { message: msg } }))
    } finally {
      setTimeout(() => setSaving(false), 800) // fake delay for UI feedback
    }
  }, [layout])

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-[var(--messmer-ivory)] bg-[var(--bg-primary)]">Loading editor...</div>

  const selectedElement = effectiveLayout.elements.find((e) => e.id === selectedId) || null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Toolbar */}
      <header className="h-14 shrink-0 border-b border-white/5 bg-[var(--bg-secondary)] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-xl font-bold font-serif text-[var(--messmer-copper)] hover:text-white transition">CB</button>
          {/* Viewport toggle – edit desktop or phone variant */}
          {isResponsiveLayout(layout) && (
            <div className="flex items-center rounded border border-white/10 overflow-hidden">
              <button
                onClick={() => setActiveVariant('desktop')}
                className={`px-3 py-1.5 text-xs font-medium ${activeVariant === 'desktop' ? 'bg-[var(--messmer-copper)] text-white' : 'bg-black/20 text-[var(--text-muted)] hover:bg-white/5'}`}
              >
                Desktop
              </button>
              <button
                onClick={() => setActiveVariant('mobile')}
                className={`px-3 py-1.5 text-xs font-medium ${activeVariant === 'mobile' ? 'bg-[var(--messmer-copper)] text-white' : 'bg-black/20 text-[var(--text-muted)] hover:bg-white/5'}`}
              >
                Phone
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Zoom and pan */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/20 rounded border border-white/5">
              <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="px-2 py-1 hover:text-white hover:bg-white/5">-</button>
              <span className="text-xs px-2 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="px-2 py-1 hover:text-white hover:bg-white/5">+</button>
              <button onClick={handleFitZoom} className="px-2 py-1 text-xs border-l border-white/5 hover:text-white hover:bg-white/5">Fit</button>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">Middle mouse to pan</span>
          </div>

          <div className="flex items-center gap-2">
            {!isDevAuthMode && <UserButton afterSignOutUrl="/" />}
            <button
              onClick={() => {
                const toPreview = isResponsiveLayout(layout) ? getEditableLayout(layout, activeVariant) : layout
                localStorage.setItem('cursedbio-preview-layout', JSON.stringify(toPreview))
                window.open('/preview', '_blank', 'noopener')
              }}
              className="px-4 py-1.5 rounded-md text-sm font-semibold border border-[var(--messmer-copper)]/30 text-[var(--messmer-copper)] hover:bg-[var(--messmer-copper)] hover:text-white transition"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-1.5 rounded-md text-sm font-semibold bg-[var(--messmer-copper)] text-white hover:bg-[var(--messmer-fiery-orange)] disabled:opacity-50 transition shadow-[0_0_15px_rgba(182,110,65,0.2)]"
            >
              {saving ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace (3 columns: Left Panel | Center Canvas | Right Panel) */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <EditorSidebar
          elements={effectiveLayout.elements}
          onAddElement={handleAddElement}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={handleUpdateElement}
        />

        {/* CENTER VIEWPORT - pan + zoom, shows full canvas */}
        <main
          ref={mainRef}
          className="flex-1 overflow-hidden canvas-checkerboard relative flex items-center justify-center"
          onPointerDown={(e) => { if (e.button === 0) setSelectedId(null) }}
        >
          <div
            ref={panContainerRef}
            className={`absolute left-1/2 top-1/2 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
            style={{ transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)` }}
            onPointerDown={handleMiddleDown}
            onPointerMove={handleMiddleMove}
            onPointerUp={handleMiddleUp}
            onPointerLeave={handleMiddleUp}
          >
            <BioCanvas
              layout={effectiveLayout}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateElement={handleUpdateElement}
              scale={zoom}
              showGuides
            />
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="w-80 h-full shrink-0 flex flex-col bg-[var(--bg-secondary)] border-l border-white/5">
          {/* Tabs */}
          <div className="flex border-b border-white/5 p-2 gap-2 shrink-0">
            <button
              onClick={() => setRightTab('properties')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded ${rightTab === 'properties' ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:bg-white/5'}`}
            >
              Properties
            </button>
            <button
              onClick={() => setRightTab('page')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded ${rightTab === 'page' ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:bg-white/5'}`}
            >
              Page
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden editor-panel relative">
            {rightTab === 'properties' ? (
              <PropertiesPanel
                element={selectedElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
                onDuplicate={handleDuplicateElement}
                layout={effectiveLayout}
              />
            ) : (
              <PageSettingsPanel
                layout={effectiveLayout}
                onUpdate={handleUpdateCanvas}
                onUpdateLayout={setLayout}
              />
            )}
          </div>
        </aside>
      </div>

    </div>
  )
}
