import HankoAuth from '@/auth/components/auth'

export default function LoginPage() {
  return (
    <div className="grid h-full place-content-center">
      <div className="card relative min-w-[320px] overflow-hidden rounded-xl p-4">
        <div className="gradient absolute inset-0"></div>

        <HankoAuth />
      </div>
    </div>
  )
}
