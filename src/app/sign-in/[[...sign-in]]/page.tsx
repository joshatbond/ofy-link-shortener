import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="fixed inset-0 z-30 grid h-screen w-screen place-content-center">
      <div className="absolute inset-0 bg-black" />
      <div className="relative">
        <SignIn />
      </div>
    </div>
  )
}
