const BOOTSTRAP_ICON_CDN = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/icons'
const icon = (name: string) => `${BOOTSTRAP_ICON_CDN}/${name}.svg`

export type PlatformBadge = {
  id: string
  src: string
  tooltip: string
  description: string
  color: string
}

export type AwardedBadge = {
  id: string
  awardedAt?: string
}

export const PLATFORM_BADGE_DEFS: Record<string, PlatformBadge> = {
  verified: {
    id: 'verified',
    src: icon('patch-check-fill'),
    tooltip: 'Verified',
    description: 'Given to trusted and verified accounts.',
    color: '#2f8cff',
  },
  early_user: {
    id: 'early_user',
    src: icon('clock-history'),
    tooltip: 'Early User',
    description: 'Awarded to early CursedBio adopters.',
    color: '#8f62ff',
  },
  premium: {
    id: 'premium',
    src: icon('gem'),
    tooltip: 'Premium',
    description: 'Awarded to premium supporters.',
    color: '#ff8a00',
  },
  staff: {
    id: 'staff',
    src: icon('person-badge-fill'),
    tooltip: 'Staff',
    description: 'Awarded to official CursedBio staff.',
    color: '#ff4d6d',
  },
  founder: {
    id: 'founder',
    src: icon('trophy-fill'),
    tooltip: 'Founder',
    description: 'Reserved for founding contributors and earliest builders.',
    color: '#ffd166',
  },
  partner: {
    id: 'partner',
    src: icon('people-fill'),
    tooltip: 'Partner',
    description: 'Awarded to official collaborators and partner communities.',
    color: '#00b4d8',
  },
  creator: {
    id: 'creator',
    src: icon('stars'),
    tooltip: 'Creator',
    description: 'Awarded to notable creators on the platform.',
    color: '#ff5ca8',
  },
  developer: {
    id: 'developer',
    src: icon('code-slash'),
    tooltip: 'Developer',
    description: 'Awarded to developers helping build or extend CursedBio.',
    color: '#43d17a',
  },
  supporter: {
    id: 'supporter',
    src: icon('heart-fill'),
    tooltip: 'Supporter',
    description: 'Awarded for long-term support and activity.',
    color: '#7a7aff',
  },
  booster: {
    id: 'booster',
    src: icon('rocket-takeoff-fill'),
    tooltip: 'Booster',
    description: 'Awarded to users who actively boost and promote CursedBio.',
    color: '#c77dff',
  },
  legend: {
    id: 'legend',
    src: icon('award-fill'),
    tooltip: 'Legend',
    description: 'Rare loyalty badge for exceptional contribution.',
    color: '#ffb703',
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
