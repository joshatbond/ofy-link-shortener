import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="bg-neutral-800">
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-neutral-950 bg-gradient-to-r from-neutral-950 to-gray-700/20 px-4 py-24 md:flex-row md:gap-12 xl:gap-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Logo"
          className="hidden h-full w-full max-w-40 object-contain object-center md:block xl:max-w-60"
        />
        <div className="max-w-sm space-y-4">
          <h1 className="text-3xl">Link Shortening without the hassle.</h1>
          <p className="text-neutral-400">
            Your time is important, skip the wait and privacy concerns with
            ad-funded shorteners.
          </p>

          <Button
            asChild
            variant="link"
            className="w-full rounded bg-slate-700 px-3 py-2 text-lg font-semibold hover:bg-slate-600 focus-visible:bg-slate-600 active:bg-slate-600"
          >
            <a href="/login">Sign in to get started</a>
          </Button>
        </div>
      </div>
    </main>
  )
}
