import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import Link from 'next/link'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'ShortCuts',
  description: 'A simple link shortener',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
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
  )
}

function Header() {
  return (
    <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
      <nav className="flex flex-wrap items-center justify-between gap-4 p-4 font-semibold">
        <Link href="/">
          <span className="text-2xl">ShortCuts</span>
        </Link>

        <span className="rounded-md bg-gray-700 px-3 py-1 text-lg focus-within:bg-gray-500 hover:bg-gray-500 active:bg-gray-500">
          Sign In
        </span>
      </nav>
    </header>
  )
}
