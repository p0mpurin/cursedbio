/**
 * Bio View Page - /[username]
 * Renders a user's published bio at site.com/username.
 * Loads layout from Supabase by profile username (or page slug).
 */
import BioPageView from '@/components/bio/BioPageView'
import { ClaimUrlCTA } from '@/components/bio/ClaimUrlCTA'
import { supabaseAdmin } from '@/lib/db'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'

type Props = { params: Promise<{ username: string }> }

export default async function BioPage({ params }: Props) {
  const { username } = await params
  const slug = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_') || 'bio'

  let layout: PageLayout | ResponsivePageLayout | null = null
  let customCss: string | null = null
  let customJs: string | null = null

  if (supabaseAdmin) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', slug)
      .single()

    if (profile) {
      const { data: page } = await supabaseAdmin
        .from('pages')
        .select('layout_json, custom_css, custom_js, is_published')
        .eq('profile_id', profile.id)
        .single()

      if (page?.is_published !== false && page?.layout_json) {
        layout = page.layout_json as PageLayout | ResponsivePageLayout
        customCss = page.custom_css ?? null
        customJs = page.custom_js ?? null
      }
    }
  }

  if (!layout) {
    return <ClaimUrlCTA username={slug} />
  }

  return (
    <BioPageView
      username={username}
      layout={layout}
      customCss={customCss}
      customJs={customJs}
    />
  )
}

