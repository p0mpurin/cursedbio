'use client'

/**
 * PageSettingsPanel - Right-side panel for page-level settings
 * Controls canvas size, background, custom CSS, and editable page source (layout JSON)
 */
import { useEffect, useRef, useState } from 'react'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'
import { isResponsiveLayout } from '@/lib/responsive-layout'

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
            {children}
        </label>
    )
}

function Row({ children }: { children: React.ReactNode }) {
    return <div className="mb-3">{children}</div>
}

function Inp({
    value,
    onChange,
    type = 'text',
    placeholder,
}: {
    value: string | number
    onChange: (v: string) => void
    type?: string
    placeholder?: string
}) {
    return (
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
        />
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--messmer-copper)]/70 font-semibold">
                    {title}
                </span>
                <div className="h-px flex-1 bg-white/10" />
            </div>
            {children}
        </div>
    )
}

function useUpload(accept: string) {
    const ref = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>, onUpload: (url: string) => void) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLoading(true)
        e.target.value = ''
        try {
            const form = new FormData()
            form.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: form })
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload failed')
            const data = await res.json()
            if (data.url) onUpload(data.url)
        } finally {
            setLoading(false)
        }
    }
    return { ref, loading, handleChange }
}

function BackgroundImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const { ref, loading, handleChange } = useUpload('image/*')
    return (
        <>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleChange(e, onUpload)} />
            <button type="button" disabled={loading} onClick={() => ref.current?.click()} className="shrink-0 px-3 py-1.5 rounded text-xs bg-[var(--messmer-copper)]/20 hover:bg-[var(--messmer-copper)]/30 border border-[var(--messmer-copper)]/40 transition disabled:opacity-50">
                {loading ? '…' : 'Upload'}
            </button>
        </>
    )
}

function BackgroundVideoUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const { ref, loading, handleChange } = useUpload('video/*')
    return (
        <>
            <input ref={ref} type="file" accept="video/*" className="hidden" onChange={(e) => handleChange(e, onUpload)} />
            <button type="button" disabled={loading} onClick={() => ref.current?.click()} className="shrink-0 px-3 py-1.5 rounded text-xs bg-[var(--messmer-copper)]/20 hover:bg-[var(--messmer-copper)]/30 border border-[var(--messmer-copper)]/40 transition disabled:opacity-50">
                {loading ? '…' : 'Upload'}
            </button>
        </>
    )
}

function CursorUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const { ref, loading, handleChange } = useUpload('.cur,.png,.svg,image/png,image/svg+xml')
    return (
        <>
            <input ref={ref} type="file" accept=".cur,.png,.svg,image/png,image/svg+xml" className="hidden" onChange={(e) => handleChange(e, onUpload)} />
            <button type="button" disabled={loading} onClick={() => ref.current?.click()} className="shrink-0 px-3 py-1.5 rounded text-xs bg-[var(--messmer-copper)]/20 hover:bg-[var(--messmer-copper)]/30 border border-[var(--messmer-copper)]/40 transition disabled:opacity-50">
                {loading ? '…' : 'Upload'}
            </button>
        </>
    )
}

export default function PageSettingsPanel({
    layout,
    onUpdate,
    onUpdateLayout,
}: {
    layout: PageLayout
    onUpdate: (updates: Partial<PageLayout['canvas']>) => void
    onUpdateLayout?: (layout: PageLayout | ResponsivePageLayout) => void
}) {
    const c = layout.canvas
    const [pageSourceJson, setPageSourceJson] = useState(() => JSON.stringify(layout, null, 2))
    const [pageSourceError, setPageSourceError] = useState<string | null>(null)

    useEffect(() => {
        setPageSourceJson(JSON.stringify(layout, null, 2))
    }, [layout])

    const isValidLayout = (p: unknown): p is PageLayout | ResponsivePageLayout => {
        if (!p || typeof p !== 'object') return false
        const any = p as Record<string, unknown>
        if (any.desktop && any.mobile) {
            return typeof (any.desktop as any)?.canvas === 'object' && Array.isArray((any.desktop as any)?.elements) &&
                typeof (any.mobile as any)?.canvas === 'object' && Array.isArray((any.mobile as any)?.elements)
        }
        return typeof any.version === 'number' && typeof any.canvas === 'object' && Array.isArray(any.elements)
    }

    const handlePageSourceChange = (raw: string) => {
        setPageSourceJson(raw)
        setPageSourceError(null)
        try {
            const parsed = JSON.parse(raw)
            if (isValidLayout(parsed)) onUpdateLayout?.(parsed)
            else setPageSourceError('Need version, canvas, elements (or desktop + mobile)')
        } catch {
            // Invalid JSON while typing; only report on blur or apply
        }
    }

    const applyPageSource = () => {
        try {
            const parsed = JSON.parse(pageSourceJson)
            if (isValidLayout(parsed)) {
                onUpdateLayout?.(parsed)
                setPageSourceError(null)
            } else {
                setPageSourceError('Need version, canvas, elements (or desktop + mobile)')
            }
        } catch (e) {
            setPageSourceError(e instanceof Error ? e.message : 'Invalid JSON')
        }
    }

    const handlePreset = (w: number, h: number) => {
        onUpdate({ width: w, height: h })
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto p-4 gap-1">
            <Section title="Dimensions">
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <Label>Width</Label>
                        <Inp type="number" value={c.width} onChange={(v) => onUpdate({ width: parseInt(v) || c.width })} />
                    </div>
                    <div>
                        <Label>Height</Label>
                        <Inp type="number" value={c.height} onChange={(v) => onUpdate({ height: parseInt(v) || c.height })} />
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 text-xs">
                    <button onClick={() => handlePreset(1920, 1080)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">Desktop</button>
                    <button onClick={() => handlePreset(1440, 900)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">1440</button>
                    <button onClick={() => handlePreset(768, 1024)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">Tablet</button>
                    <button onClick={() => handlePreset(390, 844)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">Phone</button>
                    <button onClick={() => handlePreset(globalThis.innerWidth ?? 1920, globalThis.innerHeight ?? 1080)} className="px-2 py-1 bg-[var(--messmer-copper)]/20 hover:bg-[var(--messmer-copper)]/30 rounded border border-[var(--messmer-copper)]/40 transition text-[var(--messmer-copper)]">Viewport</button>
                </div>
            </Section>

            <Section title="Background">
                <Row>
                    <Label>Type</Label>
                    <select
                        value={c.backgroundType || 'solid'}
                        onChange={(e) => onUpdate({ backgroundType: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                    >
                        <option value="solid" className="bg-[#1a1714]">Solid</option>
                        <option value="gradient" className="bg-[#1a1714]">Gradient</option>
                        <option value="image" className="bg-[#1a1714]">Image</option>
                        <option value="video" className="bg-[#1a1714]">Video</option>
                    </select>
                </Row>
                <Row>
                    <Label>Background blur (px)</Label>
                    <div className="flex gap-2 items-center">
                        <input type="range" min={0} max={20} step={2} value={c.backgroundBlur ?? 0} onChange={(e) => onUpdate({ backgroundBlur: parseInt(e.target.value, 10) })} className="flex-1 accent-[var(--messmer-copper)]" />
                        <span className="text-xs text-[var(--text-muted)] w-8">{c.backgroundBlur ?? 0}</span>
                    </div>
                </Row>

                {(!c.backgroundType || c.backgroundType === 'solid') && (
                    <Row>
                        <Label>Color</Label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={c.backgroundColor || '#0a0908'}
                                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <Inp value={c.backgroundColor || '#0a0908'} onChange={(v) => onUpdate({ backgroundColor: v })} />
                        </div>
                    </Row>
                )}

                {c.backgroundType === 'gradient' && (
                    <Row>
                        <Label>Gradient</Label>
                        <textarea
                            value={c.backgroundGradient || 'radial-gradient(ellipse at 50% 50%, #201313, #0a0908)'}
                            onChange={(e) => onUpdate({ backgroundGradient: e.target.value })}
                            rows={3}
                            placeholder="linear-gradient(...)"
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] font-mono resize-none focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                        />
                    </Row>
                )}

                {c.backgroundType === 'image' && (
                    <>
                        <Row>
                            <Label>Image URL</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 min-w-0">
                                    <Inp value={c.backgroundImage || ''} onChange={(v) => onUpdate({ backgroundImage: v })} placeholder="Link or upload" />
                                </div>
                                <BackgroundImageUpload onUpload={(url) => onUpdate({ backgroundImage: url })} />
                            </div>
                        </Row>
                        <Row>
                            <Label>Size</Label>
                            <select
                                value={c.backgroundImageSize || 'cover'}
                                onChange={(e) => onUpdate({ backgroundImageSize: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                            >
                                <option value="cover" className="bg-[#1a1714]">Cover</option>
                                <option value="contain" className="bg-[#1a1714]">Contain</option>
                                <option value="fill" className="bg-[#1a1714]">Fill</option>
                            </select>
                        </Row>
                        <Row>
                            <Label>Position</Label>
                            <Inp
                                value={c.backgroundImagePosition || 'center'}
                                onChange={(v) => onUpdate({ backgroundImagePosition: v })}
                                placeholder="center, top, bottom, 50% 30%..."
                            />
                        </Row>
                    </>
                )}

                {c.backgroundType === 'video' && (
                    <>
                        <Row>
                            <Label>Video URL</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 min-w-0">
                                    <Inp value={c.backgroundVideo || ''} onChange={(v) => onUpdate({ backgroundVideo: v })} placeholder="Link or upload" />
                                </div>
                                <BackgroundVideoUpload onUpload={(url) => onUpdate({ backgroundVideo: url })} />
                            </div>
                        </Row>
                        <Row>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={c.backgroundVideoMuted !== false}
                                    onChange={(e) => onUpdate({ backgroundVideoMuted: e.target.checked })}
                                    className="accent-[var(--messmer-copper)]"
                                />
                                <span className="text-sm text-[var(--messmer-ivory)]">Muted (required for autoplay)</span>
                            </label>
                        </Row>
                    </>
                )}
            </Section>

            <Section title="Audio & Entry">
                <Row>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={c.clickToEnter ?? false}
                            onChange={(e) => {
                                const enabled = e.target.checked
                                onUpdate({
                                    clickToEnter: enabled,
                                    ...(enabled && (c.enterScreenBlur ?? 0) === 0 ? { enterScreenBlur: 12 } : {}),
                                })
                            }}
                            className="accent-[var(--messmer-copper)]"
                        />
                        <span className="text-sm text-[var(--messmer-ivory)]">Click to enter</span>
                    </label>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Shows an enter screen first so autoplay audio can play unmuted
                    </p>
                </Row>
                {(c.clickToEnter ?? false) && (
                    <>
                        <Row>
                            <Label>Enter screen title</Label>
                            <Inp value={c.enterScreenTitle ?? 'ENTER'} onChange={(v) => onUpdate({ enterScreenTitle: v })} placeholder="ENTER" />
                        </Row>
                        <Row>
                            <Label>Enter screen subtitle</Label>
                            <Inp value={c.enterScreenSubtitle ?? 'Click to continue'} onChange={(v) => onUpdate({ enterScreenSubtitle: v })} placeholder="Click to continue" />
                        </Row>
                        <Row>
                            <Label>Enter screen background</Label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={c.enterScreenBg && c.enterScreenBg !== 'transparent' ? c.enterScreenBg : '#0a0908'}
                                    onChange={(e) => onUpdate({ enterScreenBg: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                                />
                                <Inp value={c.enterScreenBg ?? ''} onChange={(v) => onUpdate({ enterScreenBg: v || undefined })} placeholder="transparent or #hex" />
                            </div>
                        </Row>
                        <Row>
                            <Label>Enter screen blur (px)</Label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="range"
                                    min={0}
                                    max={24}
                                    step={2}
                                    value={c.enterScreenBlur ?? 0}
                                    onChange={(e) => onUpdate({ enterScreenBlur: parseInt(e.target.value, 10) })}
                                    className="flex-1 accent-[var(--messmer-copper)]"
                                />
                                <span className="text-xs text-[var(--text-muted)] w-8">{c.enterScreenBlur ?? 0}</span>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Blur the bio behind the overlay so it stays visible</p>
                        </Row>
                    </>
                )}
            </Section>

            <Section title="Custom cursor">
                <p className="text-[10px] text-[var(--text-muted)] mb-2">
                    Upload a cursor (.cur, .png, .svg) to show on your bio when visitors view it.
                </p>
                <Row>
                    <Label>Cursor URL</Label>
                    <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                            <Inp
                                value={c.customCursor || ''}
                                onChange={(v) => onUpdate({ customCursor: v || undefined })}
                                placeholder="/uploads/your-cursor.png"
                            />
                        </div>
                        <CursorUpload onUpload={(url) => onUpdate({ customCursor: url })} />
                        {c.customCursor && (
                            <button
                                type="button"
                                onClick={() => onUpdate({ customCursor: undefined, customCursorHotspotX: undefined, customCursorHotspotY: undefined })}
                                className="shrink-0 px-2 py-1.5 rounded text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </Row>
                {c.customCursor && (
                    <>
                        <Row>
                            <Label>Hotspot X (for PNG/SVG; 0 = left)</Label>
                            <Inp type="number" value={c.customCursorHotspotX ?? 0} onChange={(v) => onUpdate({ customCursorHotspotX: parseInt(v, 10) || 0 })} />
                        </Row>
                        <Row>
                            <Label>Hotspot Y (for PNG/SVG; 0 = top)</Label>
                            <Inp type="number" value={c.customCursorHotspotY ?? 0} onChange={(v) => onUpdate({ customCursorHotspotY: parseInt(v, 10) || 0 })} />
                        </Row>
                    </>
                )}
            </Section>

            <Section title="Advanced — Page source">
                <Row>
                    <Label>Layout & elements (JSON)</Label>
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">
                        All canvas and element data. Edit or add elements here; click Apply to update the editor.
                    </p>
                    <textarea
                        value={pageSourceJson}
                        onChange={(e) => handlePageSourceChange(e.target.value)}
                        onBlur={applyPageSource}
                        rows={14}
                        placeholder='{"version":2,"canvas":{...},"elements":[...]}'
                        className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-[var(--messmer-ivory)] font-mono resize-y focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                    />
                    {pageSourceError && <p className="text-[10px] text-red-400 mt-1">{pageSourceError}</p>}
                    <button type="button" onClick={applyPageSource} className="mt-1 px-3 py-1.5 rounded text-xs bg-[var(--messmer-copper)]/20 hover:bg-[var(--messmer-copper)]/30 border border-[var(--messmer-copper)]/40 transition">
                        Apply
                    </button>
                </Row>
                <Row>
                    <Label>Page CSS</Label>
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">
                        Applied to the bio page and editor preview.
                    </p>
                    <textarea
                        value={c.customCss || ''}
                        onChange={(e) => onUpdate({ customCss: e.target.value })}
                        rows={6}
                        placeholder={'/* Page-level CSS */\n.bio-canvas { }'}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-[var(--messmer-ivory)] font-mono resize-y focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                    />
                </Row>
            </Section>
        </div>
    )
}
