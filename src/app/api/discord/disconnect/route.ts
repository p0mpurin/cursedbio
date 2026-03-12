/**
 * POST /api/discord/disconnect - Removes Discord from user's Clerk metadata
 */
import { auth, clerkClient } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

export async function POST(req: Request) {
  const { userId } = await auth()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'
  if (!userId && !devAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!userId) {
    return NextResponse.json({ error: 'Discord disconnect requires Clerk auth' }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const metadata = (user.publicMetadata ?? {}) as Record<string, unknown>
    const { discord, ...rest } = metadata
    if (!discord) {
      return NextResponse.json({ ok: true })
    }
    // updateUser overrides metadata (unlike updateUserMetadata which merges) - guarantees discord is removed
    await client.users.updateUser(userId, { publicMetadata: rest })
  } catch (e) {
    console.error('Discord disconnect failed:', e)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
