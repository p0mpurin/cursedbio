/**
 * Landing Page
 */
import Link from 'next/link'
import { cookies } from 'next/headers'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'
import { AuthButtons } from '@/app/AuthButtons'
import { LandingOrbs } from '@/components/landing/LandingOrbs'
import { LandingSerpent } from '@/components/landing/LandingSerpent'

export default async function HomePage() {
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 landing-bg relative">
      <LandingOrbs />
      <LandingSerpent />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h1 className="landing-title mb-8">
          <span className="block text-6xl md:text-7xl font-display tracking-[0.02em] text-[var(--messmer-ivory)]">
            <span className="landing-char" style={{ animationDelay: '0.05s' }}>C</span>
            <span className="landing-char" style={{ animationDelay: '0.1s' }}>u</span>
            <span className="landing-char" style={{ animationDelay: '0.15s' }}>r</span>
            <span className="landing-char" style={{ animationDelay: '0.2s' }}>s</span>
            <span className="landing-char" style={{ animationDelay: '0.25s' }}>e</span>
            <span className="landing-char" style={{ animationDelay: '0.3s' }}>d</span>
            <span className="landing-char text-[var(--accent-blue-soft)]" style={{ animationDelay: '0.35s' }}>B</span>
            <span className="landing-char text-[var(--accent-blue-soft)]" style={{ animationDelay: '0.4s' }}>i</span>
            <span className="landing-char text-[var(--accent-blue-soft)]" style={{ animationDelay: '0.45s' }}>o</span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-[var(--text-muted)] font-light mb-4 landing-reveal mix-blend-plus-lighter" style={{ animationDelay: '0.25s' }}>
          Make a link-in-bio, your way.
        </p>
        <p className="text-base text-[var(--text-muted)] mb-12 max-w-sm mx-auto landing-reveal opacity-70 font-light" style={{ animationDelay: '0.3s' }}>
          Drag and drop. Add whatever you want. Give it the vibe you actually like.
        </p>

        <div className="landing-reveal-delay">
          <AuthButtons devAuth={devAuth} />
        </div>
      </div>
    </div>
  )
}
