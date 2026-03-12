/**
 * Next.js Middleware - Clerk Auth
 * Protects API routes and pages. Runs clerkMiddleware() for session/auth.
 * Uses keyless mode when no env vars are set (auto-generated temp keys).
 * Must be at src/middleware.ts when using src/ directory.
 */
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
