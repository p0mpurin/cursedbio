/**
 * GET /api/platform-badges - Returns CursedBio platform badges for the current user.
 * Platform badges (verified, early_user, premium, staff) are awarded by the platform.
 * Set publicMetadata.platformBadges in Clerk to assign badges.
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

const BADGE_CDN = 'https://rawcdn.githack.com/merlinfuchs/discord-badges/main/SVG'
const PLATFORM_BADGE_DEFS: Record<string, { src: string; tooltip: string }> = {
  verified: { src: `${BADGE_CDN}/early_verified_developer.svg`, tooltip: 'Verified' },
  early_user: { src: `${BADGE_CDN}/early_supporter.svg`, tooltip: 'Early User' },
  premium: { src: `${BADGE_CDN}/nitro.svg`, tooltip: 'Premium' },
  staff: { src: `${BADGE_CDN}/staff.svg`, tooltip: 'Staff' },
}

export async function GET() {
  const { userId } = await auth()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'

  if (!userId && !devAuth) {
    return NextResponse.json({ badges: [] })
  }

  const user = await currentUser()
  const platformBadges = (user?.publicMetadata?.platformBadges ?? []) as string[]

  const badges = platformBadges
    .filter((id) => PLATFORM_BADGE_DEFS[id])
    .map((id) => {
      const def = PLATFORM_BADGE_DEFS[id]
      return { id, src: def.src, tooltip: def.tooltip }
    })

  return NextResponse.json({ badges })
}
