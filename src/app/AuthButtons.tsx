'use client'

/**
 * CTA buttons for landing - respects both Clerk and dev auth.
 * Fixed: proper button semantics, loading state, smooth interactions.
 */
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { SignUpButton } from '@clerk/nextjs'

const btnBase =
  'inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium transition-all duration-300 active:scale-95 hover:scale-105 cursor-pointer min-w-[180px] sm:min-w-0'
const btnPrimary =
  'bg-[var(--accent-blue)]/20 hover:bg-[var(--accent-blue)]/30 border border-[var(--accent-blue)]/40 text-[var(--text-primary)] hover:border-[var(--accent-blue)]/80 shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.15)] hover:shadow-[0_0_25px_rgba(var(--accent-blue-rgb),0.25)]'
const btnSecondary =
  'bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-primary)] hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'

type AuthButtonsProps = { devAuth?: boolean }

export function AuthButtons({ devAuth }: AuthButtonsProps) {
  const { isSignedIn, isLoaded } = useUser()
  const showSignedIn = devAuth || (isLoaded && isSignedIn)

  // Show signed-in UI when we know they're signed in; otherwise show Get Started immediately (no skeleton wait)
  if (showSignedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/editor" className={`${btnBase} ${btnPrimary}`}>
          Edit My Bio
        </Link>
        <Link href="/dashboard" className={`${btnBase} ${btnSecondary}`}>
          Dashboard
        </Link>
      </div>
    )
  }

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <SignUpButton mode="modal">
        <button type="button" className={`${btnBase} ${btnPrimary}`}>
          Get Started
        </button>
      </SignUpButton>
      {isDev && (
        <Link href="/api/dev-login" className={`${btnBase} ${btnSecondary} text-[var(--accent-blue-soft)]`}>
          Dev Login
        </Link>
      )}
    </div>
  )
}
