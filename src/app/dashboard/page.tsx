/**
 * Dashboard - Hub for your bio page
 */
import { unstable_noStore } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'
import { supabaseAdmin } from '@/lib/db'
import ProfileInfoCard from '@/components/dashboard/ProfileInfoCard'
import DiscordConnectSection from '@/components/dashboard/DiscordConnectSection'
import UrlClaimSection from '@/components/dashboard/UrlClaimSection'
import { getAwardedPlatformBadges, PLATFORM_BADGE_DEFS } from '@/lib/platform-badges'

export default async function DashboardPage() {
  unstable_noStore() // Ensure fresh user data (e.g. after Discord disconnect)
  const { userId } = await auth()
  const user = await currentUser()
  const isDev = process.env.NODE_ENV === 'development'
  const devAuth = isDev && (await cookies()).get(DEV_AUTH_COOKIE)?.value === '1'
  if (!userId && !devAuth) redirect('/')

  const clerkId = userId ?? 'dev-user'
  let pageSlug: string = user?.username ?? user?.firstName ?? 'yourname'
  let usernameChangesUsed = 0
  if (supabaseAdmin) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, username_changes_used')
      .eq('clerk_user_id', clerkId)
      .single()
    if (profile?.username) {
      pageSlug = profile.username
      usernameChangesUsed = Number(profile.username_changes_used ?? 0)
    }
  }

  const username = user?.username ?? user?.firstName ?? 'yourname'
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || username
  const discord = (user?.publicMetadata?.discord ?? null) as {
    username?: string
    global_name?: string
    avatar_url?: string
  } | null
  const discordConnected = !!discord?.username
  const awardedBadges = getAwardedPlatformBadges(user?.publicMetadata?.platformBadges)
  const totalBadgeCount = Object.keys(PLATFORM_BADGE_DEFS).length

  return (
    <div className="min-h-[calc(100vh-4rem)] landing-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Dashboard
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            Your page:{' '}
            <Link href={`/${pageSlug}`} className="text-[var(--accent-blue-soft)] font-mono hover:underline" target="_blank" rel="noopener noreferrer">
              /{pageSlug}
            </Link>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/editor"
              className="px-6 py-3 rounded-xl bg-[var(--accent-blue)]/80 hover:bg-[var(--accent-blue)] text-white font-semibold transition shadow-[0_0_24px_rgba(59,130,246,0.2)] active:scale-[0.98]"
            >
              Edit Bio
            </Link>
            <Link
              href="/preview"
              className="px-6 py-3 rounded-xl border border-white/20 text-[var(--text-primary)] hover:bg-white/5 font-medium transition active:scale-[0.98]"
            >
              Preview
            </Link>
            <Link
              href="/help"
              className="px-6 py-3 rounded-xl border border-[var(--accent-blue)]/35 text-[var(--accent-blue-soft)] hover:bg-[var(--accent-blue)]/10 font-medium transition active:scale-[0.98]"
            >
              How to use
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Set up your profile here, then build your page in the editor
          </p>
        </section>

        {/* Your Info - editable profile data for the editor */}
        <section className="mb-12">
          <ProfileInfoCard defaultUsername={username} defaultDisplayName={displayName} />
        </section>

        {/* Loyalty badges - awarded only */}
        <section className="mb-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-2">Loyalty badges</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Badges are awarded by CursedBio. They are not custom or user-created.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/20 text-xs text-[var(--text-muted)]">
              {awardedBadges.length}/{totalBadgeCount} earned
            </div>
          </div>

          {awardedBadges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {awardedBadges.map((badge) => (
                <div key={badge.id} className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center border"
                    style={{
                      borderColor: `${badge.color ?? '#7a7aff'}88`,
                      background: `radial-gradient(circle at 30% 30%, ${(badge.color ?? '#7a7aff')}55 0%, rgba(14,14,18,0.92) 72%)`,
                      boxShadow: `0 6px 18px ${(badge.color ?? '#7a7aff')}33`,
                    }}
                  >
                    <img src={badge.src} alt={badge.tooltip} className="w-5 h-5 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{badge.tooltip}</p>
                    <p className="text-xs text-[var(--text-muted)]">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-black/25 border border-white/10 text-sm text-[var(--text-muted)]">
              No loyalty badges yet. Keep using CursedBio and supporting the platform to unlock them.
            </div>
          )}
        </section>

        {/* Discord connection - for Discord Profile element */}
        <section className="mb-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-3">Discord</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Link your Discord to display your avatar, username, and activity with the Discord Profile element.
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Status: {discordConnected ? 'Connected' : 'Not connected'}
          </p>
          <DiscordConnectSection
            discord={(user?.publicMetadata?.discord ?? null) as { username?: string; global_name?: string; avatar_url?: string } | null}
          />
        </section>

        {/* Page status & quick actions */}
        <section className="mb-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-4">Your page</h2>
          <div className="mb-6">
            <UrlClaimSection
              currentSlug={pageSlug}
              changesUsed={usernameChangesUsed}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Profile</p>
              <Link href="/profile" className="text-sm text-[var(--accent-blue-soft)] hover:underline">
                Manage →
              </Link>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Build your bio from scratch in the editor. Need a walkthrough? Use the help guide.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/editor" className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/15 hover:bg-[var(--accent-blue)]/25 border border-[var(--accent-blue)]/30 text-sm font-medium transition">
                Open editor
              </Link>
              <Link href="/preview" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-sm transition">
                Preview page
              </Link>
              <Link href="/help" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-sm transition">
                How to use
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
