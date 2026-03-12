/**
 * Dev-only auth bypass for testing. Only active when NODE_ENV=development.
 * Use "Dev Login" /api/dev-login to bypass Clerk and test the app.
 */
export const DEV_AUTH_COOKIE = 'devAuth'

export function isDevAuthEnabled(): boolean {
  return process.env.NODE_ENV === 'development'
}
