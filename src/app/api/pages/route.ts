/**
 * POST /api/pages - Save page layout (requires auth)
 * GET /api/pages - Load current user's page layout
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { PageLayout, ResponsivePageLayout } from '@/lib/db'
import { supabaseAdmin } from '@/lib/db'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

async function getUserId(): Promise<string | null> {
  const { userId } = await auth()
  const cookieStore = await cookies()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && cookieStore.get(DEV_AUTH_COOKIE)?.value === '1'
  return userId ?? (devAuth ? 'dev-user' : null)
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { layout: PageLayout | ResponsivePageLayout }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body?.layout) {
    return NextResponse.json({ error: 'layout required' }, { status: 400 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({
      error: 'Persistence not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env',
    }, { status: 503 })
  }

  const user = await currentUser()
  const username = user?.username ?? user?.firstName ?? `user_${userId.replace(/^user_/, '').slice(0, 12)}`
  const slug = typeof username === 'string' ? username.toLowerCase().replace(/[^a-z0-9_-]/g, '_') : 'bio'

  try {
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    let profileId: string
    if (existingProfile) {
      profileId = existingProfile.id
      await supabaseAdmin.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', profileId)
    } else {
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          clerk_user_id: userId,
          username: slug || `user_${Date.now()}`,
          display_name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
          avatar_url: user?.imageUrl ?? null,
        })
        .select('id')
        .single()
      if (profileError) {
        if (profileError.code === '23505') {
          const { data: retry } = await supabaseAdmin.from('profiles').select('id').eq('clerk_user_id', userId).single()
          profileId = retry?.id ?? ''
        } else {
          throw profileError
        }
      } else {
        profileId = newProfile!.id
      }
    }

    const { error: pageError } = await supabaseAdmin
      .from('pages')
      .upsert(
        {
          profile_id: profileId,
          slug,
          title: 'My Bio',
          layout_json: body.layout,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id' }
      )

    if (pageError) throw pageError

    return NextResponse.json({ ok: true, message: 'Page saved' })
  } catch (e) {
    console.error('[api/pages POST]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to save' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ page: null, message: 'Persistence not configured' })
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ page: null })
    }

    const { data: page } = await supabaseAdmin
      .from('pages')
      .select('id, layout_json, slug, title')
      .eq('profile_id', profile.id)
      .single()

    if (!page?.layout_json) {
      return NextResponse.json({ page: null })
    }

    return NextResponse.json({ page: { layout: page.layout_json, slug: page.slug, title: page.title } })
  } catch (e) {
    console.error('[api/pages GET]', e)
    return NextResponse.json({ page: null })
  }
}
