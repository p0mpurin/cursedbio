/**
 * Root Layout - CursedBio
 */
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { cookies } from 'next/headers'
import { DEV_AUTH_COOKIE } from '@/lib/dev-auth'
import NavOrSkip from '@/components/NavOrSkip'
import CopyToast from '@/components/CopyToast'
import './globals.css'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'CursedBio',
  description: 'Customizable social bio pages',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isDev = process.env.NODE_ENV === 'development'
  const cookieStore = await cookies()
  const devAuth = isDev && cookieStore.get(DEV_AUTH_COOKIE)?.value === '1'

  return (
    <html lang="en" className={cormorant.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&family=Nunito:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Merriweather:wght@400;700&family=Ubuntu:wght@400;500;700&family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@400;600;700&family=Josefin+Sans:wght@400;600;700&family=Libre+Baskerville:wght@400;700&family=Cinzel:wght@400;600&family=Dancing+Script:wght@400;700&family=Bebas+Neue&family=Press+Start+2P&family=Courier+Prime:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased font-sans">
        <ClerkProvider>
          <NavOrSkip devAuth={devAuth} isDev={isDev} />
          <main>{children}</main>
          <CopyToast />
        </ClerkProvider>
      </body>
    </html>
  )
}
