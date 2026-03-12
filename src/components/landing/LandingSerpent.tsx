'use client'

/**
 * Serpentine decorative paths - Messmer-inspired, mesmerizing flow
 */
export function LandingSerpent() {
  return (
    <svg className="landing-serpent" aria-hidden viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <path d="M -50 250 C 150 180 350 320 550 250 S 950 180 1250 250" />
      <path d="M -50 450 C 200 380 400 520 600 450 S 1000 380 1250 450" />
      <path d="M -50 550 C 180 480 380 620 580 550 S 980 480 1250 550" />
    </svg>
  )
}
