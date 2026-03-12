/**
 * GET /api/discord/me - Returns current user's Discord info (for Discord Profile element)
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

/** Discord public flags bitmask → badge labels */
const BADGE_FLAGS: Record<number, string> = {
  1: 'staff',
  2: 'partner',
  4: 'hypesquad',
  8: 'bug_hunter_1',
  64: 'hypesquad_bravery',
  128: 'hypesquad_brilliance',
  256: 'hypesquad_balance',
  512: 'early_supporter',
  16384: 'bug_hunter_2',
  131072: 'verified_dev',
  262144: 'certified_mod',
  4194304: 'active_developer',
}

function getBadges(publicFlags: number): string[] {
  const badges: string[] = []
  for (const [bit, label] of Object.entries(BADGE_FLAGS)) {
    if ((publicFlags & Number(bit)) !== 0) badges.push(label)
  }
  return badges
}

export async function GET() {
  const { userId } = await auth()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'

  if (!userId && !devAuth) {
    return NextResponse.json({ discord: null })
  }

  const user = await currentUser()
  const discord = (user?.publicMetadata?.discord ?? null) as {
    id?: string
    username?: string
    global_name?: string
    avatar?: string
    avatar_url?: string
    public_flags?: number
    flags?: number
    premium_type?: number
  } | null

  if (!discord?.id) {
    return NextResponse.json({ discord: null })
  }

  const allFlags = (Number(discord.public_flags) || 0) | (Number(discord.flags) || 0)
  const badges = getBadges(allFlags)
  const premiumType = Number(discord.premium_type) || 0
  if (premiumType === 1) badges.push('nitro_classic')
  else if (premiumType === 2) badges.push('nitro')
  else if (premiumType === 3) badges.push('nitro_basic')

  return NextResponse.json({
    discord: {
      id: discord.id,
      username: discord.username,
      global_name: discord.global_name ?? discord.username,
      avatar_url: discord.avatar_url ?? `https://cdn.discordapp.com/embed/avatars/0.png`,
      badges,
    },
  })
}
