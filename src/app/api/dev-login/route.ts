/**
 * Dev-only: sets devAuth cookie and redirects. Use for testing without Clerk.
 * Only works when NODE_ENV=development.
 */
import { NextResponse } from 'next/server'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }

  const res = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  res.cookies.set(DEV_AUTH_COOKIE, '1', { path: '/', maxAge: 60 * 60 * 24 }) // 24h
  return res
}
