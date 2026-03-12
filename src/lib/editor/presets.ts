/**
 * CursedBio presets for themes, containers, buttons, text, animations, and CSS snippets
 */

export const THEME_PRESETS = [
  { id: 'dark', name: 'Dark', bg: '#0a0908', gradient: 'linear-gradient(180deg, #0a0908 0%, #1a1512 100%)' },
  { id: 'midnight', name: 'Midnight', bg: '#0c0a14', gradient: 'linear-gradient(160deg, #0c0a14 0%, #1a1625 60%, #0a0810 100%)' },
  { id: 'sepia', name: 'Sepia', bg: '#1a1510', gradient: 'linear-gradient(180deg, #2a2218 0%, #1a1510 100%)' },
  { id: 'ocean', name: 'Ocean', bg: '#0a1520', gradient: 'linear-gradient(180deg, #0a1520 0%, #0d2137 50%, #081018 100%)' },
  { id: 'forest', name: 'Forest', bg: '#0a140c', gradient: 'linear-gradient(180deg, #0a140c 0%, #142618 100%)' },
  { id: 'neon', name: 'Neon', bg: '#0a0a12', gradient: 'linear-gradient(135deg, #1a0a2e 0%, #0f3460 50%, #0a0a12 100%)' },
]

export const CONTAINER_PRESETS = [
  { id: 'glass', name: 'Glass', props: { backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px' } },
  { id: 'frosted', name: 'Frosted', props: { backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(18px) brightness(0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px' } },
  { id: 'solid', name: 'Solid', props: { backgroundColor: 'rgba(30,30,35,0.95)', backdropFilter: '', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' } },
  { id: 'gradient', name: 'Gradient', props: { background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', backgroundColor: 'transparent', backdropFilter: '', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' } },
  { id: 'bordered', name: 'Bordered', props: { backgroundColor: 'transparent', backdropFilter: '', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px' } },
]

export const BUTTON_PRESETS = [
  { id: 'ghost', name: 'Ghost', props: { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#f1f5f9' } },
  { id: 'glass', name: 'Glass', props: { backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#e5e7eb' } },
  { id: 'solid', name: 'Solid', props: { backgroundColor: '#525252', border: 'none', borderRadius: '10px', color: '#ffffff' } },
  { id: 'outline', name: 'Outline', props: { backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '10px', color: '#e5e7eb' } },
  { id: 'glow', name: 'Glow', props: { backgroundColor: 'rgba(255,200,100,0.15)', border: '1px solid rgba(255,200,100,0.3)', borderRadius: '10px', color: '#fcd34d', boxShadow: '0 0 20px rgba(255,200,100,0.2)' } },
]

export const TYPOGRAPHY_PRESETS = [
  { id: 'minimal', name: 'Minimal', props: { fontFamily: 'Inter', fontWeight: '400', fontSize: 16, color: '#e5e7eb', letterSpacing: 0 } },
  { id: 'bold', name: 'Bold', props: { fontFamily: 'Space Grotesk', fontWeight: '700', fontSize: 18, color: '#f1f5f9', letterSpacing: 0.5 } },
  { id: 'elegant', name: 'Elegant', props: { fontFamily: 'Playfair Display', fontWeight: '400', fontSize: 17, color: '#e5e5e5', letterSpacing: 0.5 } },
  { id: 'retro', name: 'Retro', props: { fontFamily: 'Courier Prime', fontWeight: '400', fontSize: 15, color: '#a3a3a3', letterSpacing: 1 } },
  { id: 'display', name: 'Display', props: { fontFamily: 'Bebas Neue', fontWeight: '400', fontSize: 24, color: '#ffffff', letterSpacing: 2 } },
]

export const ANIMATION_SNIPPETS = [
  { id: 'float', name: 'Float', css: '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}\n[data-element-id="{{id}}"]{animation:float 3s ease-in-out infinite}' },
  { id: 'fade-in', name: 'Fade in', css: '@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}\n[data-element-id="{{id}}"]{animation:fadeIn 0.6s ease-out forwards}' },
  { id: 'glow-pulse', name: 'Glow pulse', css: '@keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 8px rgba(255,200,100,0.5))}50%{filter:drop-shadow(0 0 20px rgba(255,200,100,0.8))}}\n[data-element-id="{{id}}"]{animation:glowPulse 2s ease-in-out infinite}' },
  { id: 'hover-lift', name: 'Hover lift', css: '[data-element-id="{{id}}"]{transition:transform 0.2s ease}\n[data-element-id="{{id}}"]:hover{transform:translateY(-4px)}' },
  { id: 'hover-scale', name: 'Hover scale', css: '[data-element-id="{{id}}"]{transition:transform 0.2s ease}\n[data-element-id="{{id}}"]:hover{transform:scale(1.05)}' },
]

export const CSS_SNIPPETS = [
  { id: 'glow-text', name: 'Glow text', css: '[data-element-id="name"]{text-shadow:0 0 12px rgba(255,200,100,0.6)}' },
  { id: 'hover-buttons', name: 'Hover all buttons', css: '[data-element-type="button"] a,[data-element-type="button"] button{transition:transform 0.2s ease}\n[data-element-type="button"] a:hover,[data-element-type="button"] button:hover{transform:translateY(-3px)}' },
  { id: 'card-shadow', name: 'Card shadow', css: '[data-element-id="card"]{box-shadow:0 20px 60px rgba(0,0,0,0.5)}' },
  { id: 'avatar-float', name: 'Avatar float', css: '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}\n[data-element-id="avatar"]{animation:float 3s ease-in-out infinite}' },
]

const FAVORITES_KEY = 'cursedbio-favorites'

export type FavoriteElement = { name: string; template: Omit<import('@/lib/db').PageElement, 'id'> }

export function getFavorites(): FavoriteElement[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addFavorite(name: string, element: import('@/lib/db').PageElement): void {
  const favs = getFavorites()
  const { id, ...rest } = element
  favs.push({ name, template: rest })
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  window.dispatchEvent(new CustomEvent('cursedbio-favorites-updated'))
}

export function removeFavorite(index: number): void {
  const favs = getFavorites().filter((_, i) => i !== index)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  window.dispatchEvent(new CustomEvent('cursedbio-favorites-updated'))
}
