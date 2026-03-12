'use client'

/**
 * ClaimUrlCTA - Beautiful 404 page for unclaimed URLs
 */
import Link from 'next/link'
import { LandingOrbs } from '@/components/landing/LandingOrbs'
import { LandingSerpent } from '@/components/landing/LandingSerpent'

export function ClaimUrlCTA({ username }: { username: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 landing-bg relative overflow-hidden">
      <LandingOrbs />
      <LandingSerpent />

      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
        
        {/* Decorative 404 Header */}
        <h1 className="landing-title mb-6">
          <span className="block text-4xl md:text-5xl font-display tracking-[0.02em] text-[var(--messmer-ivory)] opacity-90">
            <span className="landing-char" style={{ animationDelay: '0.05s' }}>4</span>
            <span className="landing-char" style={{ animationDelay: '0.1s' }}>0</span>
            <span className="landing-char" style={{ animationDelay: '0.15s' }}>4</span>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[var(--text-muted)] font-light mb-8 landing-reveal max-w-lg" style={{ animationDelay: '0.2s' }}>
          Lost in the void.
        </p>

        <div className="landing-reveal bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-xl" style={{ animationDelay: '0.3s' }}>
          <p className="text-lg text-[var(--text-primary)] mb-6">
            The url <span className="font-mono text-[var(--messmer-copper)] bg-[var(--messmer-copper)]/10 px-2 py-1 rounded-md">/{username}</span> is available.
          </p>
          
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer w-full sm:w-auto bg-[var(--accent-blue)]/25 hover:bg-[var(--accent-blue)]/35 border border-[var(--accent-blue)]/50 text-[var(--text-primary)] hover:border-[var(--accent-blue)]/70 shadow-[0_0_20px_rgba(var(--accent-blue-rgb),0.1)] hover:shadow-[0_0_25px_rgba(var(--accent-blue-rgb),0.2)]"
          >
            Claim {username}
          </Link>
        </div>
      </div>

      <div className="mt-24 text-sm text-[var(--text-muted)] relative z-10 opacity-70 hover:opacity-100 transition-opacity">
        <Link href="/">Return home</Link>
      </div>
    </div>
  )
}
