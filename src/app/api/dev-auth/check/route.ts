/**
 * Dev-only: returns whether dev auth cookie is set. For client-side auth checks.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ devAuth: false })
  }
  const cookieStore = await cookies()
  const devAuth = cookieStore.get(DEV_AUTH_COOKIE)?.value === '1'
  return NextResponse.json({ devAuth })
}
