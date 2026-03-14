/**
 * GET /api/platform-badges - Returns awarded loyalty badges for the current user.
 * Badges are awarded by platform/admin via Clerk publicMetadata.platformBadges.
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'
import { getAwardedPlatformBadges } from '@/lib/platform-badges'

export async function GET() {
  const { userId } = await auth()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'

  if (!userId && !devAuth) {
    return NextResponse.json({ badges: [] })
  }

  const user = await currentUser()
  const badges = getAwardedPlatformBadges(user?.publicMetadata?.platformBadges)

  return NextResponse.json({ badges })
}
