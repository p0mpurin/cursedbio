function makeBadgeSvgDataUri(label: string, bg: string, fg = '#ffffff'): string {
  const safeLabel = label.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase() || 'CB'
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#111111" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#g)" />
  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" />
  <text x="32" y="38" text-anchor="middle" font-size="16" font-family="Inter,Arial,sans-serif" font-weight="700" fill="${fg}">${safeLabel}</text>
</svg>
`.trim()
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

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
    src: makeBadgeSvgDataUri('VER', '#2f8cff'),
    tooltip: 'Verified',
    description: 'Given to trusted and verified accounts.',
  },
  early_user: {
    id: 'early_user',
    src: makeBadgeSvgDataUri('EAR', '#8f62ff'),
    tooltip: 'Early User',
    description: 'Awarded to early CursedBio adopters.',
  },
  premium: {
    id: 'premium',
    src: makeBadgeSvgDataUri('PRO', '#ff8a00'),
    tooltip: 'Premium',
    description: 'Awarded to premium supporters.',
  },
  staff: {
    id: 'staff',
    src: makeBadgeSvgDataUri('STF', '#ff4d6d'),
    tooltip: 'Staff',
    description: 'Awarded to official CursedBio staff.',
  },
  founder: {
    id: 'founder',
    src: makeBadgeSvgDataUri('FND', '#ffd166', '#222222'),
    tooltip: 'Founder',
    description: 'Reserved for founding contributors and earliest builders.',
  },
  partner: {
    id: 'partner',
    src: makeBadgeSvgDataUri('PRT', '#00b4d8'),
    tooltip: 'Partner',
    description: 'Awarded to official collaborators and partner communities.',
  },
  creator: {
    id: 'creator',
    src: makeBadgeSvgDataUri('CRT', '#ff5ca8'),
    tooltip: 'Creator',
    description: 'Awarded to notable creators on the platform.',
  },
  developer: {
    id: 'developer',
    src: makeBadgeSvgDataUri('DEV', '#43d17a'),
    tooltip: 'Developer',
    description: 'Awarded to developers helping build or extend CursedBio.',
  },
  supporter: {
    id: 'supporter',
    src: makeBadgeSvgDataUri('SUP', '#7a7aff'),
    tooltip: 'Supporter',
    description: 'Awarded for long-term support and activity.',
  },
  booster: {
    id: 'booster',
    src: makeBadgeSvgDataUri('BST', '#c77dff'),
    tooltip: 'Booster',
    description: 'Awarded to users who actively boost and promote CursedBio.',
  },
  legend: {
    id: 'legend',
    src: makeBadgeSvgDataUri('LGD', '#ffb703', '#222222'),
    tooltip: 'Legend',
    description: 'Rare loyalty badge for exceptional contribution.',
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
