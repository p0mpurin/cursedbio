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
import SimpleLayoutsSection from '@/components/dashboard/SimpleLayoutsSection'
import ThemeTemplatesSection from '@/components/dashboard/ThemeTemplatesSection'
import TemplateGallery from '@/components/dashboard/TemplateGallery'
import UrlClaimSection from '@/components/dashboard/UrlClaimSection'
import { TEMPLATES } from '@/lib/editor/templates'

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

  return (
    <div className="min-h-[calc(100vh-4rem)] landing-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Your Bio Page
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
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Open the editor and click Preview to see your page live
          </p>
        </section>

        {/* Theme templates - pick template, fill settings, apply */}
        <ThemeTemplatesSection defaultUsername={username} defaultDisplayName={displayName} />

        {/* Simple layouts - pick one and fill in your info */}
        <section className="mb-12">
          <SimpleLayoutsSection defaultUsername={username} defaultDisplayName={displayName} />
        </section>

        {/* Quick templates - one-click to open editor with template */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-3">Quick templates</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Start from a template and customize in the editor.
          </p>
          <TemplateGallery templates={TEMPLATES} />
        </section>

        {/* Your Info - editable profile data for the editor */}
        <section className="mb-12">
          <ProfileInfoCard defaultUsername={username} defaultDisplayName={displayName} />
        </section>

        {/* Discord connection - for Discord Profile element */}
        <section className="mb-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-3">Discord</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Link your Discord to display your avatar, username, and badges on your bio page with the Discord Profile element.
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
            <p className="text-sm text-[var(--text-muted)] mb-4">Add text, images, and links in the editor. Your info above will appear when you add text elements.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/editor" className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/15 hover:bg-[var(--accent-blue)]/25 border border-[var(--accent-blue)]/30 text-sm font-medium transition">
                Open editor
              </Link>
              <Link href="/preview" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-sm transition">
                Preview page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
