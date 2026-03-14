import Link from 'next/link'

const FEATURES = [
  {
    title: 'Dashboard',
    description: 'Your setup hub for profile info, Discord connection, URL claim, and loyalty badges.',
    steps: [
      'Open Dashboard and complete your profile info first.',
      'Claim your page URL so people can find you at /yourname.',
      'Check Loyalty Badges to see what has been awarded to your account.',
    ],
  },
  {
    title: 'Editor',
    description: 'Build your page from scratch with drag, resize, and per-element properties.',
    steps: [
      'Use the left Elements panel to add text, images, links, and widgets.',
      'Click an element to edit style, spacing, and behavior in Properties.',
      'Use Undo/Redo while iterating, then save when finished.',
    ],
  },
  {
    title: 'Preview and Publish',
    description: 'Validate your page before sharing.',
    steps: [
      'Use Preview to check how your page looks live.',
      'Return to the editor to tweak anything that feels off.',
      'Share your claimed URL when you are happy with the result.',
    ],
  },
  {
    title: 'Discord Profile',
    description: 'Display your Discord avatar, username, and activity widgets on your page.',
    steps: [
      'Connect Discord from Dashboard.',
      'Add the Discord Profile element in the editor.',
      'Optionally enable activity and Spotify display in Properties.',
    ],
  },
  {
    title: 'Loyalty Badges',
    description: 'Award-only badges that represent trust, support, and milestones.',
    steps: [
      'Badges are awarded by CursedBio and cannot be custom-created.',
      'Track earned badges from the Dashboard Loyalty Badges section.',
      'Add the Loyalty Badges element in the editor to display earned badges on your page.',
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] landing-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            How to use CursedBio
          </h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            Everything you need to build, customize, and share your profile page.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h2 className="text-lg font-semibold text-[var(--accent-blue-soft)] mb-1">{feature.title}</h2>
              <p className="text-sm text-[var(--text-muted)] mb-3">{feature.description}</p>
              <ol className="list-decimal list-inside text-sm text-[var(--text-primary)] space-y-1">
                {feature.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <section className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="text-sm font-semibold text-[var(--accent-blue-soft)] uppercase tracking-wider mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-[var(--accent-blue)]/15 hover:bg-[var(--accent-blue)]/25 border border-[var(--accent-blue)]/30 text-sm font-medium transition">
              Open dashboard
            </Link>
            <Link href="/editor" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-sm transition">
              Open editor
            </Link>
            <Link href="/preview" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-sm transition">
              Preview page
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
