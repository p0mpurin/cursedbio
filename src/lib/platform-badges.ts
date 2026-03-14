const BADGE_CDN = 'https://rawcdn.githack.com/merlinfuchs/discord-badges/main/SVG'

export type PlatformBadge = {
  id: string
  src: string
  tooltip: string
  description: string
}

export type AwardedBadge = {
  id: string
  awardedAt?: string
}

export const PLATFORM_BADGE_DEFS: Record<string, PlatformBadge> = {
  verified: {
    id: 'verified',
    src: `${BADGE_CDN}/early_verified_developer.svg`,
    tooltip: 'Verified',
    description: 'Given to trusted and verified accounts.',
  },
  early_user: {
    id: 'early_user',
    src: `${BADGE_CDN}/early_supporter.svg`,
    tooltip: 'Early User',
    description: 'Awarded to early CursedBio adopters.',
  },
  premium: {
    id: 'premium',
    src: `${BADGE_CDN}/nitro.svg`,
    tooltip: 'Premium',
    description: 'Awarded to premium supporters.',
  },
  staff: {
    id: 'staff',
    src: `${BADGE_CDN}/staff.svg`,
    tooltip: 'Staff',
    description: 'Awarded to official CursedBio staff.',
  },
}

export function normalizeAwardedBadges(raw: unknown): AwardedBadge[] {
  if (!Array.isArray(raw)) return []
  const out: AwardedBadge[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (typeof item === 'string') {
      const id = item.trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push({ id })
      continue
    }
    if (item && typeof item === 'object') {
      const maybe = item as { id?: unknown; awardedAt?: unknown; awarded_at?: unknown }
      const id = typeof maybe.id === 'string' ? maybe.id.trim() : ''
      if (!id || seen.has(id)) continue
      const awardedAtRaw = typeof maybe.awardedAt === 'string'
        ? maybe.awardedAt
        : (typeof maybe.awarded_at === 'string' ? maybe.awarded_at : undefined)
      seen.add(id)
      out.push({
        id,
        awardedAt: awardedAtRaw,
      })
    }
  }
  return out
}

export function getAwardedPlatformBadges(raw: unknown): Array<PlatformBadge & { awardedAt?: string }> {
  return normalizeAwardedBadges(raw)
    .filter((badge) => PLATFORM_BADGE_DEFS[badge.id])
    .map((badge) => ({
      ...PLATFORM_BADGE_DEFS[badge.id],
      awardedAt: badge.awardedAt,
    }))
}
