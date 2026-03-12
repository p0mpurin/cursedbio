/**
 * POST /api/claim-url - Claim or change your page URL (username). Max 3 free changes per account.
 */
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin, MAX_FREE_URL_CHANGES } from '@/lib/db'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

const SLUG_MIN = 2
const SLUG_MAX = 32
const SLUG_REG = /^[a-z0-9_-]+$/

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

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

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Persistence not configured' },
      { status: 503 }
    )
  }

  let body: { username: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = typeof body?.username === 'string' ? body.username.trim() : ''
  const slug = normalizeSlug(raw)

  if (slug.length < SLUG_MIN) {
    return NextResponse.json(
      { error: `URL must be at least ${SLUG_MIN} characters` },
      { status: 400 }
    )
  }
  if (slug.length > SLUG_MAX) {
    return NextResponse.json(
      { error: `URL must be at most ${SLUG_MAX} characters` },
      { status: 400 }
    )
  }
  if (!SLUG_REG.test(slug)) {
    return NextResponse.json(
      { error: 'URL can only use letters, numbers, underscores, and hyphens' },
      { status: 400 }
    )
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, username_changes_used')
      .eq('clerk_user_id', userId)
      .maybeSingle()

    let profileId: string
    let currentUsername: string
    let usedForLimit: number

    if (profile) {
      profileId = profile.id
      currentUsername = profile.username
      usedForLimit = Number(profile.username_changes_used ?? 0)
    } else {
      // No profile yet: create one with the requested slug so user can claim without saving first
      const { data: newProfile, error: createErr } = await supabaseAdmin
        .from('profiles')
        .insert({
          clerk_user_id: userId,
          username: slug,
          username_changes_used: 0,
        })
        .select('id')
        .single()
      if (createErr) {
        if (createErr.code === '23505') {
          return NextResponse.json({ error: 'That URL is already taken' }, { status: 409 })
        }
        throw createErr
      }
      profileId = newProfile!.id
      currentUsername = slug
      usedForLimit = 0
      await supabaseAdmin.from('pages').insert({
        profile_id: profileId,
        slug,
        title: 'My Bio',
        layout_json: { version: 1, blocks: [] },
        updated_at: new Date().toISOString(),
      })
      return NextResponse.json({
        username: slug,
        changesRemaining: MAX_FREE_URL_CHANGES - 1,
      })
    }

    if (usedForLimit >= MAX_FREE_URL_CHANGES) {
      return NextResponse.json(
        { error: `You've used all ${MAX_FREE_URL_CHANGES} free URL changes` },
        { status: 403 }
      )
    }

    if (currentUsername === slug) {
      return NextResponse.json({ username: slug, message: 'No change' })
    }

    const { data: taken } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', slug)
      .maybeSingle()

    if (taken) {
      return NextResponse.json({ error: 'That URL is already taken' }, { status: 409 })
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        username: slug,
        username_changes_used: usedForLimit + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    await supabaseAdmin
      .from('pages')
      .update({ slug, updated_at: new Date().toISOString() })
      .eq('profile_id', profileId)

    return NextResponse.json({
      username: slug,
      changesRemaining: MAX_FREE_URL_CHANGES - usedForLimit - 1,
    })
  } catch (e) {
    console.error('[api/claim-url]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to claim URL' },
      { status: 500 }
    )
  }
}
