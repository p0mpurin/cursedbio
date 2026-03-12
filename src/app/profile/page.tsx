/**
 * Profile - User profile and info for bio page
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'
import ProfileInfoCard from '@/components/dashboard/ProfileInfoCard'

export default async function ProfilePage() {
  const { userId } = await auth()
  const user = await currentUser()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'
  if (!userId && !devAuth) redirect('/')

  const username = user?.username ?? user?.firstName ?? 'yourname'
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || username

  return (
    <div className="min-h-[calc(100vh-4rem)] landing-bg">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">My Profile</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Manage your info — it will appear in your bio page when you add text elements.
        </p>

        <section className="mb-10">
          <ProfileInfoCard defaultUsername={username} defaultDisplayName={displayName} />
        </section>

        <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 mb-8">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-4">
            Bio Page
          </h2>
          <Link
            href="/editor"
            className="text-[var(--accent-blue-soft)] hover:text-[var(--accent-blue)] hover:underline transition"
          >
            Edit your bio page →
          </Link>
        </section>

        <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-4">
            Dashboard
          </h2>
          <Link
            href="/dashboard"
            className="text-[var(--accent-blue-soft)] hover:text-[var(--accent-blue)] hover:underline transition"
          >
            Back to dashboard →
          </Link>
        </section>
      </div>
    </div>
  )
}
