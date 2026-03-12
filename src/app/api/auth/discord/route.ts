/**
 * GET /api/auth/discord - Redirect to Discord OAuth
 */
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

const DISCORD_OAUTH = 'https://discord.com/api/oauth2/authorize'

export async function GET(req: Request) {
  const { userId } = await auth()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'
  const origin = new URL(req.url).origin
  if (!userId && !devAuth) {
    return NextResponse.redirect(new URL('/', origin))
  }
  const clientId = process.env.DISCORD_CLIENT_ID
  // Use request origin so redirect stays on same port (fixes 3000 vs 3001)
  const redirectUri = `${origin}/api/auth/discord/callback`
  if (!clientId) {
    return NextResponse.json({ error: 'DISCORD_CLIENT_ID not configured' }, { status: 500 })
  }
  const state = Buffer.from(JSON.stringify({ userId: userId || 'dev' })).toString('base64url')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    state,
  })
  return NextResponse.redirect(`${DISCORD_OAUTH}?${params}`)
}
