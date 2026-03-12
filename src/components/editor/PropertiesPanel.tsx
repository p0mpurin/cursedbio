'use client'

/**
 * PropertiesPanel - Right-side panel showing properties for the selected element
 * Adapts controls based on element type
 */
import { useRef, useState } from 'react'
import type { PageElement, PageLayout } from '@/lib/db'

function CollapsibleSection({ title, children, defaultOpen = false, defaultCollapsed }: { title: string; children: React.ReactNode; defaultOpen?: boolean; defaultCollapsed?: boolean }) {
    const [open, setOpen] = useState(defaultCollapsed !== undefined ? !defaultCollapsed : defaultOpen)
    return (
        <div className="mb-5">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 mb-3 text-left"
            >
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--messmer-copper)]/70 font-semibold">
                    {title}
                </span>
                <span className="text-[var(--text-muted)] text-xs">{open ? '−' : '+'}</span>
                <div className="h-px flex-1 bg-white/10" />
            </button>
            {open && children}
        </div>
    )
}

function UrlOrUploadRow({
    label,
    value,
    onChange,
    accept,
    placeholder,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    accept: string
    placeholder?: string
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        e.target.value = ''
        try {
            const form = new FormData()
            form.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: form })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.error || res.statusText)
            }
            const data = await res.json()
            if (data.url) onChange(data.url)
        } catch (err) {
            console.error(err)
        } finally {
            setUploading(false)
        }
    }
    return (
        <Row>
            <Label>{label}</Label>
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleUpload}
                />
                <Inp value={value} onChange={onChange} placeholder={placeholder} className="flex-1 min-w-0" />
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0 px-3 py-1.5 rounded text-xs bg-[var(--messmer-copper)]/20 hover:bg-[var(--messmer-copper)]/30 border border-[var(--messmer-copper)]/40 transition disabled:opacity-50"
                >
                    {uploading ? '…' : 'Upload'}
                </button>
            </div>
        </Row>
    )
}

const GOOGLE_FONTS = [
    // System / normal
    'system-ui', 'Arial', 'Georgia', 'Verdana', 'Times New Roman', 'Trebuchet MS',
    // Popular readable
    'Inter', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Roboto',
    'Nunito', 'Source Sans 3', 'Ubuntu', 'Merriweather', 'DM Sans',
    // Display / personality
    'Outfit', 'Space Grotesk', 'Playfair Display', 'Raleway', 'Josefin Sans',
    'Libre Baskerville', 'Cinzel', 'Dancing Script', 'Bebas Neue',
    'Press Start 2P', 'Courier Prime',
]

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
    min,
    max,
    step,
    placeholder,
    className = '',
}: {
    value: string | number
    onChange: (v: string) => void
    type?: string
    min?: number
    max?: number
    step?: number
    placeholder?: string
    className?: string
}) {
    return (
        <input
            type={type}
            value={value}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition ${className}`}
        />
    )
}

function NumberRow({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
}: {
    label: string
    value: number
    onChange: (v: number) => void
    min?: number
    max?: number
    step?: number
}) {
    return (
        <Row>
            <Label>{label}</Label>
            <Inp
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(v) => onChange(parseFloat(v) || 0)}
            />
        </Row>
    )
}

/** Number input with +/- steppers (replaces spin arrows) */
function StepperField({
    value,
    onChange,
    min,
    max,
    step = 1,
    stepLg,
}: {
    value: number
    onChange: (v: number) => void
    min?: number
    max?: number
    step?: number
    stepLg?: number
}) {
    const clamp = (v: number) => {
        if (min != null && v < min) return min
        if (max != null && v > max) return max
        return v
    }
    const s = stepLg ?? step
    return (
        <div className="flex gap-1">
            <button
                type="button"
                onClick={() => onChange(clamp(value - step))}
                className="w-7 h-8 flex items-center justify-center rounded-l bg-white/5 hover:bg-white/10 border border-r-0 border-white/10 text-[var(--text-muted)] hover:text-white transition text-sm"
            >
                −
            </button>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(clamp(parseFloat(e.target.value) || 0))}
                className="flex-1 min-w-0 h-8 px-2 text-center text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-[var(--messmer-copper)]/60 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
                type="button"
                onClick={() => onChange(clamp(value + step))}
                className="w-7 h-8 flex items-center justify-center rounded-r bg-white/5 hover:bg-white/10 border border-l-0 border-white/10 text-[var(--text-muted)] hover:text-white transition text-sm"
            >
                +
            </button>
        </div>
    )
}

/** Compact number input with +/- steppers for transform values */
function TransformField({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    stepLg = 10,
}: {
    label: string
    value: number
    onChange: (v: number) => void
    min?: number
    max?: number
    step?: number
    stepLg?: number
}) {
    const clamp = (v: number) => {
        if (min != null && v < min) return min
        if (max != null && v > max) return max
        return v
    }
    return (
        <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--text-muted)] w-5 shrink-0">{label}</span>
            <button
                type="button"
                onClick={() => onChange(clamp(value - step))}
                className="w-6 h-7 flex items-center justify-center rounded-l bg-white/5 hover:bg-white/10 border border-r-0 border-white/10 text-[var(--text-muted)] hover:text-white transition text-sm"
            >
                −
            </button>
            <input
                type="number"
                value={Math.round(value)}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(clamp(parseFloat(e.target.value) || 0))}
                className="w-14 h-7 px-1 text-center text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-[var(--messmer-copper)]/60 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
                type="button"
                onClick={() => onChange(clamp(value + step))}
                className="w-6 h-7 flex items-center justify-center rounded-r bg-white/5 hover:bg-white/10 border border-l-0 border-white/10 text-[var(--text-muted)] hover:text-white transition text-sm"
            >
                +
            </button>
        </div>
    )
}

function parseRgba(str: string): { r: number, g: number, b: number, a: number } | null {
    if (!str) return null
    if (str.startsWith('#')) {
        let hex = str.replace('#', '')
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
        if (hex.length === 6) hex += 'ff'
        if (hex.length === 8) {
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: parseInt(hex.slice(6, 8), 16) / 255
            }
        }
    }
    const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1
        }
    }
    return null
}

function rgbaToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function AlphaColorRow({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (v: string) => void
}) {
    const parsed = parseRgba(value || '#ffffff') || { r: 255, g: 255, b: 255, a: 1 }
    const hexColor = rgbaToHex(parsed.r, parsed.g, parsed.b)
    
    return (
        <Row>
            <Label>{label}</Label>
            <div className="flex gap-2 items-center mb-2">
                <input
                    type="color"
                    value={hexColor}
                    onChange={(e) => {
                        const newHex = e.target.value
                        const p = parseRgba(newHex)!
                        onChange(`rgba(${p.r}, ${p.g}, ${p.b}, ${parsed.a})`)
                    }}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <Inp 
                    value={value || ''} 
                    onChange={onChange} 
                    placeholder="#rrggbb or rgba()" 
                    className="flex-1"
                />
            </div>
            <div className="flex gap-2 items-center">
                <span className="text-[10px] text-[var(--text-muted)] w-8">Alpha</span>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={parsed.a}
                    onChange={(e) => {
                        onChange(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${e.target.value})`)
                    }}
                    className="flex-1 accent-[var(--messmer-copper)]"
                />
                <span className="text-[10px] text-[var(--text-muted)] w-8 text-right">
                    {Math.round(parsed.a * 100)}%
                </span>
            </div>
        </Row>
    )
}

function ShadowRow({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (v: string) => void
}) {
    // Basic parser for simple shadows: "0px 0px 40px rgba(0,0,0,0.5)"
    const safeVal = value || '0px 0px 0px rgba(0,0,0,0)'
    
    // Extract color
    const colorMatch = safeVal.match(/rgba?\([^)]+\)|#[0-9a-fA-F]+/i)
    const color = colorMatch ? colorMatch[0] : 'rgba(0,0,0,0.5)'
    
    // Extract numbers (x, y, blur, spread)
    const withoutColor = safeVal.replace(color, '').trim()
    const parts = withoutColor.split(/\s+/).map(p => parseFloat(p) || 0)
    
    const x = parts[0] || 0
    const y = parts[1] || 0
    const blur = parts[2] || 0
    const spread = parts[3] || 0

    const update = (nX: number, nY: number, nB: number, nS: number, nC: string) => {
        onChange(`${nX}px ${nY}px ${nB}px ${nS}px ${nC}`)
    }

    return (
        <Row>
            <div className="mb-2">
                <Label>{label}</Label>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <TransformField label="X" value={x} onChange={(v) => update(v, y, blur, spread, color)} />
                <TransformField label="Y" value={y} onChange={(v) => update(x, v, blur, spread, color)} />
                <TransformField label="Blur" value={blur} min={0} onChange={(v) => update(x, y, Math.max(0, v), spread, color)} />
                <TransformField label="Sprd" value={spread} onChange={(v) => update(x, y, blur, v, color)} />
            </div>
            <AlphaColorRow 
                label="Shadow Color" 
                value={color} 
                onChange={(c) => update(x, y, blur, spread, c)} 
            />
        </Row>
    )
}

function SelectRow({
    label,
    value,
    options,
    onChange,
}: {
    label: string
    value: string
    options: { value: string; label: string }[]
    onChange: (v: string) => void
}) {
    return (
        <Row>
            <Label>{label}</Label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#1a1714]">
                        {o.label}
                    </option>
                ))}
            </select>
        </Row>
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

export default function PropertiesPanel({
    element,
    onUpdate,
    onDelete,
    onDuplicate,
    layout,
}: {
    element: PageElement | null
    onUpdate: (id: string, updates: Partial<PageElement>) => void
    onDelete: (id: string) => void
    onDuplicate: (id: string) => void
    layout?: PageLayout | null
}) {
    if (!element) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3 text-[var(--text-muted)]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M8 12h8M12 8v8" />
                </svg>
                <p className="text-xs leading-relaxed">Select an element on the canvas to edit its properties</p>
            </div>
        )
    }

    const upd = (updates: Partial<PageElement>) => onUpdate(element.id, updates)
    const prop = (key: string, val: unknown) =>
        upd({ props: { ...element.props, [key]: val } })

    return (
        <div className="flex flex-col h-full overflow-y-auto p-4 gap-1">
            {/* Element name */}
            <Row>
                <Label>Name</Label>
                <Inp
                    value={element.name ?? element.type}
                    onChange={(v) => upd({ name: v })}
                />
            </Row>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={() => onDuplicate(element.id)} className="py-1.5 px-2 rounded-md bg-white/5 hover:bg-white/10 text-xs text-[var(--messmer-ivory)] transition border border-white/10">Duplicate</button>
                <button type="button" onClick={() => onDelete(element.id)} className="py-1.5 px-2 rounded-md bg-[var(--messmer-deep-crimson)]/20 hover:bg-[var(--messmer-deep-crimson)]/40 text-xs text-red-400 transition border border-red-900/30">Delete</button>
                <span className="text-[10px] text-[var(--text-muted)] self-center">Ctrl+C / Ctrl+V to copy</span>
            </div>

            {/* Arrange - Parent, z-order, visibility, lock (moved from Graph row buttons) */}
            <Section title="Arrange">
                {element.type !== 'div' && layout?.elements && (() => {
                    const containers = layout.elements.filter((e) => e.type === 'div')
                    if (containers.length > 0) {
                        return (
                            <Row>
                                <Label>Parent</Label>
                                <select
                                    value={element.pinnedTo ?? ''}
                                    onChange={(e) => upd({ pinnedTo: e.target.value || undefined })}
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                                >
                                    <option value="" className="bg-[#1a1714]">Canvas root</option>
                                    {containers.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#1a1714]">
                                            {c.name ?? c.id}
                                        </option>
                                    ))}
                                </select>
                            </Row>
                        )
                    }
                    return null
                })()}
                <Row>
                    <Label>Order</Label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => upd({ zIndex: Math.max(0, ...(layout?.elements?.map((e) => e.zIndex) ?? [0])) + 1 })} className="flex-1 py-1.5 px-2 rounded text-xs bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Bring to front">Front</button>
                        <button type="button" onClick={() => upd({ zIndex: Math.max(0, Math.min(...(layout?.elements?.map((e) => e.zIndex) ?? [0])) - 1) })} className="flex-1 py-1.5 px-2 rounded text-xs bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Send to back">Back</button>
                    </div>
                </Row>
                <Row>
                    <Label>Visibility</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={element.visible !== false} onChange={(e) => upd({ visible: e.target.checked })} className="accent-[var(--messmer-copper)]" />
                        <span className="text-sm text-[var(--messmer-ivory)]">Visible</span>
                    </label>
                </Row>
                <Row>
                    <Label>Lock</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!element.locked} onChange={(e) => upd({ locked: e.target.checked })} className="accent-[var(--messmer-copper)]" />
                        <span className="text-sm text-[var(--messmer-ivory)]">Locked</span>
                    </label>
                </Row>
            </Section>

            {/* Transform - collapsible, start minimized since we mainly use dragging */}
            <CollapsibleSection title="Transform" defaultCollapsed={true}>
                <Row>
                    <Label>Align</Label>
                    <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => upd({ x: (layout?.canvas?.width ?? 390) / 2 - element.width / 2 })} className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Center X">⊡</button>
                        <button type="button" onClick={() => upd({ y: (layout?.canvas?.height ?? 844) / 2 - element.height / 2 })} className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Center Y">⊟</button>
                        <button type="button" onClick={() => upd({ x: 0 })} className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Left">←</button>
                        <button type="button" onClick={() => upd({ x: (layout?.canvas?.width ?? 390) - element.width })} className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Right">→</button>
                        <button type="button" onClick={() => upd({ y: 0 })} className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Top">↑</button>
                        <button type="button" onClick={() => upd({ y: (layout?.canvas?.height ?? 844) - element.height })} className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10" title="Bottom">↓</button>
                    </div>
                </Row>
                <div className="space-y-3">
                    <div>
                        <Label>Position</Label>
                        <div className="flex gap-4 mt-1">
                            <TransformField label="X" value={element.x} onChange={(v) => upd({ x: v })} step={1} stepLg={10} />
                            <TransformField label="Y" value={element.y} onChange={(v) => upd({ y: v })} step={1} stepLg={10} />
                        </div>
                    </div>
                    <div>
                        <Label>Size</Label>
                        <div className="flex gap-4 mt-1">
                            <TransformField label="W" value={element.width} onChange={(v) => upd({ width: Math.max(1, v) })} min={1} step={1} stepLg={10} />
                            <TransformField label="H" value={element.height} onChange={(v) => upd({ height: Math.max(1, v) })} min={1} step={1} stepLg={10} />
                        </div>
                    </div>
                    <div>
                        <Label>Rotation</Label>
                        <div className="flex gap-4 mt-1">
                            <TransformField label="°" value={element.rotation ?? 0} onChange={(v) => upd({ rotation: v })} min={-360} max={360} step={5} stepLg={15} />
                        </div>
                    </div>
                    <div>
                        <Label>Layer</Label>
                        <div className="flex gap-4 mt-1">
                            <TransformField label="Z" value={element.zIndex} onChange={(v) => upd({ zIndex: Math.max(0, Math.round(v)) })} min={0} step={1} />
                        </div>
                    </div>
                </div>
                <Row>
                    <Label>Opacity</Label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={(element.props.opacity as number) ?? 1}
                            onChange={(e) => prop('opacity', parseFloat(e.target.value))}
                            className="flex-1 accent-[var(--messmer-copper)]"
                        />
                        <span className="text-xs text-[var(--text-muted)] w-8 text-right">
                            {Math.round(((element.props.opacity as number) ?? 1) * 100)}%
                        </span>
                    </div>
                </Row>
            </CollapsibleSection>

            {/* Text-specific */}
            {element.type === 'text' && (
                <Section title="Text">
                    <Row>
                        <Label>Content</Label>
                        <textarea
                            value={(element.props.content as string) ?? ''}
                            onChange={(e) => prop('content', e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition resize-none"
                        />
                    </Row>
                    <Row>
                        <Label>Font Family</Label>
                        <select
                            value={(element.props.fontFamily as string) ?? 'Inter'}
                            onChange={(e) => prop('fontFamily', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                        >
                            {GOOGLE_FONTS.map((f) => (
                                <option key={f} value={f} className="bg-[#1a1714]">{f}</option>
                            ))}
                        </select>
                    </Row>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Size (px)</Label>
                            <StepperField value={(element.props.fontSize as number) ?? 16} min={6} max={200} onChange={(v) => prop('fontSize', v)} />
                        </div>
                        <div>
                            <Label>Weight</Label>
                            <select
                                value={(element.props.fontWeight as string) ?? '400'}
                                onChange={(e) => prop('fontWeight', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                            >
                                {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map(w => (
                                    <option key={w} value={w} className="bg-[#1a1714]">{w}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Line Height</Label>
                            <StepperField value={(element.props.lineHeight as number) ?? 1.5} step={0.1} min={0.5} max={5} onChange={(v) => prop('lineHeight', v)} />
                        </div>
                        <div>
                            <Label>Letter Spacing</Label>
                            <StepperField value={(element.props.letterSpacing as number) ?? 0} step={0.5} onChange={(v) => prop('letterSpacing', v)} />
                        </div>
                    </div>
                    <AlphaColorRow
                        label="Color"
                        value={(element.props.color as string) ?? '#E0DAC9'}
                        onChange={(v) => prop('color', v)}
                    />
                    <SelectRow
                        label="Text Align"
                        value={(element.props.textAlign as string) ?? 'left'}
                        options={[
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' },
                            { value: 'right', label: 'Right' },
                            { value: 'justify', label: 'Justify' },
                        ]}
                        onChange={(v) => prop('textAlign', v)}
                    />
                    <ShadowRow
                        label="Text Shadow"
                        value={(element.props.textShadow as string) ?? ''}
                        onChange={(v) => prop('textShadow', v)}
                    />
                    <Row>
                        <Label>Text Stroke</Label>
                        <Inp
                            value={(element.props.webkitTextStroke as string) ?? ''}
                            placeholder="e.g. 1px red"
                            onChange={(v) => prop('webkitTextStroke', v)}
                        />
                    </Row>
                    <SelectRow
                        label="Text Effect"
                        value={(element.props.textEffect as string) ?? 'none'}
                        options={[
                            { value: 'none', label: 'None' },
                            { value: 'typewriter', label: 'Typewriter' },
                            { value: 'fade', label: 'Fade In' },
                            { value: 'glitch', label: 'Glitch' },
                            { value: 'glow', label: 'Glow' },
                            { value: 'glowParticles', label: 'Glow + Particles' },
                        ]}
                        onChange={(v) => prop('textEffect', v)}
                    />
                    {(element.props.textEffect as string) === 'typewriter' && (
                        <>
                            <Row>
                                <Label>Type Speed (ms/char)</Label>
                                <StepperField value={(element.props.typewriterSpeed as number) ?? 80} min={20} max={500} onChange={(v) => prop('typewriterSpeed', v)} />
                            </Row>
                            <Row>
                                <Label>Delete Speed (ms/char)</Label>
                                <StepperField value={(element.props.typewriterDeleteSpeed as number) ?? 50} min={20} max={300} onChange={(v) => prop('typewriterDeleteSpeed', v)} />
                            </Row>
                            <Row>
                                <Label>Pause at end (ms)</Label>
                                <StepperField value={(element.props.typewriterPauseAtEnd as number) ?? 1500} min={0} max={5000} onChange={(v) => prop('typewriterPauseAtEnd', v)} />
                            </Row>
                            <Row>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={(element.props.typewriterLoop as boolean) !== false} onChange={(e) => prop('typewriterLoop', e.target.checked)} className="accent-[var(--messmer-copper)]" />
                                    <span className="text-sm text-[var(--messmer-ivory)]">Loop (write → delete → repeat)</span>
                                </label>
                            </Row>
                        </>
                    )}
                </Section>
            )}

            {/* Image-specific */}
            {element.type === 'image' && (
                <Section title="Image">
                    <UrlOrUploadRow
                        label="Image / GIF URL"
                        value={(element.props.src as string) ?? ''}
                        onChange={(v) => prop('src', v)}
                        accept="image/*"
                        placeholder="Paste link or upload (supports GIFs)"
                    />
                    <SelectRow
                        label="Click Action"
                        value={(element.props.imageClickAction as string) ?? 'none'}
                        options={[
                            { value: 'none', label: 'None' },
                            { value: 'link', label: 'Open Link' },
                            { value: 'copy', label: 'Copy Page URL' },
                        ]}
                        onChange={(v) => prop('imageClickAction', v)}
                    />
                    {(element.props.imageClickAction as string) === 'link' && (
                        <Row>
                            <Label>Link URL</Label>
                            <Inp value={(element.props.href as string) ?? ''} placeholder="https://..." onChange={(v) => prop('href', v)} />
                        </Row>
                    )}
                    <SelectRow
                        label="Object Fit"
                        value={(element.props.objectFit as string) ?? 'cover'}
                        options={[
                            { value: 'cover', label: 'Cover' },
                            { value: 'contain', label: 'Contain' },
                            { value: 'fill', label: 'Fill' },
                            { value: 'none', label: 'None' },
                        ]}
                        onChange={(v) => prop('objectFit', v)}
                    />
                    <Row>
                        <Label>Border Radius</Label>
                        <Inp value={(element.props.borderRadius as string) ?? '0'} placeholder="8px or 50%" onChange={(v) => prop('borderRadius', v)} />
                    </Row>
                    <Row>
                        <Label>Border</Label>
                        <Inp value={(element.props.border as string) ?? ''} placeholder="2px solid rgba(255,255,255,0.2)" onChange={(v) => prop('border', v)} />
                    </Row>
                    <ShadowRow
                        label="Box Shadow"
                        value={(element.props.boxShadow as string) ?? ''}
                        onChange={(v) => prop('boxShadow', v)}
                    />
                    <Section title="Filters">
                        {[
                            { key: 'filterBrightness', label: 'Brightness', min: 0, max: 200, def: 100 },
                            { key: 'filterContrast', label: 'Contrast', min: 0, max: 200, def: 100 },
                            { key: 'filterSaturate', label: 'Saturate', min: 0, max: 200, def: 100 },
                            { key: 'filterBlur', label: 'Blur (px)', min: 0, max: 20, def: 0 },
                        ].map(({ key, label, min, max, def }) => (
                            <Row key={key}>
                                <Label>{label}</Label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="range"
                                        min={min}
                                        max={max}
                                        value={(element.props[key] as number) ?? def}
                                        onChange={(e) => prop(key, parseFloat(e.target.value))}
                                        className="flex-1 accent-[var(--messmer-copper)]"
                                    />
                                    <span className="text-xs text-[var(--text-muted)] w-8 text-right">
                                        {(element.props[key] as number) ?? def}
                                    </span>
                                </div>
                            </Row>
                        ))}
                    </Section>
                </Section>
            )}

            {/* Shape-specific */}
            {element.type === 'shape' && (
                <Section title="Shape">
                    <AlphaColorRow
                        label="Fill Color"
                        value={(element.props.backgroundColor as string) ?? '#B66E41'}
                        onChange={(v) => prop('backgroundColor', v)}
                    />
                    <Row>
                        <Label>Border Radius</Label>
                        <Inp value={(element.props.borderRadius as string) ?? '0'} placeholder="8px or 50%" onChange={(v) => prop('borderRadius', v)} />
                    </Row>
                    <Row>
                        <Label>Border</Label>
                        <Inp value={(element.props.border as string) ?? ''} placeholder="2px solid rgba(255,255,255,0.2)" onChange={(v) => prop('border', v)} />
                    </Row>
                    <ShadowRow
                        label="Box Shadow"
                        value={(element.props.boxShadow as string) ?? ''}
                        onChange={(v) => prop('boxShadow', v)}
                    />
                    <Row>
                        <Label>Background (gradient)</Label>
                        <Inp value={(element.props.background as string) ?? ''} placeholder="linear-gradient(...)" onChange={(v) => prop('background', v)} />
                    </Row>
                </Section>
            )}

            {/* Button-specific */}
            {element.type === 'button' && (
                <Section title="Button">
                    <Row>
                        <Label>Label</Label>
                        <Inp value={(element.props.label as string) ?? 'Click me'} onChange={(v) => prop('label', v)} />
                    </Row>
                    <Row>
                        <Label>Icon URL</Label>
                        <Inp value={(element.props.icon as string) ?? ''} placeholder="https://... icon image" onChange={(v) => prop('icon', v)} />
                    </Row>
                    <Row>
                        <Label>Icon position</Label>
                        <select
                            value={(element.props.iconPosition as string) ?? 'left'}
                            onChange={(e) => prop('iconPosition', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                        >
                            <option value="left" className="bg-[#1a1714]">Left</option>
                            <option value="right" className="bg-[#1a1714]">Right</option>
                            <option value="only" className="bg-[#1a1714]">Icon only (hide label)</option>
                        </select>
                    </Row>
                    <Row>
                        <Label>Icon size (px)</Label>
                        <StepperField value={(element.props.iconSize as number) ?? 24} min={12} max={64} onChange={(v) => prop('iconSize', v)} step={2} />
                    </Row>
                    <Row>
                        <Label>Link URL</Label>
                        <Inp value={(element.props.href as string) ?? ''} placeholder="https://... (leave empty for copy)" onChange={(v) => prop('href', v)} />
                    </Row>
                    <Row>
                        <Label>Copy URL to clipboard</Label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!element.props.copyUrl}
                                onChange={(e) => prop('copyUrl', e.target.checked)}
                                className="accent-[var(--messmer-copper)]"
                            />
                            <span className="text-sm text-[var(--messmer-ivory)]">Copy page URL on click</span>
                        </label>
                    </Row>
                    <AlphaColorRow label="Background" value={(element.props.backgroundColor as string) ?? '#B66E41'} onChange={(v) => prop('backgroundColor', v)} />
                    <AlphaColorRow label="Text Color" value={(element.props.color as string) ?? '#E0DAC9'} onChange={(v) => prop('color', v)} />
                    <Row>
                        <Label>Border Radius</Label>
                        <Inp value={(element.props.borderRadius as string) ?? '8px'} onChange={(v) => prop('borderRadius', v)} />
                    </Row>
                    <Row>
                        <Label>Font Size (px)</Label>
                        <StepperField value={(element.props.fontSize as number) ?? 16} min={8} max={72} onChange={(v) => prop('fontSize', v)} />
                    </Row>
                    <ShadowRow
                        label="Box Shadow"
                        value={(element.props.boxShadow as string) ?? ''}
                        onChange={(v) => prop('boxShadow', v)}
                    />
                </Section>
            )}

            {/* Discord Profile */}
            {element.type === 'discordProfile' && (
                <Section title="Discord Profile">
                    <p className="text-[10px] text-[var(--text-muted)] mb-2">Connect Discord on the dashboard. Status and custom status are read from Discord via Lanyard — join the <a href="https://discord.gg/lanyard" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue-soft)] underline">Lanyard server</a> for live status. Otherwise the fallbacks below are used.</p>
                    <Row>
                        <Label>Status fallback (if Lanyard unavailable)</Label>
                        <select
                            value={(element.props.status as string) ?? 'offline'}
                            onChange={(e) => prop('status', e.target.value)}
                            className="w-full px-2 py-1.5 rounded bg-black/30 border border-white/15 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--messmer-copper)]"
                        >
                            <option value="online">Online</option>
                            <option value="idle">Idle</option>
                            <option value="dnd">Do Not Disturb</option>
                            <option value="offline">Offline</option>
                        </select>
                    </Row>
                    <Row>
                        <Label>Custom status fallback (under username)</Label>
                        <Inp value={(element.props.customStatus as string) ?? ''} placeholder="e.g. Coding • Listening to..." onChange={(v) => prop('customStatus', v)} />
                    </Row>
                    <Row>
                        <Label>Show avatar</Label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={(element.props.showAvatar as boolean) !== false} onChange={(e) => prop('showAvatar', e.target.checked)} className="accent-[var(--messmer-copper)]" />
                            <span className="text-sm text-[var(--messmer-ivory)]">Avatar</span>
                        </label>
                    </Row>
                    <Row>
                        <Label>Show username</Label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={(element.props.showUsername as boolean) !== false} onChange={(e) => prop('showUsername', e.target.checked)} className="accent-[var(--messmer-copper)]" />
                            <span className="text-sm text-[var(--messmer-ivory)]">Username</span>
                        </label>
                    </Row>
                    <Row>
                        <Label>Show badges</Label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={(element.props.showBadges as boolean) !== false} onChange={(e) => prop('showBadges', e.target.checked)} className="accent-[var(--messmer-copper)]" />
                            <span className="text-sm text-[var(--messmer-ivory)]">Badges next to username</span>
                        </label>
                    </Row>
                    <Row>
                        <Label>Avatar size</Label>
                        <StepperField value={(element.props.avatarSize as number) ?? 48} min={24} max={128} onChange={(v) => prop('avatarSize', v)} step={4} />
                    </Row>
                    <Row>
                        <Label>Font size</Label>
                        <StepperField value={(element.props.fontSize as number) ?? 14} min={10} max={32} onChange={(v) => prop('fontSize', v)} />
                    </Row>
                    <AlphaColorRow label="Color" value={(element.props.color as string) ?? '#e5e5e5'} onChange={(v) => prop('color', v)} />
                    <AlphaColorRow label="Container background" value={(element.props.containerBackground as string) ?? 'rgba(88,101,242,0.12)'} onChange={(v) => prop('containerBackground', v)} />
                    <Row>
                        <Label>Container border</Label>
                        <Inp value={(element.props.containerBorder as string) ?? '1px solid rgba(88,101,242,0.3)'} placeholder="1px solid rgba(88,101,242,0.3)" onChange={(v) => prop('containerBorder', v)} />
                    </Row>
                    <Row>
                        <Label>Container radius</Label>
                        <Inp value={(element.props.containerRadius as string) ?? '12px'} placeholder="12px" onChange={(v) => prop('containerRadius', v)} />
                    </Row>
                </Section>
            )}

            {/* Profile Views */}
            {element.type === 'profileViews' && (
                <Section title="Profile Views">
                    <Row>
                        <Label>View Count</Label>
                        <StepperField value={(element.props.count as number) ?? 0} min={0} onChange={(v) => prop('count', v)} step={1} stepLg={100} />
                    </Row>
                    <Row>
                        <Label>Show icon</Label>
                        <select
                            value={(element.props.icon as string) ?? 'eye'}
                            onChange={(e) => prop('icon', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60 transition"
                        >
                            <option value="eye" className="bg-[#1a1714]">Eye icon</option>
                            <option value="none" className="bg-[#1a1714]">None</option>
                        </select>
                    </Row>
                    <Row>
                        <Label>Font size</Label>
                        <StepperField value={(element.props.fontSize as number) ?? 14} min={10} max={48} onChange={(v) => prop('fontSize', v)} />
                    </Row>
                    <AlphaColorRow label="Color" value={(element.props.color as string) ?? '#9a958c'} onChange={(v) => prop('color', v)} />
                </Section>
            )}

            {/* Embed / Video */}
            {(element.type === 'embed' || element.type === 'video') && (
                <Section title={element.type === 'video' ? 'Video' : 'Embed'}>
                    {element.type === 'video' ? (
                        <UrlOrUploadRow
                            label="Video URL"
                            value={(element.props.src as string) ?? ''}
                            onChange={(v) => prop('src', v)}
                            accept="video/*"
                            placeholder="Link or upload .mp4"
                        />
                    ) : (
                        <Row>
                            <Label>Embed URL</Label>
                            <Inp
                                value={(element.props.url as string) ?? ''}
                                placeholder="https://youtube.com/embed/..."
                                onChange={(v) => prop('url', v)}
                            />
                        </Row>
                    )}
                    {element.type === 'video' && (
                        <>
                            <Row>
                                <Label>Poster image URL</Label>
                                <Inp value={(element.props.poster as string) ?? ''} placeholder="Image before play" onChange={(v) => prop('poster', v)} />
                            </Row>
                            <Row>
                                <Label>Border radius</Label>
                                <Inp value={(element.props.borderRadius as string) ?? '0'} placeholder="8px or 50%" onChange={(v) => prop('borderRadius', v)} />
                            </Row>
                            <Row>
                                <Label>Show controls</Label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={!!element.props.controls} onChange={(e) => prop('controls', e.target.checked)} className="accent-[var(--messmer-copper)]" />
                                    <span className="text-sm text-[var(--messmer-ivory)]">Show controls</span>
                                </label>
                            </Row>
                        </>
                    )}
                    {element.type === 'embed' && (
                        <Row>
                            <Label>Border radius</Label>
                            <Inp value={(element.props.borderRadius as string) ?? '0'} placeholder="8px" onChange={(v) => prop('borderRadius', v)} />
                        </Row>
                    )}
                </Section>
            )}

            {/* Audio */}
            {element.type === 'audio' && (
                <Section title="Audio">
                    <Row>
                        <Label>Display mode</Label>
                        <select
                            value={(element.props.displayMode as string) ?? 'minimal'}
                            onChange={(e) => prop('displayMode', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)] focus:outline-none focus:border-[var(--messmer-copper)]/60"
                        >
                            <option value="minimal" className="bg-[#1a1714]">Minimal (icon + volume)</option>
                            <option value="musicPlayer" className="bg-[#1a1714]">Music Player (playlist)</option>
                        </select>
                    </Row>
                    {(element.props.displayMode as string) === 'musicPlayer' ? (
                        <>
                            <Row>
                                <Label>Tracks</Label>
                                <p className="text-[10px] text-[var(--text-muted)] mb-2">Add multiple songs. Prev/Next switch tracks; auto-advances when a track ends.</p>
                                {(() => {
                                    const tracks = (element.props.tracks as Array<{ src: string; title?: string; albumArtUrl?: string }>) ?? []
                                    const setTracks = (next: Array<{ src: string; title?: string; albumArtUrl?: string }>) => prop('tracks', next)
                                    const addTrack = () => setTracks([...tracks, { src: '', title: '', albumArtUrl: '' }])
                                    const removeTrack = (i: number) => setTracks(tracks.filter((_, j) => j !== i))
                                    const updateTrack = (i: number, updates: Partial<{ src: string; title?: string; albumArtUrl?: string }>) =>
                                        setTracks(tracks.map((t, j) => (j === i ? { ...t, ...updates } : t)))
                                    return (
                                        <div className="space-y-3">
                                            {tracks.map((t, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-[var(--text-muted)]">Track {i + 1}</span>
                                                        <button type="button" onClick={() => removeTrack(i)} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
                                                    </div>
                                                    <div>
                                                        <Label>Audio URL</Label>
                                                        <div className="flex gap-2">
                                                            <Inp value={t.src} onChange={(v) => updateTrack(i, { src: v })} placeholder="https://..." className="flex-1 min-w-0" />
                                                            <input type="file" accept="audio/*" className="hidden" id={`audio-upload-${element.id}-${i}`} onChange={async (e) => {
                                                                const file = e.target.files?.[0]
                                                                if (!file) return
                                                                e.target.value = ''
                                                                try {
                                                                    const fd = new FormData()
                                                                    fd.append('file', file)
                                                                    const r = await fetch('/api/upload', { method: 'POST', body: fd })
                                                                    const d = await r.json()
                                                                    if (d.url) updateTrack(i, { src: d.url })
                                                                } catch {}
                                                            }} />
                                                            <button type="button" onClick={() => document.getElementById(`audio-upload-${element.id}-${i}`)?.click()} className="shrink-0 px-2 py-1 rounded text-xs bg-[var(--messmer-copper)]/20 border border-[var(--messmer-copper)]/40">Upload</button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Title</Label>
                                                        <Inp value={t.title ?? ''} onChange={(v) => updateTrack(i, { title: v })} placeholder="Track title" />
                                                    </div>
                                                    <div>
                                                        <Label>Album art URL</Label>
                                                        <Inp value={t.albumArtUrl ?? ''} onChange={(v) => updateTrack(i, { albumArtUrl: v })} placeholder="Optional" />
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addTrack} className="w-full py-2 rounded-lg border border-dashed border-white/20 text-[var(--text-muted)] hover:bg-white/5 text-sm">
                                                + Add track
                                            </button>
                                        </div>
                                    )
                                })()}
                            </Row>
                        </>
                    ) : (
                        <UrlOrUploadRow
                            label="Audio URL"
                            value={(element.props.src as string) ?? ''}
                            onChange={(v) => prop('src', v)}
                            accept="audio/*"
                            placeholder="Link or upload .mp3"
                        />
                    )}
                    <Row>
                        <Label>Autoplay</Label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!element.props.autoplay} onChange={(e) => prop('autoplay', e.target.checked)} className="accent-[var(--messmer-copper)]" />
                            <span className="text-sm text-[var(--messmer-ivory)]">Autoplay</span>
                        </label>
                    </Row>
                    <AlphaColorRow label="Icon color" value={(element.props.color as string) ?? '#E0DAC9'} onChange={(v) => prop('color', v)} />
                </Section>
            )}

            {/* Div / Container */}
            {element.type === 'div' && (
                <Section title="Container">
                    <Row>
                        <Label>Preset</Label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    prop('backgroundColor', 'rgba(255,255,255,0.08)')
                                    prop('backdropFilter', 'blur(12px)')
                                    prop('border', '1px solid rgba(255,255,255,0.12)')
                                    prop('borderRadius', '16px')
                                }}
                                className="px-2 py-1.5 rounded text-xs bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10"
                            >
                                Glass
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    prop('backgroundColor', 'rgba(0,0,0,0.4)')
                                    prop('backdropFilter', 'blur(16px) brightness(0.8)')
                                    prop('border', '1px solid rgba(255,255,255,0.08)')
                                    prop('borderRadius', '24px')
                                }}
                                className="px-2 py-1.5 rounded text-xs bg-white/5 hover:bg-[var(--messmer-copper)]/20 border border-white/10"
                            >
                                Frosted
                            </button>
                        </div>
                    </Row>
                    <Row>
                        <p className="text-[10px] text-[var(--text-muted)]">
                            Put container between background and content so blur shows behind it
                        </p>
                    </Row>
                    <Row>
                        <Label>3D Mouse Tilt</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={!!(element.props.mouseTilt as boolean)}
                                onChange={(e) => prop('mouseTilt', e.target.checked)}
                                className="accent-[var(--messmer-copper)]"
                            />
                            <span className="text-sm text-[var(--text-muted)]">React to mouse (view mode)</span>
                        </div>
                    </Row>
                    {(element.props.mouseTilt as boolean) && (
                        <Row>
                            <Label>Tilt Intensity</Label>
                            <StepperField value={(element.props.tiltIntensity as number) ?? 12} min={2} max={30} onChange={(v) => prop('tiltIntensity', v)} />
                        </Row>
                    )}
                    <AlphaColorRow label="Background" value={(element.props.backgroundColor as string) ?? 'rgba(255,255,255,0.05)'} onChange={(v) => prop('backgroundColor', v)} />
                    <Row>
                        <Label>Backdrop Blur</Label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="range"
                                min={0}
                                max={32}
                                step={2}
                                value={parseInt((element.props.backdropFilter as string)?.match(/blur\((\d+)/)?.[1] || '0')}
                                onChange={(e) => {
                                    const blur = `blur(${e.target.value}px)`
                                    const cur = (element.props.backdropFilter as string) || ''
                                    const bright = cur.match(/brightness\([^)]+\)/)?.[0] || ''
                                    const sat = cur.match(/saturate\([^)]+\)/)?.[0] || ''
                                    prop('backdropFilter', e.target.value === '0' ? '' : `${blur} ${bright} ${sat}`.trim())
                                }}
                                className="flex-1 accent-[var(--messmer-copper)]"
                            />
                            <span className="text-xs text-[var(--text-muted)] w-12">
                                {parseInt((element.props.backdropFilter as string)?.match(/\d+/)?.[0] || '0')}px
                            </span>
                        </div>
                    </Row>
                    <Row>
                        <Label>Backdrop Brightness</Label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="range"
                                min={30}
                                max={150}
                                step={5}
                                value={parseInt((element.props.backdropFilter as string)?.match(/brightness\((\d+)/)?.[1] || '100')}
                                onChange={(e) => {
                                    const b = e.target.value
                                    const cur = (element.props.backdropFilter as string) || ''
                                    const blur = cur.match(/blur\([^)]+\)/)?.[0] || 'blur(12px)'
                                    const sat = cur.match(/saturate\([^)]+\)/)?.[0] || ''
                                    prop('backdropFilter', `${blur} brightness(${b}%)${sat ? ` ${sat}` : ''}`.trim())
                                }}
                                className="flex-1 accent-[var(--messmer-copper)]"
                            />
                            <span className="text-xs text-[var(--text-muted)] w-10">%</span>
                        </div>
                    </Row>
                    <Row>
                        <Label>Background image URL</Label>
                        <Inp value={(element.props.backgroundImage as string) ?? ''} placeholder="Paste any image link" onChange={(v) => prop('backgroundImage', v)} />
                    </Row>
                    <Row>
                        <Label>Image size</Label>
                        <select value={(element.props.backgroundSize as string) ?? 'cover'} onChange={(e) => prop('backgroundSize', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-[var(--messmer-ivory)]">
                            <option value="cover" className="bg-[#1a1714]">Cover</option>
                            <option value="contain" className="bg-[#1a1714]">Contain</option>
                            <option value="fill" className="bg-[#1a1714]">Fill</option>
                        </select>
                    </Row>
                    <Row>
                        <Label>Background (gradient)</Label>
                        <Inp value={(element.props.background as string) ?? ''} placeholder="linear-gradient(...)" onChange={(v) => prop('background', v)} />
                    </Row>
                    <Row>
                        <Label>Border Radius</Label>
                        <Inp value={(element.props.borderRadius as string) ?? '0'} onChange={(v) => prop('borderRadius', v)} />
                    </Row>
                    <Row>
                        <Label>Border</Label>
                        <Inp value={(element.props.border as string) ?? ''} onChange={(v) => prop('border', v)} />
                    </Row>
                    <ShadowRow
                        label="Box Shadow"
                        value={(element.props.boxShadow as string) ?? ''}
                        onChange={(v) => prop('boxShadow', v)}
                    />
                </Section>
            )}
        </div>
    )
}
