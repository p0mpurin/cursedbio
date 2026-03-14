'use client'

/**
 * Renders NavBar except on bio view routes (username pages, preview) where the page is full-viewport.
 */
import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

const SHOW_NAV_PATHS = ['/', '/dashboard', '/editor', '/profile', '/help']

type Props = { devAuth?: boolean; isDev?: boolean }

export default function NavOrSkip({ devAuth, isDev }: Props) {
  const pathname = usePathname()
  if (!pathname) return <NavBar devAuth={devAuth} isDev={isDev} />
  if (SHOW_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return <NavBar devAuth={devAuth} isDev={isDev} />
  return null
}
