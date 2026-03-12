'use client'

/**
 * Nav bar with Clerk auth + dev login bypass in development.
 */
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

type NavBarProps = {
  devAuth?: boolean
  isDev?: boolean
}

export default function NavBar({ devAuth, isDev }: NavBarProps) {
  const { isSignedIn } = useUser()
  const showSignedIn = devAuth || isSignedIn

  return (
    <header className="border-b border-white/5 bg-[var(--bg-primary)]/95 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-[var(--accent-blue-soft)] hover:text-[var(--accent-blue)] transition">
          CursedBio
        </Link>
        <div className="flex items-center gap-4">
          {showSignedIn ? (
            <>
              <Link href="/dashboard" className="text-sm hover:text-[var(--messmer-copper)] transition text-[var(--messmer-ivory)]">
                Dashboard
              </Link>
              <Link href="/editor" className="text-sm hover:text-[var(--accent-blue-soft)] transition text-[var(--text-primary)]">
                Edit Bio
              </Link>
              {devAuth && isDev ? (
                <Link
                  href="/api/dev-logout"
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent-blue)]/20 hover:bg-[var(--accent-blue)]/30 border border-[var(--accent-blue)]/40 text-[var(--text-primary)] text-sm transition"
                >
                  Dev Logout
                </Link>
              ) : (
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
              )}
            </>
          ) : (
            <>
              {isDev && (
                <Link
                  href="/api/dev-login"
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent-blue)]/20 hover:bg-[var(--accent-blue)]/30 border border-[var(--accent-blue)]/40 text-[var(--text-primary)] text-sm transition"
                >
                  Dev Login
                </Link>
              )}
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm text-[var(--text-primary)]">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/25 hover:bg-[var(--accent-blue)]/35 border border-[var(--accent-blue)]/40 text-[var(--text-primary)] transition text-sm">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
