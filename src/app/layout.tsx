import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import '@/styles/globals.css'

import { Redirector } from './_components/HeaderRedirect'

export const metadata: Metadata = {
  title: 'ShortCuts',
  description: 'A simple link shortener',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="bg-neutral-950 text-neutral-50">
          <div className="grid min-h-screen grid-rows-[auto_1fr]">
            <Header />
            {children}
          </div>
          <footer className="border-t border-t-neutral-700 p-4">
            <p className="text-end">
              &copy; {`${new Date().getFullYear()} J. Richardson`}
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}

async function Header() {
  return (
    <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
      <Redirector />
      <nav className="flex flex-wrap items-center justify-between gap-4 p-4 font-semibold">
        <Link href="/">
          <span className="text-2xl">ShortCuts</span>
        </Link>

        <SignedOut>
          <SignInButton forceRedirectUrl="/dashboard" />
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  )
}
