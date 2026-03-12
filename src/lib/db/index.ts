/**
 * Supabase client for CursedBio
 * Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * For server-side persistence (save/load bio), add SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Server-only client with service role (bypasses RLS). Use in API routes for save/load. */
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null

/** Profile row type */
export type Profile = {
  id: string
  clerk_user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio_text: string | null
  username_changes_used: number
  created_at: string
  updated_at: string
}

export const MAX_FREE_URL_CHANGES = 3

/** Responsive layout: desktop + mobile variants. Viewport >= breakpoint uses desktop. */
export type ResponsivePageLayout = {
  version: 3
  breakpoint?: number // px, default 768. Viewport >= this uses desktop
  desktop: PageLayout
  mobile: PageLayout
}

/** Page row type - layout_json matches PageLayout or ResponsivePageLayout */
export type Page = {
  id: string
  profile_id: string
  slug: string
  title: string
  layout_json: PageLayout | ResponsivePageLayout
  custom_css: string | null
  custom_js: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

/** PageLayout: JSON structure for visual page editor */
export type PageLayout = {
  version: number
  canvas: {
    width: number
    height: number
    /** 'solid' | 'gradient' | 'image' | 'video' */
    backgroundType?: 'solid' | 'gradient' | 'image' | 'video'
    backgroundColor?: string
    backgroundGradient?: string
    backgroundImage?: string
    backgroundImageSize?: 'cover' | 'contain' | 'fill'
    backgroundImagePosition?: string
    backgroundVideo?: string
    backgroundVideoMuted?: boolean
    /** Blur applied to the page background layer (px); 0 = none */
    backgroundBlur?: number
    pageTitle?: string
    customCss?: string
    /** When true, show click-to-enter overlay so unmuted audio can autoplay */
    clickToEnter?: boolean
    /** Click-to-enter screen customization */
    enterScreenTitle?: string
    enterScreenSubtitle?: string
    enterScreenBg?: string
    /** Backdrop blur (px) so bio is visible through the enter overlay; 0 = none */
    enterScreenBlur?: number
    /** Custom cursor URL (upload .cur or .png). Applied when viewing the bio. */
    customCursor?: string
    /** Hotspot X for cursor (px from top-left). Default 0. */
    customCursorHotspotX?: number
    /** Hotspot Y for cursor (px from top-left). Default 0. */
    customCursorHotspotY?: number
  }
  elements: PageElement[]
}

/** Single element on the page */
export type PageElement = {
  id: string
  /** Friendly name shown in layers panel */
  name?: string
  type: 'text' | 'image' | 'audio' | 'video' | 'embed' | 'shape' | 'div' | 'button' | 'profileViews' | 'discordProfile' | 'html'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  zIndex: number
  locked?: boolean
  visible?: boolean
  /** When set, element is rendered inside this container and tilts with it (view mode) */
  pinnedTo?: string
  props: Record<string, unknown>
  animations?: Array<{
    property: string
    from: string | number
    to: string | number
    duration: number
    delay?: number
    easing?: string
  }>
}
