/**
 * GET /api/auth/discord/callback - Handles Discord OAuth callback
 * Exchanges code for token, fetches user, stores in Clerk metadata
 */
import { auth, clerkClient } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

const TOKEN_URL = 'https://discord.com/api/oauth2/token'
const USER_URL = 'https://discord.com/api/users/@me'

export async function GET(req: Request) {
  const requestUrl = new URL(req.url)
  const origin = requestUrl.origin // use request origin so redirect stays on same port
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL(`/dashboard?discord_error=${errorParam}`, origin))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard?discord_error=missing_params', origin))
  }

  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
  } catch {
    return NextResponse.redirect(new URL('/dashboard?discord_error=invalid_state', origin))
  }

  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'
  const clerkUserId = (await auth()).userId
  if (!clerkUserId && !devAuth) {
    return NextResponse.redirect(new URL('/dashboard?discord_error=unauthorized', origin))
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const baseUrl = process.env.DISCORD_REDIRECT_URI || process.env.NEXT_PUBLIC_APP_URL || origin
  const redirectUri = baseUrl.includes('/api/') ? baseUrl : `${baseUrl}/api/auth/discord/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Discord app not configured' }, { status: 500 })
  }

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    console.error('Discord token error:', err)
    return NextResponse.redirect(new URL('/dashboard?discord_error=token_failed', origin))
  }

  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token as string

  const userRes = await fetch(USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!userRes.ok) {
    return NextResponse.redirect(new URL('/dashboard?discord_error=user_fetch_failed', origin))
  }

  const discordUser = await userRes.json()
  const avatarHash = discordUser.avatar as string | null
  const avatarUrl = avatarHash
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${avatarHash}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(discordUser.discriminator || '0') % 5}.png`

  const discordData = {
    id: discordUser.id,
    username: discordUser.username,
    global_name: discordUser.global_name ?? discordUser.username,
    avatar: avatarHash,
    avatar_url: avatarUrl,
    public_flags: discordUser.public_flags ?? 0,
    flags: discordUser.flags ?? 0,
    premium_type: discordUser.premium_type ?? 0,
  }

  if (clerkUserId) {
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { discord: discordData },
      })
    } catch (e) {
      console.error('Clerk metadata update failed:', e)
      return NextResponse.redirect(new URL('/dashboard?discord_error=save_failed', origin))
    }
  }
  // Dev auth: we'd need another store (e.g. localStorage) — for now redirect succeeds and /me will return null

  return NextResponse.redirect(new URL('/dashboard?discord=connected', origin))
}
