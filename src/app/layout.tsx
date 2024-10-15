import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { getUserData } from '@/auth/server/getUser'
import { createUserFromAuth } from '@/server/db/actions'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'ShortCuts',
  description: 'A simple link shortener',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  getUserData()
    .then(user => {
      if (user) {
        void createUserFromAuth(user.id)
      }
    })
    .catch(console.error)

  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body className="bg-neutral-950 text-neutral-50">
        <div className="grid min-h-screen grid-rows-[auto_1fr]">
          {props.children}
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
