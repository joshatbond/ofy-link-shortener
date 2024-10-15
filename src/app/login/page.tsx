import Link from 'next/link'

import HankoAuth from '@/auth/components/auth'

export default function LoginPage() {
  return (
    <>
      <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <nav className="flex flex-wrap items-center justify-between gap-4 p-4 font-semibold">
          <Link href="/">
            <span className="text-2xl">ShortCuts</span>
          </Link>
        </nav>
      </header>

      <div className="grid h-full place-content-center">
        <div className="card relative min-w-[320px] overflow-hidden rounded-xl p-4">
          <div className="gradient absolute inset-0"></div>

          <HankoAuth />
        </div>
      </div>
    </>
  )
}
